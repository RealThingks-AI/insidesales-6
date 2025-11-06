import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import ComplianceStats from "./components/ComplianceStats";
import PolicyList from "./components/PolicyList";
import PolicyFormDialog from "./components/PolicyFormDialog";
import ComplianceChart from "./components/ComplianceChart";
import { ITPolicy, PolicyFilters } from "./types";

const Compliance = () => {
  const { user, profile } = useAuth();
  const [policies, setPolicies] = useState<ITPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<ITPolicy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState<PolicyFilters>({
    category: 'all',
    status: 'all',
    search: ''
  });

  const canManage = profile?.role === 'admin' || profile?.role === 'management';

  const fetchPolicies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('it_policies')
        .select(`
          *,
          owner:profiles!it_policies_owner_id_fkey(full_name)
        `)
        .order('policy_id', { ascending: false });

      if (error) throw error;
      
      // Parse attachments from JSON
      const parsedData = (data || []).map(policy => ({
        ...policy,
        attachments: Array.isArray(policy.attachments) ? policy.attachments : []
      }));
      
      setPolicies(parsedData as unknown as ITPolicy[]);
    } catch (error: any) {
      toast.error('Failed to fetch policies');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPolicies();
    }
  }, [user, fetchPolicies]);

  const handleAddPolicy = () => {
    setSelectedPolicy(null);
    setDialogOpen(true);
  };

  const handleEditPolicy = (policy: ITPolicy) => {
    setSelectedPolicy(policy);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Compliance & IT Policy Management</h1>
          <p className="text-muted-foreground">Manage organizational IT policies and compliance tracking</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 pt-0 space-y-6">
        <ComplianceStats policies={policies} />

        <PolicyList
          policies={policies}
          filters={filters}
          onFiltersChange={setFilters}
          onAddPolicy={handleAddPolicy}
          onEditPolicy={handleEditPolicy}
          onRefresh={fetchPolicies}
          canManage={canManage}
        />

        <ComplianceChart policies={policies} />
      </div>

      <PolicyFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        policy={selectedPolicy}
        onSuccess={fetchPolicies}
      />
    </div>
  );
};

export default Compliance;
