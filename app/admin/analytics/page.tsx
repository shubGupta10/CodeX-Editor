"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Users, Zap, FileOutput, FileDigit } from "lucide-react";

type Stats = {
  totalUsers: number;
  totalAiRequests: number;
  totalConversions: number;
  totalFiles: number;
};

type GrowthData = {
  date: string;
  newUsers: number;
};

type ProviderData = {
  name: string;
  value: number;
};

type PowerUser = {
  userId: string;
  email?: string;
  username?: string;
  aiRequestCount: number;
  maxAiRequests: number;
};


const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#6366f1"];

export default function AdminAnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [growth, setGrowth] = useState<GrowthData[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [powerUsers, setPowerUsers] = useState<PowerUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      try {
        const [statsRes, growthRes, providersRes, powerUsersRes] = await Promise.all([
          fetch("/api/admin/analytics/stats"),
          fetch("/api/admin/analytics/growth"),
          fetch("/api/admin/analytics/providers"),
          fetch("/api/admin/analytics/power-users"),
        ]);

        const [statsData, growthData, providersData, powerUsersData] = await Promise.all([
          statsRes.json(),
          growthRes.json(),
          providersRes.json(),
          powerUsersRes.json(),
        ]);

        if (statsData.success) setStats(statsData.data);
        if (growthData.success) setGrowth(growthData.data);
        if (providersData.success) setProviders(providersData.data);
        if (powerUsersData.success) setPowerUsers(powerUsersData.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-[#1e1e1e] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-emerald-400">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {/* Add a date picker or refresh button here in the future if needed */}
        </div>
      </div>

      {/* --- TOP ROW: KIP / Stats --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={<Users className="h-4 w-4 text-emerald-500" />}
          loading={loading}
        />
        <StatCard
          title="AI Requests"
          value={stats?.totalAiRequests}
          icon={<Zap className="h-4 w-4 text-blue-500" />}
          loading={loading}
        />
        <StatCard
          title="Conversions"
          value={stats?.totalConversions}
          icon={<FileOutput className="h-4 w-4 text-orange-500" />}
          loading={loading}
        />
        <StatCard
          title="Total Files"
          value={stats?.totalFiles}
          icon={<FileDigit className="h-4 w-4 text-indigo-500" />}
          loading={loading}
        />
      </div>

      {/* --- MIDDLE ROW: Charts --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* User Growth Chart */}
        <Card className="col-span-4 bg-[#18181B] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-emerald-400">User Growth (Last 30 Days)</CardTitle>
            <CardDescription className="text-neutral-400">Daily new signups across your platform.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 h-[350px]">
            {loading ? (
              <Skeleton className="w-full h-full bg-neutral-800 rounded-xl" />
            ) : growth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growth} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#a1a1aa"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val.split("-").slice(1).join("/")} // Format YYYY-MM-DD to MM/DD
                  />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val}`}
                  />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#18181B", borderColor: "#27272a", borderRadius: "8px" }}
                    itemStyle={{ color: "#10b981" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    name="Signups"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#18181B", stroke: "#10b981" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Auth Providers Pie Chart */}
        <Card className="col-span-3 bg-[#18181B] border-neutral-800">
          <CardHeader>
            <CardTitle className="text-emerald-400">Auth Providers</CardTitle>
            <CardDescription className="text-neutral-400">How your users are signing up.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col justify-center items-center">
            {loading ? (
              <Skeleton className="w-full h-full bg-neutral-800 rounded-xl" />
            ) : providers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={providers}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {providers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#18181B", borderColor: "#27272a", borderRadius: "8px", color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500">No data available</div>
            )}
            {/* Custom Legend */}
            {!loading && providers.length > 0 && (
              <div className="flex gap-4 mt-4">
                {providers.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                    <span className="text-sm text-neutral-300 capitalize">{entry.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- BOTTOM ROW: Top Power Users --- */}
      <Card className="bg-[#18181B] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-emerald-400">Top 10 Active Users</CardTitle>
          <CardDescription className="text-neutral-400">Users nearing or at their AI limits.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-full h-12 bg-neutral-800" />)}
            </div>
          ) : powerUsers.length > 0 ? (
            <div className="rounded-md border border-neutral-800">
              <div className="grid grid-cols-4 p-4 text-sm font-medium text-neutral-400 border-b border-neutral-800 bg-[#121214]">
                <div>User</div>
                <div>Email</div>
                <div>AI Requests</div>
                <div>Limit Status</div>
              </div>
              {powerUsers.map((user) => {
                const percentage = (user.aiRequestCount / user.maxAiRequests) * 100;
                return (
                  <div key={user.userId} className="grid grid-cols-4 p-4 text-sm text-neutral-300 border-b border-neutral-800 last:border-0 hover:bg-[#1a1a1c] transition-colors items-center">
                    <div className="font-medium text-white">{user.username || "Unknown"}</div>
                    <div>{user.email || "No email"}</div>
                    <div>{user.aiRequestCount} / {user.maxAiRequests}</div>
                    <div>
                      {/* Limit Bar Indicator */}
                      <div className="w-full bg-neutral-800 rounded-full h-2 mt-1 relative overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full rounded-full ${percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-neutral-500 py-8 text-center border border-dashed border-neutral-800 rounded-xl">No active users found.</div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

// --- Helper Component ---
function StatCard({ title, value, icon, loading }: { title: string, value?: number, icon: React.ReactNode, loading: boolean }) {
  return (
    <Card className="bg-[#18181B] border-neutral-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-300">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20 bg-neutral-800" />
        ) : (
          <div className="text-2xl font-bold text-white">
            {value !== undefined ? value.toLocaleString() : "0"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
