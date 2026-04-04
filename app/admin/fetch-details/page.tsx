"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserData {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    plan: "free" | "pro";
    isAdmin: boolean;
    planExpiryDate?: string;
}

interface AdminData {
    userCount: number;
    users: UserData[];
    feedbacks: { id: number; message: string }[];
}

export default function AdminFetchAllDetails() {
    const [data, setData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/admin/fetch-all-details");
            const result = await response.json();
            if (result.success) {
                setData(result);
            } else {
                throw new Error(result.message);
            }
        } catch (err) {
            setError("Failed to fetch admin data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const togglePlan = async (userId: string, currentPlan: string) => {
        const newPlan = currentPlan === "pro" ? "free" : "pro";
        setActionLoading(userId);

        try {
            const res = await fetch("/api/admin/user-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    plan: newPlan,
                    days: newPlan === "pro" ? 30 : 0
                }),
            });

            if (res.ok) {
                await fetchData();
            } else {
                alert("Failed to update plan.");
            }
        } catch (error) {
            console.error("Plan toggle error:", error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1e1e1e] text-white p-4 sm:p-8">
            <header className="max-w-7xl mx-auto mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">System <span className="text-emerald-400">Control</span></h1>
                    <p className="text-gray-400 text-sm mt-1">Manage user tiers and access permissions.</p>
                </div>
                <div className="flex gap-4">
                    <Badge variant="outline" className="bg-[#252525] text-emerald-400 border-gray-800 py-1.5 px-4 rounded-lg font-bold">
                        {data?.userCount || 0} Total Users
                    </Badge>
                    <Button
                        onClick={fetchData}
                        className="bg-[#252525] hover:bg-emerald-600 border border-gray-800 hover:border-emerald-500 text-white transition-all rounded-lg px-6 h-10 font-bold"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid gap-8">
                {/* User Management Table */}
                <Card className="bg-[#252525] border-gray-800 shadow-xl overflow-hidden rounded-xl">
                    <CardHeader className="border-b border-gray-800 py-4">
                        <div className="flex items-center gap-3 text-white">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            <CardTitle className="text-lg font-bold">User Management</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#1e1e1e] text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-bold">Identity</th>
                                    <th className="px-6 py-4 font-bold">Role</th>
                                    <th className="px-6 py-4 font-bold">Plan</th>
                                    <th className="px-6 py-4 font-bold">Expiry</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                <AnimatePresence mode="popLayout">
                                    {data?.users.map((user) => (
                                        <motion.tr
                                            key={user._id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white">@{user.username}</span>
                                                    <span className="text-[11px] text-gray-500">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {user.isAdmin ? (
                                                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-2.5 py-0.5 font-bold text-[10px] rounded">ROOT ADMIN</Badge>
                                                ) : (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2.5 py-0.5 font-bold text-[10px] rounded">USER</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    {user.plan === 'pro' ? (
                                                        <span className="flex items-center text-emerald-400 font-bold text-sm">
                                                            <Zap className="w-3.5 h-3.5 mr-1.5 fill-emerald-400/20" />
                                                            PRO
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">FREE</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-500">
                                                {user.planExpiryDate ? (
                                                    <span className="text-emerald-400/80">{new Date(user.planExpiryDate).toLocaleDateString()}</span>
                                                ) : (
                                                    'Lifetime'
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Button
                                                    size="sm"
                                                    disabled={actionLoading === user._id || user.isAdmin}
                                                    onClick={() => togglePlan(user._id, user.plan)}
                                                    className={`rounded-xl font-bold text-[10px] px-4 h-8 uppercase tracking-widest transition-all ${user.plan === 'pro'
                                                            ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20'
                                                            : 'bg-emerald-600 text-white hover:bg-emerald-500 h-9 px-5'
                                                        }`}
                                                >
                                                    {actionLoading === user._id ? (
                                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        user.plan === 'pro' ? 'Downgrade' : 'Upgrade to Pro'
                                                    )}
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Feedback Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-[#252525] border-gray-800 p-8 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-emerald-400" />
                                System Health
                            </h3>
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">Infrastructure status: Synchronized with Redis Cluster and MongoDB shards. Operational.</p>
                    </Card>
                    <Card className="bg-[#252525] border-gray-800 p-8 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between mb-4 text-white">
                            <h3 className="text-lg font-bold">Feedback Queue</h3>
                            <Badge className="bg-emerald-500 text-black font-black px-3 h-6 rounded-md">{data?.feedbacks.length || 0}</Badge>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">Latest user reports are being processed and indexed for resolution.</p>
                    </Card>
                </div>
            </main>
        </div>
    );
}