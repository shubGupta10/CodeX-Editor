"use client"

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminFetchAllDetails() {
    interface Data {
        userCount: number;
        feedbacks: { id: number; message: string }[];
    }

    const [data, setData] = useState<Data | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("/api/admin/fetch-all-details", {
                    method: "GET",
                });
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-[#1e1e1e] p-6 text-white">
            <h1 className="text-2xl font-bold mb-6 text-emerald-400">Admin Dashboard</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {data && (
                <div className="grid gap-6">
                    <Card className="border border-gray-800 bg-[#252525] p-4">
                        <CardContent>
                            <h2 className="text-xl font-semibold text-emerald-400">User Details</h2>
                            <p className="text-gray-300">Total Users: {data.userCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-gray-800 bg-[#252525] p-4">
                        <CardContent>
                            <h2 className="text-xl font-semibold text-emerald-400">Feedbacks</h2>
                            <p className="text-gray-300">Total Feedbacks: {data.feedbacks.length}</p>
                        </CardContent>
                    </Card>
                    <Button className="bg-emerald-600 hover:bg-emerald-400 text-white rounded-lg p-2">Refresh</Button>
                </div>
            )}
        </div>
    );
}