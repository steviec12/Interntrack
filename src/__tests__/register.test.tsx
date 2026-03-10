import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RegisterPage from "../app/register/page";
import { signIn } from "next-auth/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
    signIn: vi.fn(),
}));

describe("Register Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the registration form elements", () => {
        render(<RegisterPage />);
        expect(screen.getByText("Create a new account")).toBeInTheDocument();
        expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
    });

    it("shows an error if passwords do not match", async () => {
        render(<RegisterPage />);

        fireEvent.change(screen.getByLabelText(/Email address/i), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByLabelText(/^Password$/i), {
            target: { value: "password123" },
        });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
            target: { value: "password456" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Register/i }));

        expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    });

    it("submits the form successfully and signs in", async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ message: "User registered successfully" }),
        });

        vi.mocked(signIn).mockResolvedValueOnce({ error: null, status: 200, ok: true } as any);

        render(<RegisterPage />);

        fireEvent.change(screen.getByLabelText(/Email address/i), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByLabelText(/^Password$/i), {
            target: { value: "password123" },
        });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
            target: { value: "password123" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Register/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith("/api/v1/auth/register", expect.any(Object));
            expect(signIn).toHaveBeenCalledWith("credentials", {
                redirect: false,
                email: "test@example.com",
                password: "password123",
            });
        });
    });

    it("shows an error if the registration API fails", async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ message: "Email already exists" }),
        });

        render(<RegisterPage />);

        fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "password123" } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "password123" } });
        fireEvent.click(screen.getByRole("button", { name: /Register/i }));

        expect(await screen.findByText("Email already exists")).toBeInTheDocument();
    });

    it("shows an error if the automatic sign in fails post-registration", async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ message: "Registered" }),
        });

        vi.mocked(signIn).mockResolvedValueOnce({ error: "Auto Login Failed", status: 500, ok: false } as any);

        render(<RegisterPage />);

        fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "password" } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "password" } });
        fireEvent.click(screen.getByRole("button", { name: /Register/i }));

        expect(await screen.findByText("Auto Login Failed")).toBeInTheDocument();
    });
});
