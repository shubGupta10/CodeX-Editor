import { NextResponse, NextRequest } from "next/server";
import { ConnectoDatabase } from "@/lib/db";
import User from "@/models/UserModel";
import UserLimitModel from "@/models/User_limit";

export async function GET() {
    try {
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

        return NextResponse.json({
            success: true,
            data: {
                totalUsers,
                totalAiRequests: stats.totalAiRequests,
                totalConversions: stats.totalConversions,
                totalFiles: stats.totalFiles
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Error fetching stats" },
            { status: 500 }
        );
    }
}