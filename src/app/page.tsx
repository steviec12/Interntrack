"use client";

import { useState, useEffect } from "react";
import NavBar from "../components/Layout/NavBar";
import ApplicationForm from "../components/Forms/ApplicationForm";
import type { Application } from "../types";
import { applicationService } from "../services/applicationService";
import { toast } from "sonner";

/** Status → TailwindCSS color class mapping */
const STATUS_STYLES: Record<
  string,
  { bg: string; text: string }
> = {
  Saved: { bg: "bg-status-saved/[0.13]", text: "text-status-saved" },
  Applied: { bg: "bg-status-applied/[0.13]", text: "text-status-applied" },
  "Phone Screen": { bg: "bg-status-phone/[0.13]", text: "text-status-phone" },
  Interview: {
    bg: "bg-status-interview/[0.13]",
    text: "text-status-interview",
  },
  Offer: { bg: "bg-status-offer/[0.13]", text: "text-status-offer" },
  Rejected: {
    bg: "bg-status-rejected/[0.13]",
    text: "text-status-rejected",
  },
};

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState("Board");
  const [typeFilter, setTypeFilter] = useState("All");
  const [seasonFilter, setSeasonFilter] = useState("All");

  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from the API securely on mount
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const fetched = await applicationService.getApplications();
        // Transform backend keys into the frontend components expected keys
        const formatted = fetched.map(app => ({
          ...app,
          company: app.companyName,
          role: app.roleTitle,
          salary: app.salaryRange ?? undefined,
        })) as unknown as Application[];

        setApplications(formatted);
      } catch (error) {
        toast.error("Failed to fetch applications from server.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchApps();
  }, []);

  const handleSave = (app: Application) => {
    setApplications((prev) => {
      // If the app already exists in state via its ID, swap it cleanly 
      const existingIdx = prev.findIndex((p) => p.id === app.id);
      if (existingIdx !== -1) {
        const newArray = [...prev];
        newArray[existingIdx] = app;
        return newArray;
      }
      // If it doesn't exist, it's a new Create action, append it!
      return [app, ...prev]; // Prepend for fresh creations at top
    });
    setShowForm(false);
  };

  /** Filter applications based on active filters */
  const filteredApps = applications.filter((app) => {
    if (typeFilter !== "All" && app.type !== typeFilter) return false;
    if (seasonFilter !== "All" && app.season !== seasonFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <NavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        seasonFilter={seasonFilter}
        onSeasonFilterChange={setSeasonFilter}
        onAddClick={() => {
          setSelectedApp(null);
          setShowForm(true);
        }}
      />

      {/* Application Form Modal */}
      <ApplicationForm
        key={selectedApp?.id || 'new'} // Force re-mount prefill when jumping across apps
        app={selectedApp}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
      />

      {/* Main Content — below fixed nav */}
      <main className="pt-14">
        <div className="px-6 py-6">
          {/* Empty State */}
          {filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center text-3xl mb-4">
                📋
              </div>
              <h2 className="text-lg font-semibold text-text mb-1">
                No applications yet
              </h2>
              <p className="text-[13px] text-text-muted mb-6 text-center max-w-[340px]">
                Click + Add Application to start tracking your search.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="h-9 px-5 text-[13px] font-semibold text-white bg-primary hover:bg-primary-hover rounded-md transition-colors cursor-pointer"
              >
                + Add Application
              </button>
            </div>
          ) : (
            /* ============================================
               Application Cards — Kanban-style preview
               ============================================ */
            <div className="space-y-3">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[18px] font-bold text-text">
                  Applications
                </h2>
                <span className="text-xs font-medium text-text-muted">
                  {filteredApps.length} total
                </span>
              </div>

              {/* Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredApps.map((app, i) => {
                  const style = STATUS_STYLES[app.status] ?? STATUS_STYLES.Saved;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedApp(app);
                        setShowForm(true);
                      }}
                      className="bg-surface border border-border rounded-lg p-3.5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-150 cursor-pointer"
                    >
                      {/* Company Name */}
                      <p className="text-[14px] font-semibold text-text leading-snug">
                        {app.company}
                      </p>

                      {/* Role */}
                      <p className="text-xs text-text-muted mt-1">
                        {app.role}
                      </p>

                      {/* Tags Row */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {/* Status Pill */}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${style.bg} ${style.text}`}
                        >
                          {app.status}
                        </span>

                        {/* Season Tag */}
                        {app.season && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-status-applied/[0.13] text-status-applied">
                            {app.season}
                          </span>
                        )}

                        {/* Rolling Tag */}
                        {app.isRolling && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-status-interview/[0.13] text-status-interview">
                            Rolling
                          </span>
                        )}

                        {/* Deadline Tag */}
                        {app.deadline && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-warning/[0.13] text-warning">
                            Due {new Date(app.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                          </span>
                        )}

                        {/* Full-time Tag */}
                        {app.type === "Full-time" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-status-phone/[0.13] text-status-phone">
                            Full-time
                          </span>
                        )}
                      </div>

                      {/* Date Applied */}
                      {app.dateApplied && (
                        <p className="text-[10px] text-text-muted mt-2">
                          Applied {new Date(app.dateApplied).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
