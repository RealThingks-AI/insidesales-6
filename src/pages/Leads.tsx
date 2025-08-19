
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Mail, Phone, Building2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: string;
  lead_name: string;
  company_name: string;
  email: string;
  phone_no: string;
  lead_status: string;
  industry: string;
  country: string;
  created_time: string;
}

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_time', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      'New': 'status-info',
      'Contacted': 'status-warning',
      'Qualified': 'status-success',
      'Lost': 'status-error'
    };
    return statusColors[status as keyof typeof statusColors] || 'bg-muted';
  };

  const filteredLeads = leads.filter(lead =>
    lead.lead_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Leads</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground">Manage your potential customers</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary">{filteredLeads.length} leads</Badge>
      </div>

      {/* Leads Grid */}
      {filteredLeads.length === 0 ? (
        <Card className="crm-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No leads found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first lead"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="deal-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">{lead.lead_name}</CardTitle>
                    <CardDescription>{lead.company_name}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(lead.lead_status)}>
                    {lead.lead_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.phone_no && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{lead.phone_no}</span>
                  </div>
                )}
                {lead.industry && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{lead.industry}</span>
                  </div>
                )}
                {lead.country && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{lead.country}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leads;
