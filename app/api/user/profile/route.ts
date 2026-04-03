import { ConnectoDatabase } from "@/lib/db";
import { authOptions } from "@/lib/options";
import User from "@/models/UserModel";
import UserLimitModel from "@/models/User_limit";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getCached, cacheKeys } from "@/lib/cache";

export async function GET() {
    try {
        await ConnectoDatabase();

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "User is unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const currentUserEmail = session.user.email;

        // Cache user profile for 5 minutes
        const foundUser = await getCached(
            cacheKeys.userProfile(userId),
            300,
            async () => {
                const user = await User.findOne({ email: currentUserEmail }).lean();
                if (!user) return null;
                const userLimits = await UserLimitModel.findOne({ userId: userId }).lean();
                return { ...user, limits: userLimits || { aiRequestCount: 0, conversionCount: 0, fileCount: 0 } };
            }
        );

        if (!foundUser) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "User successfully fetched", user: foundUser },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Internal Server Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
