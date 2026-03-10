import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ApplicationTable, { getApplicationTableColumns } from "../../../components/Board/ApplicationTable";
import type { Application } from "../../../types";

// Setup matchMedia mock required natively by Ant Design for testing environments
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

const mockApps: Application[] = [
    {
        id: "app-1",
        company: "Vercel",
        role: "Frontend Engineer",
        status: "Applied",
        type: "Full-time",
        season: "Fall 2024",
    },
    {
        id: "app-2",
        company: "Stripe",
        role: "Backend Intern",
        status: "Offer",
        type: "Internship",
    }
];

describe("ApplicationTable", () => {
    it("renders the table with the mapped company and role components", () => {
        render(<ApplicationTable applications={mockApps} onRowClick={() => { }} />);

        expect(screen.getByText("Vercel")).toBeInTheDocument();
        expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
        expect(screen.getByText("Stripe")).toBeInTheDocument();
        expect(screen.getByText("Backend Intern")).toBeInTheDocument();
    });

    it("triggers the onRowClick callback when a row is clicked", () => {
        const handleClick = vi.fn();
        render(<ApplicationTable applications={mockApps} onRowClick={handleClick} />);

        // Find the text cell and click deeply onto the row wrapper
        const rowTrigger = screen.getByText("Vercel").closest('tr');
        if (rowTrigger) fireEvent.click(rowTrigger);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("safely renders missing optional columns", () => {
        const minimalApp: Application[] = [{
            id: "app-3",
            company: "Google",
            role: "Janitor",
            status: "Saved",
            type: "Full-time"
        }];

        render(<ApplicationTable applications={minimalApp} onRowClick={() => { }} />);
        expect(screen.getByText("Google")).toBeInTheDocument();
        // Missing Season renders the fallback '---'
        expect(screen.getAllByText("---").length).toBeGreaterThan(0);
    });

    it("runs the configured sorter algorithms without crashing", () => {
        // Render with complex dates to force execution of the custom `sorter` Time comparison functions
        const dateApps: Application[] = [
            ...mockApps,
            { id: "app-3", company: "Netflix", role: "Design", status: "Offer", type: "Internship", dateApplied: "2024-03-01T00:00:00Z", deadline: "2024-04-01T00:00:00Z" },
            { id: "app-4", company: "Amazon", role: "PM", status: "Rejected", type: "Full-time" }
        ];

        render(<ApplicationTable applications={dateApps} onRowClick={() => { }} />);

        // This query specifically targets Ant Design's sort toggle headers
        const roleHeader = screen.getAllByText("Role").find(el => el.closest('.ant-table-column-sorters'));
        const dateAppliedHeader = screen.getAllByText("Date Applied").find(el => el.closest('.ant-table-column-sorters'));
        const deadlineHeader = screen.getAllByText("Deadline").find(el => el.closest('.ant-table-column-sorters'));

        if (roleHeader) fireEvent.click(roleHeader);
        if (dateAppliedHeader) fireEvent.click(dateAppliedHeader);
        if (deadlineHeader) fireEvent.click(deadlineHeader);

        // Sorting is purely internal to AntD; ensuring these trigger synchronously covers the lines
        expect(screen.getByText("Netflix")).toBeInTheDocument();
        expect(screen.getByText("Amazon")).toBeInTheDocument();
    });
    it("triggers internal filtering and sorting logic natively for coverage", () => {
        // Evaluate the raw Columns configuration
        const minimalApp: Application = { id: "test", company: "Zeta", role: "A", status: "Offer", type: "Full-time", season: "Summer", dateApplied: "2024-05-01T00:00:00Z", deadline: "2024-06-01T00:00:00Z" };
        const comparisonApp: Application = { id: "test2", company: "Alpha", role: "B", status: "Applied", type: "Internship", season: "Fall", dateApplied: "2024-04-01T00:00:00Z" };
        const missingDateApp: Application = { id: "test3", company: "Beta", role: "C", status: "Saved", type: "Full-time" };

        const columns = getApplicationTableColumns([minimalApp, comparisonApp, missingDateApp]);

        // 1. Test Company Sorter
        const companyCol = columns.find(c => c.key === "company") as any;
        expect(companyCol.sorter(minimalApp, comparisonApp)).toBeGreaterThan(0); // Zeta > Alpha

        // 2. Test Role Sorter
        const roleCol = columns.find(c => c.key === "role") as any;
        expect(roleCol.sorter(minimalApp, comparisonApp)).toBeLessThan(0); // A < B

        // 3. Test Status Filter & Sorter
        const statusCol = columns.find(c => c.key === "status") as any;
        expect(statusCol.onFilter("Offer", minimalApp)).toBe(true);
        expect(statusCol.onFilter("Applied", minimalApp)).toBe(false);
        expect(statusCol.sorter(minimalApp, comparisonApp)).toBeGreaterThan(0); // Offer > Applied

        // 4. Test DateApplied Sorter (including missing dates)
        const dateAppCol = columns.find(c => c.key === "dateApplied") as any;
        expect(dateAppCol.sorter(missingDateApp, minimalApp)).toBe(-1); // missing is pushed down
        expect(dateAppCol.sorter(minimalApp, missingDateApp)).toBe(1);
        expect(dateAppCol.sorter(minimalApp, comparisonApp)).toBeGreaterThan(0);

        // 5. Test Deadline Sorter (including missing dates)
        const deadlineCol = columns.find(c => c.key === "deadline") as any;
        expect(deadlineCol.sorter(missingDateApp, minimalApp)).toBe(-1);
        expect(deadlineCol.sorter(minimalApp, missingDateApp)).toBe(1);
        expect(deadlineCol.sorter(minimalApp, comparisonApp)).toBeGreaterThan(0);

        // 6. Test Type Filter
        const typeCol = columns.find(c => c.key === "type") as any;
        expect(typeCol.onFilter("Full-time", minimalApp)).toBe(true);
        expect(typeCol.onFilter("Internship", minimalApp)).toBe(false);

        // 7. Test Season Filter
        const seasonCol = columns.find(c => c.key === "season") as any;
        expect(seasonCol.onFilter("Summer", minimalApp)).toBe(true);
        expect(seasonCol.onFilter("Fall", minimalApp)).toBe(false);
    });
});
