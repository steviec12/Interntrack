import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BoardColumn from "../../../components/Board/BoardColumn";
import type { Application } from "../../../types";
import { DndContext } from "@dnd-kit/core";

const mockApps: Application[] = [
    {
        id: "app-1",
        userId: "user-1",
        company: "Tesla",
        role: "Data Scientist",
        status: "Applied",
        type: "Internship",
    },
    {
        id: "app-2",
        userId: "user-1",
        company: "Apple",
        role: "Frontend Dev",
        status: "Applied",
        type: "Internship",
    }
];

describe("BoardColumn", () => {
    it("renders the column title and application count badge", () => {
        render(
            <DndContext>
                <BoardColumn title="Applied" applications={mockApps} onCardClick={() => { }} />
            </DndContext>
        );

        // We use getAllByText because "Applied" appears in both the column header and the nested ApplicationCard status pills
        expect(screen.getAllByText("Applied").length).toBeGreaterThan(0);
        // The count bubble badge should render exactly '2'
        expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("renders all the passed applications through the ApplicationCard mapper", () => {
        render(
            <DndContext>
                <BoardColumn title="Applied" applications={mockApps} onCardClick={() => { }} />
            </DndContext>
        );

        // Verify that both cards were cascaded into the wrapper
        expect(screen.getByText("Tesla")).toBeInTheDocument();
        expect(screen.getByText("Apple")).toBeInTheDocument();
    });

    it("safely handles 0 applications by rendering an empty column", () => {
        render(
            <DndContext>
                <BoardColumn title="Offer" applications={[]} onCardClick={() => { }} />
            </DndContext>
        );

        expect(screen.getByText("Offer")).toBeInTheDocument();
        expect(screen.getByText("0")).toBeInTheDocument();
        expect(screen.queryByText("Tesla")).not.toBeInTheDocument();
    });
});
