import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../../app/api/v1/applications/route';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../lib/prisma';

// Mock dependencies
vi.mock('next-auth/next', () => ({
    getServerSession: vi.fn(),
}));

// We need to mock the authOptions as it is imported by the route
vi.mock('../../lib/auth', () => ({
    authOptions: {},
}));

vi.mock('../../lib/prisma', () => ({
    prisma: {
        application: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
    },
}));

describe('Applications API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/v1/applications', () => {
        it('should return 401 if unauthorized', async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);

            const req = new Request('http://localhost/api/v1/applications');
            const response = await GET(req);

            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.message).toBe('Unauthorized');
        });

        it('should return applications for authenticated user', async () => {
            const mockSession = { user: { id: 'user-123', email: 'test@test.com' } };
            const mockApps = [{ id: 'app-1', companyName: 'Google' }];

            vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.application.findMany).mockResolvedValue(mockApps as any);

            const req = new Request('http://localhost/api/v1/applications');
            const response = await GET(req);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual(mockApps);
            expect(prisma.application.findMany).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should return 500 on database error', async () => {
            const mockSession = { user: { id: 'user-123' } };
            vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.application.findMany).mockRejectedValue(new Error('DB Error'));

            const req = new Request('http://localhost/api/v1/applications');
            const response = await GET(req);

            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data.message).toBe('Internal server error');
        });
    });

    describe('POST /api/v1/applications', () => {
        it('should return 401 if unauthorized', async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);

            const req = new Request('http://localhost/api/v1/applications', {
                method: 'POST',
                body: JSON.stringify({ companyName: 'Google' }),
            });
            const response = await POST(req);

            expect(response.status).toBe(401);
        });

        it('should return 400 on Zod validation error', async () => {
            const mockSession = { user: { id: 'user-123' } };
            vi.mocked(getServerSession).mockResolvedValue(mockSession as any);

            // Missing required fields like roleTitle
            const req = new Request('http://localhost/api/v1/applications', {
                method: 'POST',
                body: JSON.stringify({ companyName: 'Google' }),
            });
            const response = await POST(req);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.message).toBe('Validation error');
            expect(data.errors).toBeDefined();
        });

        it('should create an application on valid data', async () => {
            const mockSession = { user: { id: 'user-123' } };
            const validPayload = {
                companyName: 'Google',
                roleTitle: 'Software Engineer',
                url: 'https://google.com/careers',
                status: 'Applied',
                type: 'FullTime',
                isRolling: false,
            };

            const createdApp = { id: 'new-app-1', ...validPayload, userId: 'user-123' };

            vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.application.create).mockResolvedValue(createdApp as any);

            const req = new Request('http://localhost/api/v1/applications', {
                method: 'POST',
                body: JSON.stringify(validPayload),
            });
            const response = await POST(req);

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data).toEqual(createdApp);
            expect(prisma.application.create).toHaveBeenCalledWith({
                data: {
                    ...validPayload,
                    userId: 'user-123',
                },
            });
        });

        it('should return 500 on database error during creation', async () => {
            const mockSession = { user: { id: 'user-123' } };
            const validPayload = {
                companyName: 'Google',
                roleTitle: 'Software Engineer',
                status: 'Applied',
                type: 'FullTime',
                isRolling: false,
            };

            vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.application.create).mockRejectedValue(new Error('DB Error'));

            const req = new Request('http://localhost/api/v1/applications', {
                method: 'POST',
                body: JSON.stringify(validPayload),
            });
            const response = await POST(req);

            expect(response.status).toBe(500);
        });
    });
});
