import { ConnectoDatabase } from "@/lib/db";
import { authOptions } from "@/lib/options";
import User from "@/models/UserModel";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await ConnectoDatabase();
        console.log("Database connected successfully");

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { message: "User is unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        console.log("Fetching User with ID:", userId);

        const foundUser = await User.findById(userId).lean();
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
