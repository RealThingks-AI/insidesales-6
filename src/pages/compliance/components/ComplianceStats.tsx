import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { ITPolicy } from "../types";

interface ComplianceStatsProps {
  policies: ITPolicy[];
}

export default function ComplianceStats({ policies }: ComplianceStatsProps) {
  const totalPolicies = policies.length;
  const compliantPolicies = policies.filter(p => p.status === 'Compliant').length;
  const pendingReviews = policies.filter(p => p.status === 'Under Review').length;
  
  // Calculate overdue reviews (next review date is in the past)
  const overdueReviews = policies.filter(p => {
    if (!p.next_review_date) return false;
    return new Date(p.next_review_date) < new Date() && p.status !== 'Compliant';
  }).length;

  const stats = [
    {
      title: "Total Policies",
      value: totalPolicies,
      icon: FileText,
      description: "All registered policies"
    },
    {
      title: "Compliant",
      value: compliantPolicies,
      icon: CheckCircle,
      description: "Up to date",
      valueColor: "text-green-600"
    },
    {
      title: "Pending Reviews",
      value: pendingReviews,
      icon: Clock,
      description: "Under review",
      valueColor: "text-blue-600"
    },
    {
      title: "Overdue Reviews",
      value: overdueReviews,
      icon: AlertTriangle,
      description: "Requires attention",
      valueColor: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.valueColor || ''}`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
