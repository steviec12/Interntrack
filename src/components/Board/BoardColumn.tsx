import type { Application } from "../../types";
import ApplicationCard from "./ApplicationCard";
import { useDroppable } from "@dnd-kit/core";

interface BoardColumnProps {
    title: string;
    applications: Application[];
    onCardClick: (app: Application) => void;
}

export default function BoardColumn({ title, applications, onCardClick }: BoardColumnProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: title, // We use the exact status name as the generic ID (e.g. 'Saved')
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col min-w-[320px] max-w-[320px] border rounded-xl p-3 h-full transition-colors ${isOver ? "bg-surface-hover border-primary border-dashed" : "bg-background border-border"
                }`}
        >
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[14px] font-semibold text-text">{title}</h3>
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-surface border border-border text-[10px] font-medium text-text-muted">
                    {applications.length}
                </span>
            </div>

            <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-[100px]">
                {applications.map((app) => (
                    <ApplicationCard
                        key={app.id}
                        app={app}
                        onClick={() => onCardClick(app)}
                    />
                ))}
            </div>
        </div>
    );
}
