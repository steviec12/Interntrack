import React, { useState } from "react";
import type { Application } from "../../types";

interface RejectionModalProps {
    app: Application;
    isOpen: boolean;
    onSave: (appId: string, reason: string, reflection: string) => Promise<void>;
    onSkip: () => void;
}

const REASON_CATEGORIES = [
    "No Response",
    "Rejected After Application",
    "Failed Phone Screen",
    "Failed Technical Interview",
    "Failed Final Round",
    "Ghosted After Interview",
    "Other",
];

export default function RejectionModal({
    app,
    isOpen,
    onSave,
    onSkip,
}: RejectionModalProps) {
    const [reason, setReason] = useState(REASON_CATEGORIES[0]);
    const [reflection, setReflection] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await onSave(String(app.id!), reason, reflection);
        } finally {
            setIsSubmitting(false);
            // Reset state for next time
            setReason(REASON_CATEGORIES[0]);
            setReflection("");
        }
    };

    const handleSkip = () => {
        onSkip();
        setReason(REASON_CATEGORIES[0]);
        setReflection("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-background rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-semibold text-text">Record Rejection</h2>
                        <p className="text-[13px] text-text-muted mt-0.5">
                            {app.role} at {app.company}
                        </p>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="p-2 text-text-muted hover:text-text hover:bg-gray-100 rounded-full transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Reason Category */}
                    <div className="space-y-2">
                        <label className="block text-[13px] font-semibold text-text">
                            Rejection Reason
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full h-9 px-3 text-[13px] bg-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-text"
                        >
                            {REASON_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Reflection */}
                    <div className="space-y-2">
                        <label className="block text-[13px] font-semibold text-text">
                            What did you learn?
                        </label>
                        <textarea
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            placeholder="Any takeaways or areas for improvement? (Optional)"
                            className="w-full min-h-[120px] p-3 text-[13px] bg-white border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none text-text"
                            maxLength={1000}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-border">
                    <button
                        onClick={handleSkip}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-[13px] font-medium text-text-muted hover:text-text transition-colors"
                    >
                        Skip
                    </button>
                    <button
                        title={!reason && !reflection ? "Click skip if you don't want to save notes" : undefined}
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold rounded-md transition-colors shadow-sm"
                    >
                        {isSubmitting ? "Saving..." : "Save Note"}
                    </button>
                </div>
            </div>
        </div>
    );
}
