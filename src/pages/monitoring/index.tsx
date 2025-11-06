import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import NetworkStats from "./components/NetworkStats";
import DeviceList from "./components/DeviceList";
import DeviceFormDialog from "./components/DeviceFormDialog";
import DowntimeChart from "./components/DowntimeChart";
import { NetworkDevice, DowntimeLog, DeviceFilters } from "./types";

const Monitoring = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [downtimeLogs, setDowntimeLogs] = useState<DowntimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState<DeviceFilters>({
    status: 'all',
    connectionType: 'all',
    search: ''
  });

  const fetchDevices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('network_devices')
        .select(`
          *,
          technician:profiles!network_devices_technician_id_fkey(full_name)
        `)
        .order('device_name');
      
      if (error) throw error;
      setDevices((data || []) as NetworkDevice[]);
    } catch (error: any) {
      toast.error('Failed to fetch devices');
      console.error(error);
    }
  }, []);

  const fetchDowntimeLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('downtime_logs')
        .select('*')
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      setDowntimeLogs((data || []) as DowntimeLog[]);
    } catch (error: any) {
      console.error('Failed to fetch downtime logs:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchDevices(), fetchDowntimeLogs()]);
    setLoading(false);
  }, [fetchDevices, fetchDowntimeLogs]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        fetchData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchData]);

  const handlePingDevice = async (deviceId: string) => {
    if (!user) return;

    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    try {
      // Simulate ping - randomly set Online/Offline
      const newStatus = Math.random() > 0.3 ? 'Online' : 'Offline';
      const wasOnline = device.status === 'Online';
      const nowOnline = newStatus === 'Online';

      // Update device status
      const { error: updateError } = await supabase
        .from('network_devices')
        .update({ 
          status: newStatus, 
          last_ping: new Date().toISOString() 
        })
        .eq('id', deviceId);

      if (updateError) throw updateError;

      // Handle downtime logging
      if (wasOnline && !nowOnline) {
        // Device went offline - create new downtime log
        const { error: insertError } = await supabase
          .from('downtime_logs')
          .insert({
            device_id: deviceId,
            start_time: new Date().toISOString(),
            reason: 'Connection lost during ping'
          });
        
        if (insertError) throw insertError;
        toast.warning(`${device.device_name} went offline`);
      } else if (!wasOnline && nowOnline) {
        // Device came online - close any open downtime logs
        const { data: openLogs } = await supabase
          .from('downtime_logs')
          .select('*')
          .eq('device_id', deviceId)
          .is('end_time', null);

        if (openLogs && openLogs.length > 0) {
          const { error: closeError } = await supabase
            .from('downtime_logs')
            .update({ end_time: new Date().toISOString() })
            .eq('id', openLogs[0].id);
          
          if (closeError) throw closeError;
        }
        toast.success(`${device.device_name} is back online`);
      } else {
        toast.success(`Ping successful - ${device.device_name} is ${newStatus}`);
      }

      await fetchData();
    } catch (error: any) {
      toast.error('Failed to ping device');
      console.error(error);
    }
  };

  const handleAddDevice = () => {
    setSelectedDevice(null);
    setDialogOpen(true);
  };

  const handleEditDevice = (device: NetworkDevice) => {
    setSelectedDevice(device);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading network devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Network & Connectivity Monitoring</h1>
          <p className="text-muted-foreground">Real-time network device monitoring and management</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 pt-0 space-y-6">
        <NetworkStats devices={devices} />
        
        <DeviceList
          devices={devices}
          filters={filters}
          onFiltersChange={setFilters}
          onAddDevice={handleAddDevice}
          onEditDevice={handleEditDevice}
          onRefresh={fetchData}
          onPingDevice={handlePingDevice}
        />

        <DowntimeChart downtimeLogs={downtimeLogs} />
      </div>

      <DeviceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        device={selectedDevice}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Monitoring;
