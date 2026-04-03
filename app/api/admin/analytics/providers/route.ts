import { NextResponse, NextRequest } from "next/server";
import { ConnectoDatabase } from "@/lib/db";
import User from "@/models/UserModel";
import redis from "@/redis/redis";

export async function GET() {
    try {
        const cachedProviders = await redis.get("admin:analytics:providers");
        if (cachedProviders) {
            return NextResponse.json({ success: true, data: cachedProviders });
        }

        await ConnectoDatabase();

        const providerData = await User.aggregate([
            {
                $group: {
                    _id: "provider",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    value: "$count"
                }
            }
        ])

        await redis.set("admin:analytics:providers", providerData, { ex: 60 });

        return NextResponse.json({
            success: true,
            data: providerData
        })
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Error fetching provider data" },
            { status: 500 }
        );
    }
}