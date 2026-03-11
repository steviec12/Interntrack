import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../app/api/v1/auth/register/route';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

vi.mock('../../lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
    },
}));

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(),
    },
}));

describe('Auth Register API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 for invalid validation', async () => {
        const req = new Request('http://localhost/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email: 'invalid-email', password: '123' }),
        });
        const response = await POST(req);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toBe('Validation error');
    });

    it('should return 400 if user exists', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', email: 'test@test.com' } as any);

        const req = new Request('http://localhost/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
        });
        const response = await POST(req);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.message).toBe('User with this email already exists');
    });

    it('should register successfully and return 201', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
        vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as any);
        const mockUser = { id: 'new-id', email: 'test@test.com', createdAt: new Date() };
        vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);

        const req = new Request('http://localhost/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
        });
        const response = await POST(req);

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.message).toBe('User registered successfully');
        expect(data.user.id).toBe('new-id');
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should return 500 on database error', async () => {
        vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('DB Error'));

        const req = new Request('http://localhost/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
        });
        const response = await POST(req);

        expect(response.status).toBe(500);
    });
});
