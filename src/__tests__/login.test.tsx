import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "../app/login/page";
import { signIn } from "next-auth/react";

// Mock next/navigation
vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
    useSearchParams: () => ({
        get: vi.fn(),
    }),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
    signIn: vi.fn(),
}));

describe("Login Page", () => {
    it("renders the login form elements", () => {
        render(<LoginPage />);
        expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
        expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument();
    });

    it("calls NextAuth signIn on submit", async () => {
        vi.mocked(signIn).mockResolvedValueOnce({ error: null, status: 200, ok: true } as any);

        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText(/Email address/i), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: "password123" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

        await waitFor(() => {
            expect(signIn).toHaveBeenCalledWith("credentials", {
                redirect: false,
                email: "test@example.com",
                password: "password123",
                callbackUrl: "/",
            });
        });
    });

    it("displays an error message when signIn fails", async () => {
        vi.mocked(signIn).mockResolvedValueOnce({ error: "CredentialsSignin", status: 401, ok: false } as any);

        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: "wrong@example.com" } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "wrongpass" } });
        fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

        expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
    });

    it("displays generic error message for unexpected failures", async () => {
        vi.mocked(signIn).mockRejectedValueOnce(new Error("Network Error"));

        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "password" } });
        fireEvent.click(screen.getByRole("button", { name: /Sign in/i }));

        expect(await screen.findByText("An unexpected error occurred")).toBeInTheDocument();
    });
});
