"use client";

import React, { useRef, useEffect } from "react";

interface DuplicateWarningModalProps {
    isOpen: boolean;
    existingApp: {
        companyName: string;
        roleTitle: string;
        status: string;
        dateApplied?: string | null;
    };
    onSaveAnyway: () => void;
    onViewExisting: () => void;
    onCancel: () => void;
}

export default function DuplicateWarningModal({
    isOpen,
    existingApp,
    onSaveAnyway,
    onViewExisting,
    onCancel,
}: DuplicateWarningModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen && !dialog.open) {
            dialog.showModal();
        } else if (!isOpen && dialog.open) {
            dialog.close();
        }
    }, [isOpen]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const handleClose = () => onCancel();
        dialog.addEventListener("close", handleClose);
        return () => dialog.removeEventListener("close", handleClose);
    }, [onCancel]);

    const formattedDate = existingApp.dateApplied
        ? new Date(existingApp.dateApplied).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
        })
        : "N/A";

    return (
        <dialog
            ref={dialogRef}
            className="m-auto w-[440px] rounded-xl border-0 bg-surface p-6 shadow-[var(--shadow-modal)] backdrop:bg-black/30"
        >
            {/* Warning Icon + Title */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-warning/15 flex items-center justify-center text-xl">
                    ⚠️
                </div>
                <h2 className="text-base font-bold text-text">
                    Potential Duplicate Found
                </h2>
            </div>

            {/* Explanation */}
            <p className="text-[13px] text-text-muted mb-4">
                An application with a similar company and role already exists:
            </p>

            {/* Existing Entry Details */}
            <div className="rounded-lg border border-border bg-background p-4 mb-5">
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                    <div>
                        <span className="text-text-muted">Company</span>
                        <p className="font-semibold text-text">{existingApp.companyName}</p>
                    </div>
                    <div>
                        <span className="text-text-muted">Role</span>
                        <p className="font-semibold text-text">{existingApp.roleTitle}</p>
                    </div>
                    <div>
                        <span className="text-text-muted">Status</span>
                        <p className="font-medium text-text">{existingApp.status}</p>
                    </div>
                    <div>
                        <span className="text-text-muted">Date Applied</span>
                        <p className="font-medium text-text">{formattedDate}</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="h-9 px-4 text-[13px] font-medium text-text bg-surface border border-border rounded-md hover:bg-background transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onViewExisting}
                    className="h-9 px-4 text-[13px] font-medium text-primary bg-primary-light border border-primary/20 rounded-md hover:bg-primary/10 transition-colors cursor-pointer"
                >
                    View Existing
                </button>
                <button
                    type="button"
                    onClick={onSaveAnyway}
                    className="h-9 px-4 text-[13px] font-semibold text-white bg-warning hover:bg-warning/90 rounded-md transition-colors cursor-pointer"
                >
                    Save Anyway
                </button>
            </div>
        </dialog>
    );
}
