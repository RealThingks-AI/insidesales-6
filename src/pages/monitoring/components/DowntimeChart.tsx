import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { DowntimeLog } from "../types";

interface DowntimeChartProps {
  downtimeLogs: DowntimeLog[];
}

export default function DowntimeChart({ downtimeLogs }: DowntimeChartProps) {
  // Generate last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return format(date, 'yyyy-MM-dd');
  });

  const chartData = last7Days.map(date => {
    const logsForDay = downtimeLogs.filter(log => {
      const logDate = format(new Date(log.start_time), 'yyyy-MM-dd');
      return logDate === date;
    });

    const totalDowntime = logsForDay.reduce((sum, log) => {
      return sum + (log.duration_minutes || 0);
    }, 0);

    return {
      date: format(new Date(date), 'MMM dd'),
      downtime: Math.round(totalDowntime),
      incidents: logsForDay.length
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Downtime Trend</CardTitle>
        <CardDescription>Total downtime minutes per day (last 7 days)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg p-2 shadow-lg">
                      <p className="font-medium">{payload[0].payload.date}</p>
                      <p className="text-sm text-muted-foreground">
                        Downtime: {payload[0].value} minutes
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Incidents: {payload[0].payload.incidents}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="downtime" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--destructive))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
