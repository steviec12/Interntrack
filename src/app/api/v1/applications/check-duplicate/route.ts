import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { companyName, roleTitle } = body;

        if (!companyName || !roleTitle) {
            return NextResponse.json(
                { message: "companyName and roleTitle are required" },
                { status: 400 }
            );
        }

        // Fetch all user applications and compare in JS (case-insensitive)
        // Using JS comparison instead of Prisma's mode:"insensitive" which
        // is unreliable with the Neon PostgreSQL adapter
        const userApplications = await prisma.application.findMany({
            where: { userId: session.user.id },
        });

        const existingApplication = userApplications.find(
            (app) =>
                app.companyName.toLowerCase() === companyName.toLowerCase() &&
                app.roleTitle.toLowerCase() === roleTitle.toLowerCase()
        );

        if (existingApplication) {
            return NextResponse.json(
                { isDuplicate: true, existingApplication },
                { status: 200 }
            );
        }

        return NextResponse.json({ isDuplicate: false }, { status: 200 });
    } catch (error) {
        console.error("Failed to check for duplicates:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
