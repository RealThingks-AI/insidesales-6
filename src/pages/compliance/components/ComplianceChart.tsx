import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ITPolicy, DepartmentCompliance } from "../types";

interface ComplianceChartProps {
  policies: ITPolicy[];
}

const COLORS = {
  compliant: 'hsl(var(--chart-1))',
  nonCompliant: 'hsl(var(--chart-2))',
  underReview: 'hsl(var(--chart-3))'
};

export default function ComplianceChart({ policies }: ComplianceChartProps) {
  // Group policies by department
  const departmentData: Record<string, DepartmentCompliance> = {};

  policies.forEach(policy => {
    const dept = policy.department || 'Unassigned';
    if (!departmentData[dept]) {
      departmentData[dept] = {
        department: dept,
        compliant: 0,
        nonCompliant: 0,
        underReview: 0
      };
    }

    if (policy.status === 'Compliant') departmentData[dept].compliant++;
    else if (policy.status === 'Non-Compliant') departmentData[dept].nonCompliant++;
    else departmentData[dept].underReview++;
  });

  // Convert to chart data
  const chartData = Object.values(departmentData).flatMap(dept => [
    { name: `${dept.department} - Compliant`, value: dept.compliant, color: COLORS.compliant },
    { name: `${dept.department} - Non-Compliant`, value: dept.nonCompliant, color: COLORS.nonCompliant },
    { name: `${dept.department} - Under Review`, value: dept.underReview, color: COLORS.underReview }
  ]).filter(item => item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Policy Compliance by Department</CardTitle>
        <CardDescription>Distribution of compliance status across departments</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No policy data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
