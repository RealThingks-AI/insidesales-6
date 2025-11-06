import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Activity, Search } from "lucide-react";
import { NetworkDevice, DeviceFilters } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeviceListProps {
  devices: NetworkDevice[];
  filters: DeviceFilters;
  onFiltersChange: (filters: DeviceFilters) => void;
  onAddDevice: () => void;
  onEditDevice: (device: NetworkDevice) => void;
  onRefresh: () => void;
  onPingDevice: (deviceId: string) => void;
}

export default function DeviceList({ 
  devices, 
  filters, 
  onFiltersChange, 
  onAddDevice, 
  onEditDevice,
  onRefresh,
  onPingDevice
}: DeviceListProps) {
  const [deleteDevice, setDeleteDevice] = useState<NetworkDevice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteDevice) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('network_devices')
        .delete()
        .eq('id', deleteDevice.id);
      
      if (error) throw error;
      toast.success('Device deleted successfully');
      onRefresh();
      setDeleteDevice(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const filteredDevices = devices.filter(device => {
    if (filters.status !== 'all' && device.status !== filters.status) return false;
    if (filters.connectionType !== 'all' && device.connection_type !== filters.connectionType) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return device.device_name.toLowerCase().includes(searchLower) ||
             device.ip_address.toLowerCase().includes(searchLower);
    }
    return true;
  });

  // Count downtimes for each device
  const getDowntimeCount = (device: NetworkDevice) => {
    // This would normally query downtime_logs, but for now we'll show 0
    return 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-2 flex-1 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by device name or IP..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value: any) => onFiltersChange({ ...filters, status: value })}
          >
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.connectionType}
            onValueChange={(value: any) => onFiltersChange({ ...filters, connectionType: value })}
          >
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="LAN">LAN</SelectItem>
              <SelectItem value="Wi-Fi">Wi-Fi</SelectItem>
              <SelectItem value="VPN">VPN</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddDevice}>
          <Plus className="h-4 w-4 mr-2" />
          Add Device
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device Name</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>MAC Address</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Ping</TableHead>
              <TableHead>Downtime Count</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No devices found
                </TableCell>
              </TableRow>
            ) : (
              filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.device_name}</TableCell>
                  <TableCell className="font-mono text-sm">{device.ip_address}</TableCell>
                  <TableCell className="font-mono text-sm">{device.mac_address || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{device.connection_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={device.status === 'Online' ? 'default' : 'destructive'}>
                      {device.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {device.last_ping ? format(new Date(device.last_ping), 'MMM dd, HH:mm') : 'Never'}
                  </TableCell>
                  <TableCell>{getDowntimeCount(device)}</TableCell>
                  <TableCell>{device.technician?.full_name || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPingDevice(device.id)}
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditDevice(device)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDevice(device)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteDevice} onOpenChange={() => setDeleteDevice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDevice?.device_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
