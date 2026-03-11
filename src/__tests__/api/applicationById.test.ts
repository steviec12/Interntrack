import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from '../../app/api/v1/applications/[id]/route';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../lib/prisma';

// Mock dependencies
vi.mock('next-auth/next', () => ({
    getServerSession: vi.fn(),
}));

vi.mock('../../lib/auth', () => ({
    authOptions: {},
}));

vi.mock('../../lib/prisma', () => ({
    prisma: {
        application: {
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

describe('Application [id] API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/v1/applications/[id]', () => {
        it('should return 401 if unauthorized', async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);

            const req = new Request('http://localhost/api/v1/applications/app-1');
            const response = await GET(req, { params: Promise.resolve({ id: 'app-1' }) });

            expect(response.status).toBe(401);
        });

        it('should return 404 if application not found', async () => {
            const mockSession = { user: { id: 'user-123' } };
            vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.application.findUnique).mockResolvedValue(null);

            const req = new Request('http://localhost/api/v1/applications/app-1');
            const response = await GET(req, { params: Promise.resolve({ id: 'app-1' }) });

            expect(response.status).toBe(404);
        });

        it('should return 403 if application belongs to someone else', async () => {
            const mockSession = { user: { id: 'user-123' } };
            const mockApp = { id: 'app-1', userId: 'user-456' };

            vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.application.findUnique).mockResolvedValue(mockApp as any);

            const req = new Request('http://localhost/api/v1/applications/app-1');
            const response = await GET(req, { params: Promise.resolve({ id: 'app-1' }) });

            expect(response.status).toBe(403);
        });

        it('should return application if found and owner matches', async () => {
            const mockSession = { user: { id: 'user-123' } };
            const mockApp = { id: 'app-1', userId: 'user-123', companyName: 'Google' };

            vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.application.findUnique).mockResolvedValue(mockApp as any);

            const req = new Request('http://localhost/api/v1/applications/app-1');
            const response = await GET(req, { params: Promise.resolve({ id: 'app-1' }) });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toEqual(mockApp);
        });
    });

    describe('PUT /api/v1/applications/[id]', () => {
        it('should return 401 if unauthorized', async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);

            const req = new Request('http://localhost/api/v1/applications/app-1', {
                method: 'PUT',
                body: JSON.stringify({ companyName: 'Google' }),
            });
            const response = await PUT(req, { params: Promise.resolve({ id: 'app-1' }) });

            expect(response.status).toBe(401);
        });

        it('should return 400 on validation error', async () => {
            const mockSession = { user: { id: 'user-123' } };
            const mockApp = { id: 'app-1', userId: 'user-123' };

            vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.application.findUnique).mockResolvedValue(mockApp as any);

            // Using empty string which violates schema if provided
            const req = new Request('http://localhost/api/v1/applications/app-1', {
                method: 'PUT',
                body: JSON.stringify({ companyName: '' }),
            });
            const response = await PUT(req, { params: Promise.resolve({ id: 'app-1' }) });

            expect(response.status).toBe(400);
        });

        it('should update application with valid data', async () => {
            const mockSession = { user: { id: 'user-123' } };
            const mockApp = { id: 'app-1', userId: 'user-123' };
            const payload = { companyName: 'Meta' };
            const updatedApp = { ...mockApp, ...payload };

            vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.application.findUnique).mockResolvedValue(mockApp as any);
            vi.mocked(prisma.application.update).mockResolvedValue(updatedApp as any);

            const req = new Request('http://localhost/api/v1/applications/app-1', {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            const response = await PUT(req, { params: Promise.resolve({ id: 'app-1' }) });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.companyName).toBe('Meta');
            expect(prisma.application.update).toHaveBeenCalledWith({
                where: { id: 'app-1' },
                data: payload,
            });
        });
    });

    describe('DELETE /api/v1/applications/[id]', () => {
        it('should return 401 if unauthorized', async () => {
            vi.mocked(getServerSession).mockResolvedValue(null);

            const req = new Request('http://localhost/api/v1/applications/app-1', { method: 'DELETE' });
            const response = await DELETE(req, { params: Promise.resolve({ id: 'app-1' }) });

            expect(response.status).toBe(401);
        });

        it('should delete application and return 200', async () => {
            const mockSession = { user: { id: 'user-123' } };
            const mockApp = { id: 'app-1', userId: 'user-123' };

            vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.application.findUnique).mockResolvedValue(mockApp as any);
            vi.mocked(prisma.application.delete).mockResolvedValue(mockApp as any);

            const req = new Request('http://localhost/api/v1/applications/app-1', { method: 'DELETE' });
            const response = await DELETE(req, { params: Promise.resolve({ id: 'app-1' }) });

            expect(response.status).toBe(200);
            expect(prisma.application.delete).toHaveBeenCalledWith({ where: { id: 'app-1' } });
        });
    });
});
