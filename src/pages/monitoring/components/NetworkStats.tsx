import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, WifiOff, TrendingUp } from "lucide-react";
import { NetworkDevice } from "../types";

interface NetworkStatsProps {
  devices: NetworkDevice[];
}

export default function NetworkStats({ devices }: NetworkStatsProps) {
  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.status === 'Online').length;
  const offlineDevices = devices.filter(d => d.status === 'Offline').length;
  const uptimePercentage = totalDevices > 0 
    ? ((onlineDevices / totalDevices) * 100).toFixed(1) 
    : '0.0';

  const stats = [
    {
      title: "Total Devices",
      value: totalDevices,
      icon: Server,
      description: "All registered devices"
    },
    {
      title: "Online Devices",
      value: onlineDevices,
      icon: Activity,
      description: "Currently connected",
      valueColor: "text-green-600"
    },
    {
      title: "Offline Devices",
      value: offlineDevices,
      icon: WifiOff,
      description: "Disconnected",
      valueColor: "text-red-600"
    },
    {
      title: "Avg Uptime",
      value: `${uptimePercentage}%`,
      icon: TrendingUp,
      description: "Network availability"
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
