import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { applicationUpdateSchema } from "../../../../../lib/validations/application";
import { z } from "zod";

export const runtime = "nodejs";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const application = await prisma.application.findUnique({
            where: { id },
        });

        if (!application) {
            return NextResponse.json({ message: "Application not found" }, { status: 404 });
        }

        if (application.userId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(application, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch application:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const existingApp = await prisma.application.findUnique({
            where: { id },
        });

        if (!existingApp) {
            return NextResponse.json({ message: "Application not found" }, { status: 404 });
        }

        if (existingApp.userId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const data = applicationUpdateSchema.parse(body);

        const updatedApplication = await prisma.application.update({
            where: { id },
            data,
        });

        return NextResponse.json(updatedApplication, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: "Validation error", errors: error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        console.error("Failed to update application:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const existingApp = await prisma.application.findUnique({
            where: { id },
        });

        if (!existingApp) {
            return NextResponse.json({ message: "Application not found" }, { status: 404 });
        }

        if (existingApp.userId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await prisma.application.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Application deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Failed to delete application:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
