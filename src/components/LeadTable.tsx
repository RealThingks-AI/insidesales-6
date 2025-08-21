
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Edit, Trash2, CheckSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActionsBar } from "@/components/BulkActionsBar";
import { LeadModal } from "@/components/LeadModal";
import { LeadColumnCustomizer } from "@/components/LeadColumnCustomizer";
import { LeadActionItemsModal } from "@/components/LeadActionItemsModal";
import { toast } from "@/hooks/use-toast";
import { LeadColumn } from "@/types/columns";

interface Lead {
  id: string;
  lead_name: string;
  company_name: string;
  position: string;
  email: string;
  phone_no: string;
  linkedin: string;
  website: string;
  contact_source: string;
  lead_status: string;
  industry: string;
  country: string;
  description: string;
  contact_owner: string;
  created_by: string;
  modified_by: string;
  created_time: string;
  modified_time: string;
}

interface LeadTableProps {
  showColumnCustomizer: boolean;
  setShowColumnCustomizer: (show: boolean) => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  selectedLeads: string[];
  setSelectedLeads: (leads: string[]) => void;
}

const LeadTable = ({ 
  showColumnCustomizer, 
  setShowColumnCustomizer, 
  showModal, 
  setShowModal,
  selectedLeads,
  setSelectedLeads
}: LeadTableProps) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedLeadForActions, setSelectedLeadForActions] = useState<Lead | null>(null);

  const [columns, setColumns] = useState<LeadColumn[]>([
    { key: 'lead_name', label: 'Lead Name', visible: true, order: 0 },
    { key: 'company_name', label: 'Company Name', visible: true, order: 1 },
    { key: 'position', label: 'Position', visible: true, order: 2 },
    { key: 'email', label: 'Email', visible: true, order: 3 },
    { key: 'phone_no', label: 'Phone', visible: true, order: 4 },
    { key: 'country', label: 'Region', visible: true, order: 5 },
    { key: 'contact_owner', label: 'Lead Owner', visible: true, order: 6 },
    { key: 'lead_status', label: 'Lead Status', visible: true, order: 7 },
    { key: 'linkedin', label: 'LinkedIn', visible: false, order: 8 },
    { key: 'website', label: 'Website', visible: false, order: 9 },
    { key: 'contact_source', label: 'Source', visible: false, order: 10 },
    { key: 'industry', label: 'Industry', visible: false, order: 11 },
    { key: 'description', label: 'Description', visible: false, order: 12 },
    { key: 'created_time', label: 'Created', visible: false, order: 13 },
    { key: 'modified_time', label: 'Modified', visible: false, order: 14 }
  ]);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_time', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        toast({
          title: "Error",
          description: "Failed to fetch leads",
          variant: "destructive",
        });
        return;
      }

      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    const handleLeadsUpdated = () => {
      fetchLeads();
    };

    window.addEventListener('leads-data-updated', handleLeadsUpdated);
    return () => {
      window.removeEventListener('leads-data-updated', handleLeadsUpdated);
    };
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead =>
      Object.values(lead).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [leads, searchQuery]);

  const visibleColumns = columns
    .filter(column => column.visible)
    .sort((a, b) => a.order - b.order);

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(
      selectedLeads.includes(leadId)
        ? selectedLeads.filter(id => id !== leadId)
        : [...selectedLeads, leadId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedLeads(
      selectedLeads.length === filteredLeads.length ? [] : filteredLeads.map(lead => lead.id)
    );
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setShowModal(true);
  };

  const handleDelete = async (leadId: string) => {
    try {
      console.log('Attempting to delete lead:', leadId);
      
      // First, delete any related notifications
      const { error: notificationError } = await supabase
        .from('notifications')
        .delete()
        .eq('lead_id', leadId);

      if (notificationError) {
        console.error('Error deleting related notifications:', notificationError);
        // Continue with lead deletion even if notifications deletion fails
      }

      // Then delete the lead
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) {
        console.error('Delete error:', error);
        toast({
          title: "Error",
          description: `Failed to delete lead: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      await fetchLeads();
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;

    try {
      console.log('Attempting bulk delete of leads:', selectedLeads);
      
      // First, delete all related notifications for the selected leads
      const { error: notificationError } = await supabase
        .from('notifications')
        .delete()
        .in('lead_id', selectedLeads);

      if (notificationError) {
        console.error('Error deleting related notifications:', notificationError);
        // Continue with lead deletion even if notifications deletion fails
      }

      // Then delete the leads
      const { error } = await supabase
        .from('leads')
        .delete()
        .in('id', selectedLeads);

      if (error) {
        console.error('Bulk delete error:', error);
        toast({
          title: "Error",
          description: `Failed to delete leads: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      setSelectedLeads([]);
      await fetchLeads();
      toast({
        title: "Success",
        description: `${selectedLeads.length} leads deleted successfully`,
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete leads",
        variant: "destructive",
      });
    }
  };

  const handleBulkExport = () => {
    console.log('Exporting selected leads:', selectedLeads);
    // Export functionality will be handled by parent component
  };

  const handleClearSelection = () => {
    setSelectedLeads([]);
  };

  const handleActionClick = (lead: Lead) => {
    setSelectedLeadForActions(lead);
    setActionModalOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'default';
      case 'contacted':
        return 'secondary';
      case 'qualified':
        return 'default';
      case 'unqualified':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading leads...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {selectedLeads.length > 0 && (
            <BulkActionsBar
              selectedCount={selectedLeads.length}
              onDelete={handleBulkDelete}
              onExport={handleBulkExport}
              onClearSelection={handleClearSelection}
            />
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  {visibleColumns.map(column => (
                    <TableHead key={column.key}>{column.label}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map(lead => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={() => toggleLeadSelection(lead.id)}
                      />
                    </TableCell>
                    {visibleColumns.map(column => (
                      <TableCell key={`${lead.id}-${column.key}`}>
                        {column.key === 'lead_status' ? (
                          <Badge variant={getStatusBadgeVariant(lead.lead_status)}>
                            {lead.lead_status}
                          </Badge>
                        ) : (
                          lead[column.key as keyof Lead]?.toString() || '-'
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleActionClick(lead)}
                          className="h-8 w-8 p-0"
                          title="Action Items"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(lead)}
                          className="h-8 w-8 p-0"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(lead.id)}
                          className="h-8 w-8 p-0"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLeads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 2} className="text-center py-8">
                      No leads found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <LeadModal
          open={showModal}
          onOpenChange={(open) => {
            setShowModal(open);
            if (!open) setEditingLead(null);
          }}
          lead={editingLead}
          onSuccess={fetchLeads}
        />
      )}

      {showColumnCustomizer && (
        <LeadColumnCustomizer
          columns={columns}
          onColumnsChange={setColumns}
          onClose={() => setShowColumnCustomizer(false)}
        />
      )}

      <LeadActionItemsModal
        open={actionModalOpen}
        onOpenChange={setActionModalOpen}
        lead={selectedLeadForActions}
      />
    </>
  );
};

export default LeadTable;
