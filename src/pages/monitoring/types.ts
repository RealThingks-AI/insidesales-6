export interface NetworkDevice {
  id: string;
  device_name: string;
  ip_address: string;
  mac_address: string | null;
  connection_type: 'LAN' | 'Wi-Fi' | 'VPN';
  status: 'Online' | 'Offline';
  last_ping: string | null;
  location: string | null;
  technician_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  technician?: {
    full_name: string;
  };
}

export interface DowntimeLog {
  id: string;
  device_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  reason: string | null;
  created_at: string;
}

export interface DeviceFilters {
  status: 'all' | 'Online' | 'Offline';
  connectionType: 'all' | 'LAN' | 'Wi-Fi' | 'VPN';
  search: string;
}
