import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DuplicateWarningModal from "../../../components/Forms/DuplicateWarningModal";

// Mock HTMLDialogElement methods (not supported in jsdom)
beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
});

const mockExistingApp = {
    companyName: "Google",
    roleTitle: "SWE Intern",
    status: "Applied",
    dateApplied: "2026-02-15T00:00:00.000Z",
};

describe("DuplicateWarningModal", () => {
    it("renders the modal with existing application details", () => {
        render(
            <DuplicateWarningModal
                isOpen={true}
                existingApp={mockExistingApp}
                onSaveAnyway={vi.fn()}
                onViewExisting={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        expect(screen.getByText("Potential Duplicate Found")).toBeTruthy();
        expect(screen.getByText("Google")).toBeTruthy();
        expect(screen.getByText("SWE Intern")).toBeTruthy();
        expect(screen.getByText("Applied")).toBeTruthy();
        expect(screen.getByText("Feb 15, 2026")).toBeTruthy();
    });

    it("shows N/A when dateApplied is null", () => {
        render(
            <DuplicateWarningModal
                isOpen={true}
                existingApp={{ ...mockExistingApp, dateApplied: null }}
                onSaveAnyway={vi.fn()}
                onViewExisting={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        expect(screen.getByText("N/A")).toBeTruthy();
    });

    it("calls onSaveAnyway when Save Anyway button is clicked", () => {
        const onSaveAnyway = vi.fn();
        render(
            <DuplicateWarningModal
                isOpen={true}
                existingApp={mockExistingApp}
                onSaveAnyway={onSaveAnyway}
                onViewExisting={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText("Save Anyway"));
        expect(onSaveAnyway).toHaveBeenCalledOnce();
    });

    it("calls onViewExisting when View Existing button is clicked", () => {
        const onViewExisting = vi.fn();
        render(
            <DuplicateWarningModal
                isOpen={true}
                existingApp={mockExistingApp}
                onSaveAnyway={vi.fn()}
                onViewExisting={onViewExisting}
                onCancel={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText("View Existing"));
        expect(onViewExisting).toHaveBeenCalledOnce();
    });

    it("calls onCancel when Cancel button is clicked", () => {
        const onCancel = vi.fn();
        render(
            <DuplicateWarningModal
                isOpen={true}
                existingApp={mockExistingApp}
                onSaveAnyway={vi.fn()}
                onViewExisting={vi.fn()}
                onCancel={onCancel}
            />
        );

        fireEvent.click(screen.getByText("Cancel"));
        expect(onCancel).toHaveBeenCalledOnce();
    });

    it("does not show modal when isOpen is false", () => {
        // Clear accumulated calls from previous tests
        vi.mocked(HTMLDialogElement.prototype.showModal).mockClear();

        render(
            <DuplicateWarningModal
                isOpen={false}
                existingApp={mockExistingApp}
                onSaveAnyway={vi.fn()}
                onViewExisting={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        // showModal should not have been called
        expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
    });
});
