"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/v1/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Registration failed");
            }

            // Automatically log in after registration
            const signInRes = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (signInRes?.error) {
                throw new Error(signInRes.error);
            }

            router.push("/");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
                    InternTrack
                </h2>
                <h2 className="mt-2 text-center text-xl font-bold text-text">
                    Create a new account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-surface py-8 px-4 shadow-[var(--shadow-card)] sm:rounded-lg sm:px-10 border border-border">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-danger/10 text-danger text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-text"
                            >
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-text"
                            >
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-text"
                            >
                                Confirm Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-surface"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                            >
                                {loading ? "Registering..." : "Register"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-text-muted">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-primary hover:text-primary-hover"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
