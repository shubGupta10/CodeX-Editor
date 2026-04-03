import { NextResponse, NextRequest } from "next/server";
import { ConnectoDatabase } from "@/lib/db";
import User from "@/models/UserModel";

export async function GET() {
    try {
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