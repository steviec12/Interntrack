import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT, DELETE } from "../app/api/v1/applications/[id]/route";
import { getServerSession } from "next-auth/next";
import { prisma } from "../lib/prisma";

vi.mock("next-auth/next", () => ({
    getServerSession: vi.fn(),
}));

vi.mock("../lib/prisma", () => ({
    prisma: {
        application: {
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

vi.mock("../lib/auth", () => ({
    authOptions: {},
}));

const mockUserOne = { id: "user_1" };
const mockUserTwo = { id: "user_2" };
const mockApp = { id: "app_1", userId: "user_1", companyName: "Google", roleTitle: "SWE" };

describe("Applications [ID] API", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("GET /api/v1/applications/[id]", () => {
        it("returns 401 if user is not authenticated", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(null);

            const req = new Request("http://localhost/api/v1/applications/app_1");
            const res = await GET(req, { params: { id: "app_1" } });
            expect(res.status).toBe(401);
        });

        it("returns 403 if user tries to access someone else's application", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({ user: mockUserTwo } as any);
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApp as any);

            const req = new Request("http://localhost/api/v1/applications/app_1");
            const res = await GET(req, { params: { id: "app_1" } });
            expect(res.status).toBe(403);
            const data = await res.json();
            expect(data.message).toBe("Forbidden");
        });

        it("returns 200 and the application if the user owns it", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({ user: mockUserOne } as any);
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApp as any);

            const req = new Request("http://localhost/api/v1/applications/app_1");
            const res = await GET(req, { params: { id: "app_1" } });
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toEqual(mockApp);
        });

        it("returns 404 if application is not found", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({ user: mockUserOne } as any);
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(null);

            const req = new Request("http://localhost/api/v1/applications/app_1");
            const res = await GET(req, { params: { id: "app_1" } });
            expect(res.status).toBe(404);
        });
    });

    describe("PUT /api/v1/applications/[id]", () => {
        it("returns 401 if user is not authenticated", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(null);

            const req = new Request("http://localhost/api/v1/applications/app_1", {
                method: "PUT",
                body: JSON.stringify({ companyName: "Meta" }),
            });
            const res = await PUT(req, { params: { id: "app_1" } });
            expect(res.status).toBe(401);
        });

        it("returns 400 if validation fails", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({ user: mockUserOne } as any);
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApp as any);

            const req = new Request("http://localhost/api/v1/applications/app_1", {
                method: "PUT",
                body: JSON.stringify({ companyName: "" }), // Empty company name should fail validation
            });
            const res = await PUT(req, { params: { id: "app_1" } });
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toBe("Validation error");
        });

        it("returns 403 if user tries to update someone else's application", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({ user: mockUserTwo } as any);
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApp as any);

            const req = new Request("http://localhost/api/v1/applications/app_1", {
                method: "PUT",
                body: JSON.stringify({ companyName: "Meta" }),
            });
            const res = await PUT(req, { params: { id: "app_1" } });
            expect(res.status).toBe(403);
        });

        it("returns 200 and updates the application if the user owns it", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({ user: mockUserOne } as any);
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApp as any);

            const expectedUpdatedApp = { ...mockApp, companyName: "Meta" };
            vi.mocked(prisma.application.update).mockResolvedValueOnce(expectedUpdatedApp as any);

            const req = new Request("http://localhost/api/v1/applications/app_1", {
                method: "PUT",
                body: JSON.stringify({ companyName: "Meta" }),
            });
            const res = await PUT(req, { params: { id: "app_1" } });
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toEqual(expectedUpdatedApp);
            expect(prisma.application.update).toHaveBeenCalledWith({
                where: { id: "app_1" },
                data: { companyName: "Meta" },
            });
        });
    });

    describe("DELETE /api/v1/applications/[id]", () => {
        it("returns 401 if user is not authenticated", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(null);

            const req = new Request("http://localhost/api/v1/applications/app_1", { method: "DELETE" });
            const res = await DELETE(req, { params: { id: "app_1" } });
            expect(res.status).toBe(401);
        });

        it("returns 403 if user tries to delete someone else's application", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({ user: mockUserTwo } as any);
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApp as any);

            const req = new Request("http://localhost/api/v1/applications/app_1", { method: "DELETE" });
            const res = await DELETE(req, { params: { id: "app_1" } });
            expect(res.status).toBe(403);
            expect(prisma.application.delete).not.toHaveBeenCalled();
        });

        it("returns 200 and deletes the application if the user owns it", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({ user: mockUserOne } as any);
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApp as any);

            const req = new Request("http://localhost/api/v1/applications/app_1", { method: "DELETE" });
            const res = await DELETE(req, { params: { id: "app_1" } });
            expect(res.status).toBe(200);
            expect(prisma.application.delete).toHaveBeenCalledWith({
                where: { id: "app_1" }
            });
        });
    });
});
