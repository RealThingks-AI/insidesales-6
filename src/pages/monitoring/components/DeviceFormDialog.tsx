import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NetworkDevice } from "../types";
import { useAuth } from "@/hooks/useAuth";

interface DeviceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: NetworkDevice | null;
  onSuccess: () => void;
}

export default function DeviceFormDialog({ open, onOpenChange, device, onSuccess }: DeviceFormDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState<{ user_id: string; full_name: string }[]>([]);
  
  const [formData, setFormData] = useState({
    device_name: '',
    ip_address: '',
    mac_address: '',
    connection_type: 'LAN' as 'LAN' | 'Wi-Fi' | 'VPN',
    location: '',
    technician_id: '',
    notes: ''
  });

  useEffect(() => {
    if (device) {
      setFormData({
        device_name: device.device_name,
        ip_address: device.ip_address,
        mac_address: device.mac_address || '',
        connection_type: device.connection_type,
        location: device.location || '',
        technician_id: device.technician_id || '',
        notes: device.notes || ''
      });
    } else {
      setFormData({
        device_name: '',
        ip_address: '',
        mac_address: '',
        connection_type: 'LAN',
        location: '',
        technician_id: '',
        notes: ''
      });
    }
  }, [device]);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('role', ['tech_lead', 'admin']);
    
    if (data) setTechnicians(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const deviceData = {
        ...formData,
        technician_id: formData.technician_id || null,
        mac_address: formData.mac_address || null,
        location: formData.location || null,
        notes: formData.notes || null
      };

      if (device) {
        const { error } = await supabase
          .from('network_devices')
          .update(deviceData)
          .eq('id', device.id);
        
        if (error) throw error;
        toast.success('Device updated successfully');
      } else {
        const { error } = await supabase
          .from('network_devices')
          .insert({ ...deviceData, created_by: user.id });
        
        if (error) throw error;
        toast.success('Device added successfully');
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{device ? 'Edit Device' : 'Add New Device'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="device_name">Device Name *</Label>
              <Input
                id="device_name"
                value={formData.device_name}
                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip_address">IP Address *</Label>
              <Input
                id="ip_address"
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                placeholder="192.168.1.1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mac_address">MAC Address</Label>
              <Input
                id="mac_address"
                value={formData.mac_address}
                onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                placeholder="00:1B:44:11:3A:B7"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="connection_type">Connection Type *</Label>
              <Select
                value={formData.connection_type}
                onValueChange={(value: any) => setFormData({ ...formData, connection_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LAN">LAN</SelectItem>
                  <SelectItem value="Wi-Fi">Wi-Fi</SelectItem>
                  <SelectItem value="VPN">VPN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Office Floor 2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technician_id">Assigned Technician</Label>
              <Select
                value={formData.technician_id || "none"}
                onValueChange={(value) => setFormData({ ...formData, technician_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.user_id} value={tech.user_id}>
                      {tech.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : device ? 'Update' : 'Add Device'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
