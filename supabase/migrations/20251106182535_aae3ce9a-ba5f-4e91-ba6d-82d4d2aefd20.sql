-- Create network_devices table
CREATE TABLE IF NOT EXISTS public.network_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  mac_address TEXT,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('LAN', 'Wi-Fi', 'VPN')),
  status TEXT NOT NULL DEFAULT 'Offline' CHECK (status IN ('Online', 'Offline')),
  last_ping TIMESTAMP WITH TIME ZONE,
  location TEXT,
  technician_id UUID REFERENCES public.profiles(user_id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(user_id) NOT NULL
);

-- Create downtime_logs table
CREATE TABLE IF NOT EXISTS public.downtime_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.network_devices(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN end_time IS NOT NULL THEN EXTRACT(EPOCH FROM (end_time - start_time)) / 60
      ELSE NULL
    END
  ) STORED,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.network_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downtime_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for network_devices
CREATE POLICY "Tech leads and above can view network devices"
  ON public.network_devices FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'tech_lead'::app_role) OR 
    has_role(auth.uid(), 'management'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Tech leads and admins can manage network devices"
  ON public.network_devices FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'tech_lead'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- RLS Policies for downtime_logs
CREATE POLICY "Tech leads and above can view downtime logs"
  ON public.downtime_logs FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'tech_lead'::app_role) OR 
    has_role(auth.uid(), 'management'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "System can insert downtime logs"
  ON public.downtime_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Tech leads and admins can update downtime logs"
  ON public.downtime_logs FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'tech_lead'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Create indexes for better performance
CREATE INDEX idx_network_devices_status ON public.network_devices(status);
CREATE INDEX idx_network_devices_connection_type ON public.network_devices(connection_type);
CREATE INDEX idx_downtime_logs_device_id ON public.downtime_logs(device_id);
CREATE INDEX idx_downtime_logs_start_time ON public.downtime_logs(start_time);

-- Create trigger to update updated_at
CREATE TRIGGER update_network_devices_updated_at
  BEFORE UPDATE ON public.network_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();