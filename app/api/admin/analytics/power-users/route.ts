import { NextResponse, NextRequest } from "next/server";
import User from "@/models/UserModel";
import { ConnectoDatabase } from "@/lib/db";
import redis from "@/redis/redis";

export async function GET() {
    try {
        const cachedPowerUsers = await redis.get("admin:analytics:powerusers");
        if (cachedPowerUsers) {
            return NextResponse.json({ success: true, data: cachedPowerUsers });
        }

        await ConnectoDatabase();

        const powerUsers = await User.aggregate([
            {
                $sort: { aiRequestCount: -1 }
            },
            {
                $limit: 10
            },
            {
                $addFields: {
                    userObjectId: { $toObjectId: "$userId" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userObjectId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    _id: 0,
                    userId: 1,
                    aiRequestCount: 1,
                    maxAiRequests: "$aiMaxRequests",
                    email: "$userDetails.email",
                    username: "$userDetails.username"
                }
            }
        ]);

        await redis.set("admin:analytics:powerusers", powerUsers, { ex: 60 });

        return NextResponse.json({
            success: true,
            data: powerUsers
        })
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Error fetching power users" },
            { status: 500 }
        );
    }
}