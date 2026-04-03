import { NextResponse, NextRequest } from "next/server";
import { ConnectoDatabase } from "@/lib/db";
import User from "@/models/UserModel";

export async function GET() {
    try {
        await ConnectoDatabase();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const growthData = await User.aggregate([
            {
                //stage 1
                $match: {
                    createdAt: {
                        $gte: thirtyDaysAgo
                    }
                },
            },
            {
                //stage 2
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    newUsers: { $sum: 1 }
                }
            },
            {
                //stage 3
                $sort: { _id: 1 }
            },
            {
                //stage 4
                $project: {
                    _id: 0,
                    date: "$_id",
                    newUsers: 1
                }
            }
        ]);

        return NextResponse.json({
            success: true,
            data: growthData
        })
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Error fetching growth data" },
            { status: 500 }
        );
    }
}