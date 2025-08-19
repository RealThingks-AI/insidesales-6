
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, DollarSign, Calendar, User, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface Deal {
  id: string;
  deal_name: string;
  customer_name: string;
  stage: string;
  total_contract_value: number;
  total_revenue: number;
  probability: number;
  expected_closing_date: string;
  lead_owner: string;
  created_at: string;
}

const Deals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast.error("Failed to fetch deals");
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    const stageColors = {
      'Lead': 'bg-chart-1 text-white',
      'Qualified': 'status-info',
      'Proposal': 'status-warning',
      'Negotiation': 'bg-chart-4 text-white',
      'Won': 'status-success',
      'Lost': 'status-error'
    };
    return stageColors[stage as keyof typeof stageColors] || 'bg-muted';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'status-success';
    if (probability >= 60) return 'status-warning';
    if (probability >= 40) return 'status-info';
    return 'status-error';
  };

  const filteredDeals = deals.filter(deal =>
    deal.deal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.lead_owner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dealsByStage = {
    'Lead': filteredDeals.filter(deal => deal.stage === 'Lead'),
    'Qualified': filteredDeals.filter(deal => deal.stage === 'Qualified'),
    'Proposal': filteredDeals.filter(deal => deal.stage === 'Proposal'),
    'Negotiation': filteredDeals.filter(deal => deal.stage === 'Negotiation'),
    'Won': filteredDeals.filter(deal => deal.stage === 'Won'),
    'Lost': filteredDeals.filter(deal => deal.stage === 'Lost'),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Deals Pipeline</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-16 bg-muted rounded"></div>
                  ))}
                </div>
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
          <h1 className="text-3xl font-bold text-foreground">Deals Pipeline</h1>
          <p className="text-muted-foreground">Track your sales opportunities through each stage</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary">{filteredDeals.length} deals</Badge>
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Object.entries(dealsByStage).map(([stage, stageDeals]) => (
          <div key={stage} className="pipeline-stage">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{stage}</h3>
              <Badge variant="secondary" className="text-xs">
                {stageDeals.length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {stageDeals.map((deal) => (
                <Card key={deal.id} className="deal-card border-l-4" style={{
                  borderLeftColor: stage === 'Lead' ? 'hsl(var(--chart-1))' :
                                  stage === 'Qualified' ? 'hsl(var(--info))' :
                                  stage === 'Proposal' ? 'hsl(var(--warning))' :
                                  stage === 'Negotiation' ? 'hsl(var(--chart-4))' :
                                  stage === 'Won' ? 'hsl(var(--success))' : 'hsl(var(--destructive))'
                }}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-foreground truncate">
                          {deal.deal_name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {deal.customer_name}
                        </p>
                      </div>

                      {deal.total_contract_value && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          <span className="font-medium">
                            ${deal.total_contract_value.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {deal.probability && (
                        <Badge className={`${getProbabilityColor(deal.probability)} text-xs`}>
                          {deal.probability}% probability
                        </Badge>
                      )}

                      {deal.expected_closing_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(deal.expected_closing_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {deal.lead_owner && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span className="truncate">{deal.lead_owner}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {stageDeals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No deals in this stage</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deals;
