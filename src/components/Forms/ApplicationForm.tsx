"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { applicationService, CreateApplicationData, UpdateApplicationData } from "../../services/applicationService";
import type {
    Application,
    ApplicationStatus,
    ApplicationType,
} from "../../types";

interface ApplicationFormProps {
    app: Application | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (app: Application) => void;
}

const STATUS_OPTIONS: ApplicationStatus[] = [
    "Saved",
    "Applied",
    "Phone Screen",
    "Interview",
    "Offer",
    "Rejected",
];

const SEASON_OPTIONS = [
    "Spring 2026",
    "Summer 2026",
    "Fall 2026",
    "Winter 2026",
];

const TYPE_OPTIONS: ApplicationType[] = ["Internship", "Full-time"];

// Map user-friendly frontend labels to Prisma/Zod backend enum values
const STATUS_TO_BACKEND: Record<string, string> = {
    "Saved": "Saved",
    "Applied": "Applied",
    "Phone Screen": "Interviewing",
    "Interview": "Interviewing",
    "Offer": "Offer",
    "Rejected": "Rejected",
};

const TYPE_TO_BACKEND: Record<string, string> = {
    "Internship": "Internship",
    "Full-time": "FullTime",
};

export default function ApplicationForm({
    app,
    isOpen,
    onClose,
    onSave,
}: ApplicationFormProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Store localized form errors for Zod misses
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
        const handleClose = () => {
            // Unset errors if they manually close
            setFormErrors({});
            onClose();
        };
        dialog.addEventListener("close", handleClose);
        return () => dialog.removeEventListener("close", handleClose);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormErrors({});
        const fd = new FormData(e.currentTarget);

        const company = fd.get("company") as string;
        const role = fd.get("role") as string;

        if (!company.trim()) {
            setFormErrors(prev => ({ ...prev, company: "Company Name is required" }));
            return;
        }
        if (!role.trim()) {
            setFormErrors(prev => ({ ...prev, role: "Role Title is required" }));
            return;
        }

        setIsSubmitting(true);

        try {
            // Helper to safely cast empty HTML text inputs to strictly null for Zod
            const getNullableString = (key: string): string | null => {
                const val = fd.get(key) as string;
                if (!val) return null;
                const trimmed = val.trim();
                return trimmed === "" ? null : trimmed;
            };

            // Build strictly typed API payload
            const rawStatus = (fd.get("status") as string) || "Saved";
            const rawType = (fd.get("type") as string) || "Internship";

            const payload = {
                companyName: company,
                roleTitle: role,
                url: getNullableString("url"),
                location: getNullableString("location"),
                salaryRange: getNullableString("salary"),
                dateApplied: getNullableString("dateApplied") ? new Date(fd.get("dateApplied") as string).toISOString() : null,
                status: STATUS_TO_BACKEND[rawStatus] || rawStatus,
                type: TYPE_TO_BACKEND[rawType] || rawType,
                season: getNullableString("season"),
                deadline: getNullableString("deadline") ? new Date(fd.get("deadline") as string).toISOString() : null,
                isRolling: fd.get("isRolling") === "on",
                notes: getNullableString("notes"),
            };

            let savedApplication: Application;

            // Trigger corresponding REST call
            if (app?.id) {
                // We are updating an existing
                const serverResponse = await applicationService.updateApplication(String(app.id), payload as UpdateApplicationData);

                // Convert Application model to component's expected shape and push to UI state
                savedApplication = {
                    ...app,
                    ...payload,
                    // Re-mapping keys back to frontend interfaces temporarily
                    company: serverResponse.companyName,
                    role: serverResponse.roleTitle,
                    salary: serverResponse.salaryRange ?? undefined,
                    id: serverResponse.id,
                } as any;

                toast.success("Application updated successfully!");

            } else {
                // We are creating new
                const serverResponse = await applicationService.createApplication(payload as CreateApplicationData);

                savedApplication = {
                    ...payload,
                    company: serverResponse.companyName,
                    role: serverResponse.roleTitle,
                    salary: serverResponse.salaryRange ?? undefined,
                    id: serverResponse.id,
                } as any;

                toast.success("Application created successfully!");
            }

            onSave(savedApplication);
            formRef.current?.reset();

        } catch (error: any) {
            toast.error(error.message || "Failed to save application");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        formRef.current?.reset();
        setFormErrors({});
        onClose();
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <dialog
            ref={dialogRef}
            className="m-auto w-[520px] max-h-[85vh] overflow-y-auto rounded-xl border-0 bg-surface p-7 shadow-[var(--shadow-modal)] backdrop:bg-black/30"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text">
                    {app ? "Edit Application" : "Add Application"}
                </h2>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-text-muted hover:bg-primary-light hover:text-text transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit}>
                {/* Core Fields — 2-column grid */}
                <div className="grid grid-cols-2 gap-3.5">
                    {/* Company Name */}
                    <div>
                        <label
                            htmlFor="company"
                            className={`block text-xs font-normal mb-1 ${formErrors.company ? "text-danger" : "text-text-muted"}`}
                        >
                            {formErrors.company ? formErrors.company : "Company Name"} {<span className="text-danger">*</span>}
                        </label>
                        <input
                            id="company"
                            name="company"
                            type="text"
                            required
                            placeholder="e.g. Google"
                            defaultValue={app?.company ?? ""}
                            className={`w-full h-9 px-3 text-[13px] text-text bg-surface border rounded-md placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${formErrors.company ? "border-danger" : "border-border focus:border-primary"}`}
                        />
                    </div>

                    {/* Role Title */}
                    <div>
                        <label
                            htmlFor="role"
                            className={`block text-xs font-normal mb-1 ${formErrors.role ? "text-danger" : "text-text-muted"}`}
                        >
                            {formErrors.role ? formErrors.role : "Role Title"} {<span className="text-danger">*</span>}
                        </label>
                        <input
                            id="role"
                            name="role"
                            type="text"
                            required
                            placeholder="e.g. SWE Intern"
                            defaultValue={app?.role ?? ""}
                            className={`w-full h-9 px-3 text-[13px] text-text bg-surface border rounded-md placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${formErrors.role ? "border-danger" : "border-border focus:border-primary"}`}
                        />
                    </div>
                </div>

                {/* URL — full width */}
                <div className="mt-3.5">
                    <label
                        htmlFor="url"
                        className="block text-xs font-normal text-text-muted mb-1"
                    >
                        Job URL
                    </label>
                    <input
                        id="url"
                        name="url"
                        type="url"
                        placeholder="https://..."
                        defaultValue={app?.url ?? ""}
                        className="w-full h-9 px-3 text-[13px] text-text bg-surface border border-border rounded-md placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                </div>

                {/* Location + Salary */}
                <div className="grid grid-cols-2 gap-3.5 mt-3.5">
                    <div>
                        <label
                            htmlFor="location"
                            className="block text-xs font-normal text-text-muted mb-1"
                        >
                            Location
                        </label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            placeholder="e.g. San Francisco, CA"
                            defaultValue={app?.location ?? ""}
                            className="w-full h-9 px-3 text-[13px] text-text bg-surface border border-border rounded-md placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="salary"
                            className="block text-xs font-normal text-text-muted mb-1"
                        >
                            Salary / Pay
                        </label>
                        <input
                            id="salary"
                            name="salary"
                            type="text"
                            placeholder="e.g. $45/hr or $120k"
                            defaultValue={app?.salary ?? ""}
                            className="w-full h-9 px-3 text-[13px] text-text bg-surface border border-border rounded-md placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                {/* Date Applied + Status */}
                <div className="grid grid-cols-2 gap-3.5 mt-3.5">
                    <div>
                        <label
                            htmlFor="dateApplied"
                            className="block text-xs font-normal text-text-muted mb-1"
                        >
                            Date Applied
                        </label>
                        <input
                            id="dateApplied"
                            name="dateApplied"
                            type="date"
                            defaultValue={app?.dateApplied ?? today}
                            className="w-full h-9 px-3 text-[13px] text-text bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="status"
                            className="block text-xs font-normal text-text-muted mb-1"
                        >
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            defaultValue={app?.status ?? "Saved"}
                            className="w-full h-9 px-3 text-[13px] text-text bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors cursor-pointer"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ======================================
            Internship Details Section
            ====================================== */}
                <div className="mt-5 p-4 rounded-lg bg-primary-light/40 border border-primary/10">
                    <h3 className="text-xs font-semibold text-primary mb-3">
                        Internship Details
                    </h3>

                    <div className="grid grid-cols-2 gap-3.5">
                        <div>
                            <label
                                htmlFor="type"
                                className="block text-xs font-normal text-text-muted mb-1"
                            >
                                Type
                            </label>
                            <select
                                id="type"
                                name="type"
                                defaultValue={app?.type ?? "Internship"}
                                className="w-full h-9 px-3 text-[13px] text-text bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors cursor-pointer"
                            >
                                {TYPE_OPTIONS.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="season"
                                className="block text-xs font-normal text-text-muted mb-1"
                            >
                                Season
                            </label>
                            <select
                                id="season"
                                name="season"
                                defaultValue={app?.season ?? ""}
                                className="w-full h-9 px-3 text-[13px] text-text bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors cursor-pointer"
                            >
                                <option value="">Select...</option>
                                {SEASON_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 mt-3.5 items-center">
                        <div>
                            <label
                                htmlFor="deadline"
                                className="block text-xs font-normal text-text-muted mb-1"
                            >
                                Application Deadline
                            </label>
                            <input
                                id="deadline"
                                name="deadline"
                                type="date"
                                defaultValue={app?.deadline ?? ""}
                                className="w-full h-9 px-3 text-[13px] text-text bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-4">
                            <input
                                id="isRolling"
                                name="isRolling"
                                type="checkbox"
                                defaultChecked={app?.isRolling ?? false}
                                className="h-4 w-4 rounded border-border accent-status-interview cursor-pointer"
                            />
                            <label
                                htmlFor="isRolling"
                                className="text-xs font-medium text-text cursor-pointer"
                            >
                                Rolling deadline — apply early
                            </label>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="mt-3.5">
                    <label
                        htmlFor="notes"
                        className="block text-xs font-normal text-text-muted mb-1"
                    >
                        Notes
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        placeholder="Any notes about this application..."
                        defaultValue={app?.notes ?? ""}
                        className="w-full px-3 py-2 text-[13px] text-text bg-surface border border-border rounded-md placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-y"
                        style={{ minHeight: "70px" }}
                    />
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="h-9 px-4 text-[13px] font-medium text-text bg-surface border border-border rounded-md hover:bg-background transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-9 px-5 text-[13px] font-semibold text-white bg-primary hover:bg-primary-hover rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : app ? "Save Changes" : "Add Application"}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
