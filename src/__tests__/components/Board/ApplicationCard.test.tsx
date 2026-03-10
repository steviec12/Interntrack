import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ApplicationCard, { STATUS_STYLES } from "../../../components/Board/ApplicationCard";
import type { Application } from "../../../types";
import { DndContext } from "@dnd-kit/core";

// Mock Data
const mockApp: Application = {
    id: "uuid-1234",
    userId: "user-1",
    company: "Meta",
    role: "Software Engineer",
    status: "Interview",
    type: "Internship",
    dateApplied: "2024-01-01T00:00:00Z",
    season: "Summer 2024",
    isRolling: true,
    deadline: "2024-02-01T00:00:00Z",
};

describe("ApplicationCard", () => {
    it("renders basic application details", () => {
        render(
            <DndContext>
                <ApplicationCard app={mockApp} onClick={() => { }} />
            </DndContext>
        );

        expect(screen.getByText("Meta")).toBeInTheDocument();
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
        expect(screen.getByText("Interview")).toBeInTheDocument();
    });

    it("conditionally renders additional tags like season and rolling", () => {
        render(
            <DndContext>
                <ApplicationCard app={mockApp} onClick={() => { }} />
            </DndContext>
        );

        expect(screen.getByText("Summer 2024")).toBeInTheDocument();
        expect(screen.getByText("Rolling")).toBeInTheDocument();
    });

    it("triggers the onClick callback when pressed", () => {
        const handleClick = vi.fn();
        render(
            <DndContext>
                <ApplicationCard app={mockApp} onClick={handleClick} />
            </DndContext>
        );

        fireEvent.click(screen.getByText("Meta"));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("formats the date Applied properly", () => {
        render(
            <DndContext>
                <ApplicationCard app={mockApp} onClick={() => { }} />
            </DndContext>
        );
        // Validates `toLocaleDateString("en-US", { month: "short", day: "numeric", ... })`
        expect(screen.getByText(/Applied/)).toHaveTextContent("Jan 1, 2024");
    });

    it("handles missing optional tags securely", () => {
        const minimalApp: Application = {
            id: "uuid-456",
            userId: "user-1",
            company: "Google",
            role: "Janitor",
            status: "Saved",
            type: "Full-time",
        };

        render(
            <DndContext>
                <ApplicationCard app={minimalApp} onClick={() => { }} />
            </DndContext>
        );

        expect(screen.getByText("Google")).toBeInTheDocument();
        expect(screen.getByText("Saved")).toBeInTheDocument();
        expect(screen.queryByText("Rolling")).not.toBeInTheDocument();
        // Tests edge case rendering "Full-time" tag
        expect(screen.getByText("Full-time")).toBeInTheDocument();
    });

    it("shows urgency indicator for rolling apps in Saved status", () => {
        const urgentApp: Application = {
            id: "uuid-urgent",
            userId: "user-1",
            company: "Netflix",
            role: "Backend Engineer",
            status: "Saved",
            type: "Internship",
            isRolling: true,
        };

        render(
            <DndContext>
                <ApplicationCard app={urgentApp} onClick={() => { }} />
            </DndContext>
        );

        expect(screen.getByText("Rolling")).toBeInTheDocument();
        expect(screen.getByText("Apply soon")).toBeInTheDocument();
    });

    it("does NOT show urgency indicator for rolling apps in non-Saved status", () => {
        // mockApp has isRolling: true but status: "Interview"
        render(
            <DndContext>
                <ApplicationCard app={mockApp} onClick={() => { }} />
            </DndContext>
        );

        expect(screen.getByText("Rolling")).toBeInTheDocument();
        expect(screen.queryByText("Apply soon")).not.toBeInTheDocument();
    });

    it("renders deadline badge with formatted date", () => {
        render(
            <DndContext>
                <ApplicationCard app={mockApp} onClick={() => { }} />
            </DndContext>
        );

        expect(screen.getByText(/Due/)).toHaveTextContent("Feb 1, 2024");
    });
});
