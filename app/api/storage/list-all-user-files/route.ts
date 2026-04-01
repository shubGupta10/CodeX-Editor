import { NextRequest, NextResponse } from "next/server";
import { listUserFiles } from "@/Supabase/supabaseFunctions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/options";
import { getCached, cacheKeys } from "@/lib/cache";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Cache file list for 2 minutes
        const files = await getCached(
            cacheKeys.fileList(userId),
            120,
            async () => {
                return await listUserFiles(userId);
            }
        );

        return NextResponse.json({ files }, { status: 200 });

    } catch (error: any) {
        console.error("Error retrieving user files:", error);
        return NextResponse.json({ message: "Error retrieving user files", error: error.message }, { status: 500 });
    }
}
