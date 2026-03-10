import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "../app/api/v1/applications/route";
import { getServerSession } from "next-auth/next";
import { prisma } from "../lib/prisma";

vi.mock("next-auth/next", () => ({
    getServerSession: vi.fn(),
}));

vi.mock("../lib/prisma", () => ({
    prisma: {
        application: {
            create: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

// Mock the NextAuth authOptions
vi.mock("../lib/auth", () => ({
    authOptions: {},
}));

describe("Applications API", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("POST /api/v1/applications", () => {
        it("returns 401 if user is not authenticated", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(null);

            const req = new Request("http://localhost/api/v1/applications", {
                method: "POST",
                body: JSON.stringify({ companyName: "Google", roleTitle: "SWE" }),
            });

            const res = await POST(req);
            expect(res.status).toBe(401);
        });

        it("returns 400 if validation fails", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({
                user: { id: "user_123" },
            } as any);

            const req = new Request("http://localhost/api/v1/applications", {
                method: "POST",
                body: JSON.stringify({ companyName: "Google" }), // Missing roleTitle
            });

            const res = await POST(req);
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toBe("Validation error");
        });

        it("creates an application successfully and returns 201", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({
                user: { id: "user_123" },
            } as any);

            const mockApp = { id: "app_1", companyName: "Google", roleTitle: "SWE", userId: "user_123" };
            vi.mocked(prisma.application.create).mockResolvedValueOnce(mockApp as any);

            const req = new Request("http://localhost/api/v1/applications", {
                method: "POST",
                body: JSON.stringify({ companyName: "Google", roleTitle: "SWE" }),
            });

            const res = await POST(req);
            expect(res.status).toBe(201);
            const data = await res.json();
            expect(data).toEqual(mockApp);
            expect(prisma.application.create).toHaveBeenCalledWith({
                data: {
                    companyName: "Google",
                    roleTitle: "SWE",
                    status: "Saved",
                    type: "Internship",
                    isRolling: false,
                    userId: "user_123",
                },
            });
        });
    });

    describe("GET /api/v1/applications", () => {
        it("returns 401 if user is not authenticated", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(null);

            const req = new Request("http://localhost/api/v1/applications");
            const res = await GET(req);
            expect(res.status).toBe(401);
        });

        it("returns the user's applications", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({
                user: { id: "user_123" },
            } as any);

            const mockApps = [
                { id: "app_1", companyName: "Google", roleTitle: "SWE" },
                { id: "app_2", companyName: "Meta", roleTitle: "Frontend" },
            ];
            vi.mocked(prisma.application.findMany).mockResolvedValueOnce(mockApps as any);

            const req = new Request("http://localhost/api/v1/applications");
            const res = await GET(req);
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toEqual(mockApps);
            expect(prisma.application.findMany).toHaveBeenCalledWith({
                where: { userId: "user_123" },
                orderBy: { createdAt: "desc" },
            });
        });
    });
});
