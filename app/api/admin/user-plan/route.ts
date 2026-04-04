import { ConnectoDatabase } from "@/lib/db";
import { authOptions } from "@/lib/options";
import User from "@/models/UserModel";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * Handles administrative plan updates for users.
 * Strictly restricted to users with isAdmin: true.
 * 
 * POST /api/admin/user-plan
 * body: { userId: string, plan: "free" | "pro", days?: number }
 */
export async function POST(req: Request) {
    try {
        await ConnectoDatabase();

        // 1. Strict Authorization Check
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const adminUser = await User.findById(session.user.id);
        if (!adminUser?.isAdmin) {
            return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
        }

        // 2. Body Validation
        const { userId, plan, days } = await req.json();
        if (!userId || !["free", "pro"].includes(plan)) {
            return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
        }

        // 3. Update Logic
        const updateData: any = { plan };
        if (plan === "pro" && days) {
            updateData.planExpiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        } else if (plan === "free") {
            updateData.planExpiryDate = null;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            message: `User plan updated to ${plan}`, 
            user: updatedUser 
        });

    } catch (error: any) {
        console.error("[Admin API] Plan update failed:", error);
        return NextResponse.json({ 
            message: "Internal Server Error", 
            error: error.message 
        }, { status: 500 });
    }
}
