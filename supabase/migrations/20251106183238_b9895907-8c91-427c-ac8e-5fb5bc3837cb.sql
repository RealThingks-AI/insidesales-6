-- Create it_policies table
CREATE TABLE IF NOT EXISTS public.it_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id TEXT NOT NULL UNIQUE,
  policy_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(user_id),
  department TEXT,
  review_frequency TEXT NOT NULL CHECK (review_frequency IN ('Monthly', 'Quarterly', 'Yearly')),
  last_review_date DATE,
  next_review_date DATE,
  status TEXT NOT NULL DEFAULT 'Under Review' CHECK (status IN ('Compliant', 'Non-Compliant', 'Under Review')),
  attachments JSONB DEFAULT '[]'::jsonb,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.profiles(user_id) NOT NULL
);

-- Create storage bucket for policy documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('policy-documents', 'policy-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on it_policies
ALTER TABLE public.it_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for it_policies
CREATE POLICY "Everyone can view policies"
  ON public.it_policies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Management and admins can manage policies"
  ON public.it_policies FOR ALL
  TO authenticated
  USING (
    has_role(auth.uid(), 'management'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Storage policies for policy-documents bucket
CREATE POLICY "Users can view policy documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'policy-documents');

CREATE POLICY "Management and admins can upload policy documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'policy-documents' AND
    (has_role(auth.uid(), 'management'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Management and admins can update policy documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'policy-documents' AND
    (has_role(auth.uid(), 'management'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Management and admins can delete policy documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'policy-documents' AND
    (has_role(auth.uid(), 'management'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  );

-- Function to calculate next review date
CREATE OR REPLACE FUNCTION public.calculate_next_review_date(
  last_review DATE,
  frequency TEXT
)
RETURNS DATE
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF last_review IS NULL THEN
    RETURN NULL;
  END IF;

  CASE frequency
    WHEN 'Monthly' THEN
      RETURN last_review + INTERVAL '1 month';
    WHEN 'Quarterly' THEN
      RETURN last_review + INTERVAL '3 months';
    WHEN 'Yearly' THEN
      RETURN last_review + INTERVAL '1 year';
    ELSE
      RETURN NULL;
  END CASE;
END;
$$;

-- Trigger to auto-calculate next review date
CREATE OR REPLACE FUNCTION public.update_next_review_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.last_review_date IS NOT NULL AND NEW.review_frequency IS NOT NULL THEN
    NEW.next_review_date := calculate_next_review_date(NEW.last_review_date, NEW.review_frequency);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_next_review_date
  BEFORE INSERT OR UPDATE OF last_review_date, review_frequency
  ON public.it_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_next_review_date();

-- Function to send policy review reminders
CREATE OR REPLACE FUNCTION public.send_policy_review_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Send notifications for policies due for review in 7 days
  INSERT INTO notifications (user_id, title, message, type, related_record_type, related_record_id)
  SELECT 
    p.owner_id,
    'Policy Review Reminder',
    'Policy "' || ip.policy_name || '" is due for review on ' || ip.next_review_date::date,
    'warning',
    'it_policy',
    ip.id
  FROM it_policies ip
  JOIN profiles p ON ip.owner_id = p.user_id
  WHERE ip.next_review_date::date = CURRENT_DATE + INTERVAL '7 days'
    AND ip.status != 'Compliant'
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.related_record_id = ip.id 
        AND n.related_record_type = 'it_policy'
        AND n.created_at::date = CURRENT_DATE
    );

  -- Also notify management and admins
  INSERT INTO notifications (user_id, title, message, type, related_record_type, related_record_id)
  SELECT 
    p.user_id,
    'Policy Review Reminder',
    'Policy "' || ip.policy_name || '" owned by ' || owner.full_name || ' is due for review on ' || ip.next_review_date::date,
    'warning',
    'it_policy',
    ip.id
  FROM it_policies ip
  JOIN profiles owner ON ip.owner_id = owner.user_id
  CROSS JOIN profiles p
  WHERE ip.next_review_date::date = CURRENT_DATE + INTERVAL '7 days'
    AND ip.status != 'Compliant'
    AND p.role IN ('management', 'admin')
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.related_record_id = ip.id 
        AND n.related_record_type = 'it_policy'
        AND n.user_id = p.user_id
        AND n.created_at::date = CURRENT_DATE
    );
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_it_policies_category ON public.it_policies(category);
CREATE INDEX idx_it_policies_status ON public.it_policies(status);
CREATE INDEX idx_it_policies_owner ON public.it_policies(owner_id);
CREATE INDEX idx_it_policies_next_review ON public.it_policies(next_review_date);

-- Create trigger to update updated_at
CREATE TRIGGER update_it_policies_updated_at
  BEFORE UPDATE ON public.it_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Generate policy ID function
CREATE OR REPLACE FUNCTION public.generate_policy_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id TEXT;
  year_suffix TEXT;
BEGIN
  year_suffix := to_char(now(), 'YY');
  SELECT 'POL-' || year_suffix || '-' || LPAD((COUNT(*) + 1)::text, 4, '0')
  INTO new_id
  FROM it_policies
  WHERE policy_id LIKE 'POL-' || year_suffix || '-%';
  
  RETURN new_id;
END;
$$;

-- Trigger to set policy_id
CREATE OR REPLACE FUNCTION public.set_policy_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.policy_id IS NULL OR NEW.policy_id = '' THEN
    NEW.policy_id := generate_policy_id();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_policy_id_trigger
  BEFORE INSERT ON public.it_policies
  FOR EACH ROW
  EXECUTE FUNCTION public.set_policy_id();