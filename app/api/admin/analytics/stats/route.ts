import { NextResponse, NextRequest } from "next/server";
import { ConnectoDatabase } from "@/lib/db";
import User from "@/models/UserModel";
import UserLimitModel from "@/models/User_limit";
import redis from "@/redis/redis";

export async function GET() {
    try {
        const cachedStats = await redis.get("admin:analytics:stats");
        if (cachedStats) {
            return NextResponse.json({ success: true, data: cachedStats });
        }

        await ConnectoDatabase();

        const totalUsers = await User.countDocuments();

        const usageStats = await UserLimitModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalAiRequests: { $sum: "$aiRequestCount" },
                    totalConversions: { $sum: "$conversionCount" },
                    totalFiles: { $sum: "$fileCount" }
                }
            }
        ]);

        const stats = usageStats.length > 0 ? usageStats[0] : {
            totalAiRequests: 0,
            totalConversions: 0,
            totalFiles: 0
        }

        const payload = {
            totalUsers,
            totalAiRequests: stats.totalAiRequests,
            totalConversions: stats.totalConversions,
            totalFiles: stats.totalFiles
        };

        await redis.set("admin:analytics:stats", payload, { ex: 60 });

        return NextResponse.json({
            success: true,
            data: payload
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Error fetching stats" },
            { status: 500 }
        );
    }
}