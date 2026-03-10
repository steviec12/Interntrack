"use client";
import React, { useState, useEffect } from "react";
import NavBar from "../components/Layout/NavBar";
import ApplicationForm from "../components/Forms/ApplicationForm";
import type { Application, ApplicationStatus } from "../types";
import { applicationService } from "../services/applicationService";
import { toast } from "sonner";
import BoardColumn from "../components/Board/BoardColumn";
import ApplicationCard from "../components/Board/ApplicationCard";
import ApplicationTable from "../components/Board/ApplicationTable";

import {
  DndContext,
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

const COLUMNS = [
  "Saved",
  "Applied",
  "Phone Screen",
  "Interview",
  "Offer",
  "Rejected",
];

// Reverse map: convert Prisma/backend enum values back to frontend display labels
const BACKEND_STATUS_TO_FRONTEND: Record<string, string> = {
  Saved: "Saved",
  Applied: "Applied",
  Interviewing: "Interview",
  Offer: "Offer",
  Rejected: "Rejected",
};

const BACKEND_TYPE_TO_FRONTEND: Record<string, string> = {
  Internship: "Internship",
  FullTime: "Full-time",
};

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState("Board");
  const [typeFilter, setTypeFilter] = useState("All");
  const [seasonFilter, setSeasonFilter] = useState("All");
  const [activeDragId, setActiveDragId] = useState<string | number | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Configure drag sensors. 
  // Required so a quick "click" triggers the edit modal, but a long "hold" triggers a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;

    // If dropped outside a valid column, do nothing
    if (!over) return;

    const applicationId = active.id;
    const newStatus = over.id as any;

    // Parse the app payload from the draggable node
    const activeApp = active.data.current?.app as Application;
    if (!activeApp || activeApp.status === newStatus) return; // Ignore if dropped in same col

    // 1. Optimistic UI Update (Instant swap)
    setApplications(prev => prev.map(app =>
      app.id === applicationId
        ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
        : app
    ));

    // 2. Background Persistence (PostgreSQL / Prisma)
    try {
      let mappedStatus = newStatus;
      if (newStatus === "Interview" || newStatus === "Phone Screen") {
        mappedStatus = "Interviewing" as any;
      }

      await applicationService.updateApplication(applicationId as string, { status: mappedStatus });
    } catch (error) {
      // 3. Rollback if API fails
      toast.error("Failed to update status. Reverting...");
      setApplications(prev => prev.map(app =>
        app.id === applicationId
          ? { ...app, status: activeApp.status, updatedAt: activeApp.updatedAt }
          : app
      ));
    }
  };

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
          status: BACKEND_STATUS_TO_FRONTEND[app.status] || app.status,
          type: BACKEND_TYPE_TO_FRONTEND[app.type] || app.type,
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
    // Reverse-map backend enum values to frontend display labels
    const mappedApp = {
      ...app,
      status: BACKEND_STATUS_TO_FRONTEND[app.status] || app.status,
      type: BACKEND_TYPE_TO_FRONTEND[app.type] || app.type,
    } as Application;

    setApplications((prev) => {
      // If the app already exists in state via its ID, swap it cleanly 
      const existingIdx = prev.findIndex((p) => p.id === mappedApp.id);
      if (existingIdx !== -1) {
        const newArray = [...prev];
        newArray[existingIdx] = mappedApp;
        return newArray;
      }
      // If it doesn't exist, it's a new Create action, append it!
      return [mappedApp, ...prev]; // Prepend for fresh creations at top
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
            <>
              {/* Board View — always mounted, hidden via CSS when inactive */}
              <div style={{ display: activeTab === "Board" ? "block" : "none" }}>
                <DndContext
                  sensors={sensors}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-140px)]">
                    {COLUMNS.map((column) => {
                      const columnApps = filteredApps.filter((app) => app.status === column);
                      const sortedApps = [...columnApps].sort((a, b) => {
                        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
                        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
                        return dateB - dateA;
                      });

                      return (
                        <BoardColumn
                          key={column}
                          title={column}
                          applications={sortedApps}
                          onCardClick={(app) => {
                            setSelectedApp(app);
                            setShowForm(true);
                          }}
                        />
                      );
                    })}
                  </div>
                  <DragOverlay dropAnimation={null}>
                    {activeDragId ? (
                      (() => {
                        const activeApp = applications.find((app) => app.id === activeDragId);
                        return activeApp ? <ApplicationCard app={activeApp} onClick={() => { }} /> : null;
                      })()
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>

              {/* Table View — always mounted, hidden via CSS when inactive */}
              <div style={{ display: activeTab === "Table" ? "block" : "none" }}>
                <ApplicationTable
                  applications={filteredApps}
                  onRowClick={(app) => {
                    setSelectedApp(app);
                    setShowForm(true);
                  }}
                />
              </div>

              {/* Dashboard View — always mounted, hidden via CSS when inactive */}
              <div style={{ display: activeTab === "Dashboard" ? "flex" : "none" }} className="flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary-light flex items-center justify-center text-3xl mb-4 text-primary">
                  📊
                </div>
                <h2 className="text-lg font-semibold text-text mb-1">
                  Analytics Dashboard
                </h2>
                <p className="text-[13px] text-text-muted max-w-[340px]">
                  This section will contain charts and metrics for your application pipeline. Coming soon!
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
