import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../app/api/v1/applications/check-duplicate/route";
import { getServerSession } from "next-auth/next";
import { prisma } from "../lib/prisma";

vi.mock("next-auth/next", () => ({
    getServerSession: vi.fn(),
}));

vi.mock("../lib/prisma", () => ({
    prisma: {
        application: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock("../lib/auth", () => ({
    authOptions: {},
}));

const mockUser = { id: "user_1" };

const mockExistingApp = {
    id: "app_1",
    userId: "user_1",
    companyName: "Google",
    roleTitle: "SWE Intern",
    status: "Applied",
    dateApplied: "2026-02-15T00:00:00.000Z",
};

describe("Check Duplicate API", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 401 if user is not authenticated", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce(null);

        const req = new Request("http://localhost/api/v1/applications/check-duplicate", {
            method: "POST",
            body: JSON.stringify({ companyName: "Google", roleTitle: "SWE Intern" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it("returns 400 if companyName is missing", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({ user: mockUser } as any);

        const req = new Request("http://localhost/api/v1/applications/check-duplicate", {
            method: "POST",
            body: JSON.stringify({ roleTitle: "SWE Intern" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toBe("companyName and roleTitle are required");
    });

    it("returns 400 if roleTitle is missing", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({ user: mockUser } as any);

        const req = new Request("http://localhost/api/v1/applications/check-duplicate", {
            method: "POST",
            body: JSON.stringify({ companyName: "Google" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it("returns isDuplicate: true when a matching application exists", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({ user: mockUser } as any);
        vi.mocked(prisma.application.findMany).mockResolvedValueOnce([mockExistingApp] as any);

        const req = new Request("http://localhost/api/v1/applications/check-duplicate", {
            method: "POST",
            body: JSON.stringify({ companyName: "Google", roleTitle: "SWE Intern" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.isDuplicate).toBe(true);
        expect(data.existingApplication).toEqual(mockExistingApp);
    });

    it("returns isDuplicate: true for case-insensitive match", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({ user: mockUser } as any);
        vi.mocked(prisma.application.findMany).mockResolvedValueOnce([mockExistingApp] as any);

        const req = new Request("http://localhost/api/v1/applications/check-duplicate", {
            method: "POST",
            body: JSON.stringify({ companyName: "GOOGLE", roleTitle: "swe intern" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.isDuplicate).toBe(true);

        // Verify Prisma was called to fetch user apps
        expect(prisma.application.findMany).toHaveBeenCalledWith({
            where: { userId: "user_1" },
        });
    });

    it("returns isDuplicate: false when no matching application exists", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({ user: mockUser } as any);
        vi.mocked(prisma.application.findMany).mockResolvedValueOnce([mockExistingApp] as any);

        const req = new Request("http://localhost/api/v1/applications/check-duplicate", {
            method: "POST",
            body: JSON.stringify({ companyName: "Meta", roleTitle: "Product Manager" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.isDuplicate).toBe(false);
        expect(data.existingApplication).toBeUndefined();
    });

    it("returns 500 if an unexpected error occurs", async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({ user: mockUser } as any);
        vi.mocked(prisma.application.findMany).mockRejectedValueOnce(new Error("DB down"));

        const req = new Request("http://localhost/api/v1/applications/check-duplicate", {
            method: "POST",
            body: JSON.stringify({ companyName: "Google", roleTitle: "SWE Intern" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.message).toBe("Internal server error");
    });
});
