import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Application as PrismaApplication } from "@prisma/client";
import type { Session } from "next-auth";
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
const createSession = (userId: string): Session => ({
    expires: "2099-01-01T00:00:00.000Z",
    user: {
        id: userId,
        email: null,
        name: null,
        image: null,
    },
});
const mockApp: PrismaApplication = {
    id: "app_1",
    userId: "user_1",
    companyName: "Google",
    roleTitle: "SWE",
    url: null,
    location: null,
    season: null,
    isRolling: false,
    notes: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    reflectionNote: null,
    rejectionReason: null,
    salaryRange: null,
    dateApplied: null,
    status: "Saved",
    type: "Internship",
    deadline: null,
    deadlineType: null,
    reminderDate: null,
    reminderDone: false,
};
const routeContext = (id = "app_1") => ({
    params: Promise.resolve({ id }),
});
const toJsonApplication = (app: PrismaApplication) => ({
    ...app,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
    dateApplied: app.dateApplied?.toISOString() ?? null,
    deadline: app.deadline?.toISOString() ?? null,
    reminderDate: app.reminderDate?.toISOString() ?? null,
});

describe("Applications [ID] API", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("GET /api/v1/applications/[id]", () => {
        it("returns 401 if user is not authenticated", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(null);

            const req = new Request("http://localhost/api/v1/applications/app_1");
            const res = await GET(req, routeContext());
            expect(res.status).toBe(401);
        });

        it("returns 403 if user tries to access someone else's application", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(createSession(mockUserTwo.id));
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApp);

            const req = new Request("http://localhost/api/v1/applications/app_1");
            const res = await GET(req, routeContext());
            expect(res.status).toBe(403);
            const data = await res.json();
            expect(data.message).toBe("Forbidden");
        });

        it("returns 200 and the application if the user owns it", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(createSession(mockUserOne.id));
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApp);

            const req = new Request("http://localhost/api/v1/applications/app_1");
            const res = await GET(req, routeContext());
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toEqual(toJsonApplication(mockApp));
        });

        it("returns 404 if application is not found", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(createSession(mockUserOne.id));
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(null);

            const req = new Request("http://localhost/api/v1/applications/app_1");
            const res = await GET(req, routeContext());
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
            const res = await PUT(req, routeContext());
            expect(res.status).toBe(401);
        });

        it("returns 400 if validation fails", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(createSession(mockUserOne.id));
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApp);

            const req = new Request("http://localhost/api/v1/applications/app_1", {
                method: "PUT",
                body: JSON.stringify({ companyName: "" }), // Empty company name should fail validation
            });
            const res = await PUT(req, routeContext());
            expect(res.status).toBe(400);
            const data = await res.json();
            expect(data.message).toBe("Validation error");
        });

        it("returns 403 if user tries to update someone else's application", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(createSession(mockUserTwo.id));
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApp);

            const req = new Request("http://localhost/api/v1/applications/app_1", {
                method: "PUT",
                body: JSON.stringify({ companyName: "Meta" }),
            });
            const res = await PUT(req, routeContext());
            expect(res.status).toBe(403);
        });

        it("returns 200 and updates the application if the user owns it", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(createSession(mockUserOne.id));
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApp);

            const expectedUpdatedApp: PrismaApplication = { ...mockApp, companyName: "Meta" };
            vi.mocked(prisma.application.update).mockResolvedValueOnce(expectedUpdatedApp);

            const req = new Request("http://localhost/api/v1/applications/app_1", {
                method: "PUT",
                body: JSON.stringify({ companyName: "Meta" }),
            });
            const res = await PUT(req, routeContext());
            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data).toEqual(toJsonApplication(expectedUpdatedApp));
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
            const res = await DELETE(req, routeContext());
            expect(res.status).toBe(401);
        });

        it("returns 403 if user tries to delete someone else's application", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(createSession(mockUserTwo.id));
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApp);

            const req = new Request("http://localhost/api/v1/applications/app_1", { method: "DELETE" });
            const res = await DELETE(req, routeContext());
            expect(res.status).toBe(403);
            expect(prisma.application.delete).not.toHaveBeenCalled();
        });

        it("returns 200 and deletes the application if the user owns it", async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(createSession(mockUserOne.id));
            vi.mocked(prisma.application.findUnique).mockResolvedValueOnce(mockApp);

            const req = new Request("http://localhost/api/v1/applications/app_1", { method: "DELETE" });
            const res = await DELETE(req, routeContext());
            expect(res.status).toBe(200);
            expect(prisma.application.delete).toHaveBeenCalledWith({
                where: { id: "app_1" }
            });
        });
    });
});
