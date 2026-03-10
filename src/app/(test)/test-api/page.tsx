"use client";

import { useState } from "react";
import { applicationService, CreateApplicationData } from "../../../services/applicationService";

export default function TestFetcher() {
    const [status, setStatus] = useState<string>("Ready to test");
    const [result, setResult] = useState<any>(null);

    const handleCreate = async () => {
        setStatus("Creating...");
        try {
            const payload: CreateApplicationData = {
                companyName: "Test Company Inc.",
                roleTitle: "Frontend Developer",
                url: "https://example.com/careers",
                salaryRange: "$100k-$120k",
                location: "Remote",
                status: "Applied",
                type: "FullTime",
                season: "Summer 2026",
                deadline: null,
                isRolling: true,
                dateApplied: new Date().toISOString(),
                notes: "Just testing the API",
                rejectionReason: null,
                reflectionNote: null,
            };

            const response = await applicationService.createApplication(payload);
            setResult(response);
            setStatus("Success! ✅");
        } catch (error: any) {
            setResult(error.toString());
            setStatus("Error ❌");
        }
    };

    const handleFetchAll = async () => {
        setStatus("Fetching all...");
        try {
            const apps = await applicationService.getApplications();
            setResult(apps);
            setStatus(`Success! Found ${apps.length} applications ✅`);
        } catch (error: any) {
            setResult(error.toString());
            setStatus("Error ❌");
        }
    };

    return (
        <div className="p-8 space-y-4 bg-surface rounded-lg shadow-[var(--shadow-card)] max-w-2xl mx-auto my-12 border border-border">
            <h1 className="text-xl font-bold text-primary">API Service Test Interface</h1>

            <div className="flex gap-4">
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
                >
                    Create Test App
                </button>
                <button
                    onClick={handleFetchAll}
                    className="px-4 py-2 border border-primary text-primary rounded hover:bg-primary/10"
                >
                    Fetch All Apps
                </button>
            </div>

            <div className="mt-4 p-4 bg-background rounded border border-border">
                <p className="font-semibold text-text-muted mb-2">Status: {status}</p>
                <pre className="text-sm overflow-auto max-h-96 text-text">
                    {result ? JSON.stringify(result, null, 2) : "No result yet"}
                </pre>
            </div>
        </div>
    );
}
