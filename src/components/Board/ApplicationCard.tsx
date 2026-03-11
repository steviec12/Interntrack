import type { Application } from "../../types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

/** Status → TailwindCSS color class mapping */
export const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    Saved: { bg: "bg-status-saved/[0.13]", text: "text-status-saved" },
    Applied: { bg: "bg-status-applied/[0.13]", text: "text-status-applied" },
    "Phone Screen": { bg: "bg-status-phone/[0.13]", text: "text-status-phone" },
    Interview: { bg: "bg-status-interview/[0.13]", text: "text-status-interview" },
    Offer: { bg: "bg-status-offer/[0.13]", text: "text-status-offer" },
    Rejected: { bg: "bg-status-rejected/[0.13]", text: "text-status-rejected" },
};

interface ApplicationCardProps {
    app: Application;
    onClick: () => void;
    onSetReminder?: (appId: string, date: string | null) => void;
    onSetDeadline?: (appId: string, date: string, type: string) => void;
}

const DEADLINE_TYPES = [
    "Application Submission",
    "Interview",
    "Assessment / OA",
    "Offer Decision",
    "Other",
];

export default function ApplicationCard({ app, onClick, onSetReminder, onSetDeadline }: ApplicationCardProps) {
    const style = STATUS_STYLES[app.status] ?? STATUS_STYLES.Saved;
    const [showDateInput, setShowDateInput] = useState(false);
    const [showDeadlineInput, setShowDeadlineInput] = useState(false);
    const [pendingDeadlineDate, setPendingDeadlineDate] = useState("");
    const [pendingDeadlineType, setPendingDeadlineType] = useState("");

    // Compute deadline urgency
    const deadlineUrgency = (() => {
        if (!app.deadline) return "none";
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const dl = new Date(app.deadline);
        dl.setHours(0, 0, 0, 0);
        const days = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (days < 0) return "expired";
        if (days <= 3) return "critical";
        if (days <= 7) return "soon";
        return "ok";
    })();

    // Urgency indicator: rolling deadline apps still in Saved status
    const isUrgent = app.isRolling && app.status === "Saved";

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: app.id as number | string,
        data: {
            app, // Attach the full app object to the drag payload so we know what is dropped in page.tsx
        },
    });

    const dndStyle = {
        transform: CSS.Translate.toString(transform),
    };

    // Urgency border class based on deadline proximity
    const urgencyBorderClass =
        deadlineUrgency === "expired" || deadlineUrgency === "critical"
            ? "border-status-rejected border-[1.5px]"
            : deadlineUrgency === "soon"
            ? "border-warning border-[1.5px]"
            : isUrgent
            ? "border-l-[3px] border-l-warning"
            : "border-border";

    return (
        <div
            ref={setNodeRef}
            style={dndStyle}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={`bg-surface rounded-lg p-3.5 shadow-[var(--shadow-card)] transition-all duration-150 cursor-grab active:cursor-grabbing ${urgencyBorderClass} ${isDragging ? "opacity-50 border-primary scale-[1.02] shadow-xl z-50" : "hover:shadow-[var(--shadow-card-hover)]"}`}
        >
            <p className="text-[14px] font-semibold text-text leading-snug">
                {app.company}
            </p>

            <p className="text-xs text-text-muted mt-1">
                {app.role}
            </p>

            <div className="flex flex-wrap gap-1 mt-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${style.bg} ${style.text}`}>
                    {app.status}
                </span>

                {app.season && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-status-applied/[0.13] text-status-applied">
                        {app.season}
                    </span>
                )}

                {app.isRolling && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-status-interview/[0.13] text-status-interview">
                        Rolling
                    </span>
                )}

                {/* Urgency micro-badge for rolling apps still in Saved */}
                {isUrgent && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-warning/[0.15] text-warning">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                        Apply soon
                    </span>
                )}

                {/* Deadline urgency badge (replaces plain "Due" badge) */}
                {app.deadline && deadlineUrgency !== "none" && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        deadlineUrgency === "expired"
                            ? "bg-status-rejected/[0.15] text-status-rejected"
                            : deadlineUrgency === "critical"
                            ? "bg-status-rejected/[0.15] text-status-rejected"
                            : deadlineUrgency === "soon"
                            ? "bg-warning/[0.15] text-warning"
                            : "bg-warning/[0.13] text-warning"
                    }`}>
                        {deadlineUrgency === "expired" ? "⚠️ Expired" : deadlineUrgency === "critical" ? "🔴" : "🟡"}
                        {" "}{app.deadlineType ?? "Deadline"}
                    </span>
                )}

                {app.type === "Full-time" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-status-phone/[0.13] text-status-phone">
                        Full-time
                    </span>
                )}
            </div>

            {app.dateApplied && (
                <p className="text-[10px] text-text-muted mt-2">
                    Applied {new Date(app.dateApplied).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                </p>
            )}

            {app.status === "Rejected" && app.rejectionReason && (
                <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-[10px] text-status-rejected font-medium truncate">
                        {app.rejectionReason}
                    </p>
                    {app.reflectionNote && (
                        <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                            <span>📝</span>
                            <span className="truncate">{app.reflectionNote}</span>
                        </p>
                    )}
                </div>
            )}

            {/* Deadline row — inline setter */}
            <div className="mt-2 pt-2 border-t border-border/50">
                {app.deadline && !showDeadlineInput ? (
                    <p 
                        onClick={(e) => {
                            e.stopPropagation();
                            setPendingDeadlineType(app.deadlineType || "");
                            if (app.deadline) {
                                // Extract just the YYYY-MM-DD local part to prefill the date input properly
                                const dateObj = new Date(app.deadline);
                                const yyyy = dateObj.getUTCFullYear();
                                const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
                                const dd = String(dateObj.getUTCDate()).padStart(2, '0');
                                setPendingDeadlineDate(`${yyyy}-${mm}-${dd}`);
                            }
                            setShowDeadlineInput(true);
                        }}
                        className={`text-[10px] font-medium flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${
                        deadlineUrgency === "expired" || deadlineUrgency === "critical"
                            ? "text-status-rejected"
                            : deadlineUrgency === "soon"
                            ? "text-warning"
                            : "text-text-muted"
                    }`}>
                        <span>📅</span>
                        <span>{app.deadlineType ?? "Deadline"} · {new Date(app.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</span>
                    </p>
                ) : showDeadlineInput ? (
                    <div onClick={(e) => e.stopPropagation()} className="space-y-1.5">
                        <select
                            autoFocus
                            value={pendingDeadlineType}
                            onChange={(e) => setPendingDeadlineType(e.target.value)}
                            className="w-full h-7 px-2 text-[11px] border border-primary rounded text-text bg-surface focus:outline-none"
                        >
                            <option value="">Select type...</option>
                            {DEADLINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input
                            type="date"
                            value={pendingDeadlineDate}
                            onChange={(e) => setPendingDeadlineDate(e.target.value)}
                            className="w-full h-7 px-2 text-[11px] border border-primary rounded text-text bg-surface focus:outline-none"
                        />
                        <div className="flex gap-1 justify-end">
                            <button
                                type="button"
                                onClick={() => { setShowDeadlineInput(false); setPendingDeadlineDate(""); setPendingDeadlineType(""); }}
                                className="text-[10px] text-text-muted hover:text-text px-2 py-0.5"
                            >Cancel</button>
                            <button
                                type="button"
                                disabled={!pendingDeadlineDate || !pendingDeadlineType}
                                onClick={() => {
                                    if (pendingDeadlineDate && pendingDeadlineType && onSetDeadline) {
                                        onSetDeadline(String(app.id), new Date(pendingDeadlineDate).toISOString(), pendingDeadlineType);
                                        setShowDeadlineInput(false);
                                        setPendingDeadlineDate("");
                                        setPendingDeadlineType("");
                                    }
                                }}
                                className="text-[10px] font-semibold text-white bg-primary px-2 py-0.5 rounded disabled:opacity-40"
                            >Save</button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowDeadlineInput(true); }}
                        className="text-[10px] text-text-muted hover:text-primary flex items-center gap-1 transition-colors"
                    >
                        <span>📅</span> Add Deadline
                    </button>
                )}
            </div>

            {/* Reminder row */}
            <div className="mt-2 pt-2 border-t border-border/50">
                {app.reminderDate && !app.reminderDone && !showDateInput ? (
                    <p 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (app.reminderDate) {
                                // Extract just the YYYY-MM-DD local part to prefill the date input properly
                                const dateObj = new Date(app.reminderDate);
                                const yyyy = dateObj.getUTCFullYear();
                                const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
                                const dd = String(dateObj.getUTCDate()).padStart(2, '0');
                                // Reuse the existing HTML input by temporarily setting its default value through state if we wanted, 
                                // but the input below uses `onChange` to immediately fire. 
                                // To make pre-fill work smoothly with the simple `onChange` firing exactly on selection:
                                // We'll just rely on the browser's native `<input type="date">` showing the current date if we give it a `defaultValue`,
                                // but since it immediately saves in this UI pattern, we just open it.
                            }
                            setShowDateInput(true);
                        }}
                        className={`text-[10px] font-medium flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${
                        new Date(app.reminderDate) < new Date() ? "text-status-rejected" : "text-status-interview"
                    }`}>
                        <span>🔔</span>
                        {new Date(app.reminderDate).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
                    </p>
                ) : !app.reminderDone && showDateInput ? (
                    <input
                        type="date"
                        autoFocus
                        className="w-full h-7 px-2 text-[11px] border border-primary rounded text-text bg-surface focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                            if (e.target.value && onSetReminder) {
                                onSetReminder(String(app.id), new Date(e.target.value).toISOString());
                                setShowDateInput(false);
                            }
                        }}
                        onBlur={() => setShowDateInput(false)}
                    />
                ) : !app.reminderDone ? (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowDateInput(true); }}
                        className="text-[10px] text-text-muted hover:text-primary flex items-center gap-1 transition-colors"
                    >
                        <span>🔔</span> Add Reminder
                    </button>
                ) : null}
            </div>
        </div>
    );
}
