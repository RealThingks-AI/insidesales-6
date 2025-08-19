
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Handshake, 
  DollarSign, 
  TrendingUp, 
  Target,
  Calendar,
  Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

interface DashboardMetrics {
  totalContacts: number;
  totalLeads: number;
  totalDeals: number;
  totalRevenue: number;
  activeDeals: number;
  wonDeals: number;
  conversionRate: number;
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalContacts: 0,
    totalLeads: 0,
    totalDeals: 0,
    totalRevenue: 0,
    activeDeals: 0,
    wonDeals: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [contactsResult, leadsResult, dealsResult] = await Promise.all([
          supabase.from('contacts').select('*', { count: 'exact' }),
          supabase.from('leads').select('*', { count: 'exact' }),
          supabase.from('deals').select('*')
        ]);

        const deals = dealsResult.data || [];
        const wonDeals = deals.filter(deal => deal.stage === 'Won').length;
        const activeDeals = deals.filter(deal => !['Won', 'Lost'].includes(deal.stage)).length;
        const totalRevenue = deals.reduce((sum, deal) => sum + (deal.total_revenue || 0), 0);
        const conversionRate = deals.length > 0 ? (wonDeals / deals.length) * 100 : 0;

        setMetrics({
          totalContacts: contactsResult.count || 0,
          totalLeads: leadsResult.count || 0,
          totalDeals: deals.length,
          totalRevenue,
          activeDeals,
          wonDeals,
          conversionRate
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const pipelineData = [
    { name: 'Lead', value: 35, color: 'hsl(var(--pipeline-lead))' },
    { name: 'Qualified', value: 25, color: 'hsl(var(--pipeline-qualified))' },
    { name: 'Proposal', value: 20, color: 'hsl(var(--pipeline-proposal))' },
    { name: 'Negotiation', value: 15, color: 'hsl(var(--pipeline-negotiation))' },
    { name: 'Won', value: 5, color: 'hsl(var(--pipeline-won))' },
  ];

  const activityData = [
    { day: 'Mon', calls: 12, meetings: 3, emails: 45 },
    { day: 'Tue', calls: 15, meetings: 5, emails: 32 },
    { day: 'Wed', calls: 8, meetings: 2, emails: 28 },
    { day: 'Thu', calls: 18, meetings: 7, emails: 38 },
    { day: 'Fri', calls: 22, meetings: 4, emails: 42 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 slide-up">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your CRM overview.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="crm-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="crm-metric-label">Total Contacts</p>
                <p className="crm-metric">{metrics.totalContacts}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="crm-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="crm-metric-label">Active Leads</p>
                <p className="crm-metric">{metrics.totalLeads}</p>
              </div>
              <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="crm-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="crm-metric-label">Active Deals</p>
                <p className="crm-metric">{metrics.activeDeals}</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Handshake className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="crm-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="crm-metric-label">Total Revenue</p>
                <p className="crm-metric">${metrics.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="crm-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="crm-metric-label">Conversion Rate</p>
                <p className="crm-metric">{metrics.conversionRate.toFixed(1)}%</p>
              </div>
              <Badge className="status-success">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2.5%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="crm-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="crm-metric-label">Won Deals</p>
                <p className="crm-metric">{metrics.wonDeals}</p>
              </div>
              <Badge className="status-success">
                <Target className="w-3 h-3 mr-1" />
                On Track
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="crm-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="crm-metric-label">Pipeline Health</p>
                <p className="crm-metric">Strong</p>
              </div>
              <Badge className="status-success">
                <Activity className="w-3 h-3 mr-1" />
                Healthy
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="crm-card">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Revenue']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Distribution */}
        <Card className="crm-card">
          <CardHeader>
            <CardTitle>Pipeline Distribution</CardTitle>
            <CardDescription>Current deals by stage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card className="crm-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Calls, meetings, and emails this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calls" fill="hsl(var(--chart-1))" />
                <Bar dataKey="meetings" fill="hsl(var(--chart-2))" />
                <Bar dataKey="emails" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
