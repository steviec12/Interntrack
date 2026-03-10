"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface NavBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    typeFilter: string;
    onTypeFilterChange: (type: string) => void;
    seasonFilter: string;
    onSeasonFilterChange: (season: string) => void;
    onAddClick: () => void;
}

const NAV_TABS = ["Board", "Table", "Dashboard"];
const TYPE_FILTERS = ["All", "Internship", "Full-time"];
const SEASON_OPTIONS = [
    "All",
    "Spring 2026",
    "Summer 2026",
    "Fall 2026",
    "Winter 2026",
];

export default function NavBar({
    activeTab,
    onTabChange,
    typeFilter,
    onTypeFilterChange,
    seasonFilter,
    onSeasonFilterChange,
    onAddClick,
}: NavBarProps) {
    const { data: session, status } = useSession();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-surface border-b border-border shadow-[var(--shadow-sm)]">
            <div className="h-full mx-auto max-w-full px-6 flex items-center justify-between">
                {/* Left Section: Brand + Nav Tabs */}
                <div className="flex items-center gap-6">
                    {/* Brand Wordmark */}
                    <span className="text-xl font-bold text-primary tracking-tight select-none">
                        InternTrack
                    </span>

                    {/* Navigation Tabs */}
                    <nav className="flex items-center gap-1">
                        {NAV_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => onTabChange(tab)}
                                className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors cursor-pointer ${activeTab === tab
                                    ? "bg-primary text-white"
                                    : "text-text-muted hover:bg-primary-light"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right Section: Filters + Add Button + Avatar */}
                <div className="flex items-center gap-4">
                    {/* Type Segmented Control */}
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        {TYPE_FILTERS.map((type) => (
                            <button
                                key={type}
                                onClick={() => onTypeFilterChange(type)}
                                className={`px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${typeFilter === type
                                    ? "bg-primary text-white"
                                    : "bg-surface text-text-muted hover:bg-primary-light"
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Season Dropdown */}
                    <select
                        value={seasonFilter}
                        onChange={(e) => onSeasonFilterChange(e.target.value)}
                        className="h-8 px-3 text-[12px] font-medium text-text-muted bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
                    >
                        {SEASON_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>

                    {status === "authenticated" ? (
                        <>
                            {/* Add Application Button */}
                            <button
                                onClick={onAddClick}
                                className="h-8 px-4 text-[13px] font-semibold text-white bg-primary hover:bg-primary-hover rounded-md transition-colors shadow-sm cursor-pointer"
                            >
                                + Add Application
                            </button>

                            {/* User Avatar & Logout */}
                            <div className="flex items-center gap-3 ml-2">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-[12px] font-semibold select-none">
                                    {session.user?.email?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="text-[13px] font-medium text-text-muted hover:text-text transition-colors cursor-pointer"
                                >
                                    Log out
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 ml-2">
                            <Link
                                href="/login"
                                className="text-[13px] font-medium text-text-muted hover:text-text transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="h-8 px-4 inline-flex items-center text-[13px] font-semibold text-white bg-primary hover:bg-primary-hover rounded-md transition-colors shadow-sm"
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
