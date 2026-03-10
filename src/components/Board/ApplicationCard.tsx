import type { Application } from "../../types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

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
}

export default function ApplicationCard({ app, onClick }: ApplicationCardProps) {
    const style = STATUS_STYLES[app.status] ?? STATUS_STYLES.Saved;

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

    return (
        <div
            ref={setNodeRef}
            style={dndStyle}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={`bg-surface border rounded-lg p-3.5 shadow-[var(--shadow-card)] transition-all duration-150 cursor-grab active:cursor-grabbing ${isUrgent ? "border-l-[3px] border-l-warning" : ""} ${isDragging ? "opacity-50 border-primary scale-[1.02] shadow-xl z-50" : "border-border hover:shadow-[var(--shadow-card-hover)]"
                }`}
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

                {app.deadline && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-warning/[0.13] text-warning">
                        Due {new Date(app.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
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
        </div>
    );
}
