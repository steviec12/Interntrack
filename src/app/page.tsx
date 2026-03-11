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
import RejectionModal from "../components/Forms/RejectionModal";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
  const [rejectionModalApp, setRejectionModalApp] = useState<Application | null>(null);

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

    // 2. If dragged to Rejected — show the reflection modal before persisting
    if (newStatus === "Rejected") {
      setRejectionModalApp({ ...activeApp, status: newStatus });
      return; // modal callbacks handle the API call
    }

    // 3. Background Persistence (PostgreSQL / Prisma)
    try {
      let mappedStatus = newStatus;
      if (newStatus === "Interview" || newStatus === "Phone Screen") {
        mappedStatus = "Interviewing" as any;
      }

      await applicationService.updateApplication(applicationId as string, { status: mappedStatus });
    } catch (error) {
      // 4. Rollback if API fails
      toast.error("Failed to update status. Reverting...");
      setApplications(prev => prev.map(app =>
        app.id === applicationId
          ? { ...app, status: activeApp.status, updatedAt: activeApp.updatedAt }
          : app
      ));
    }
  };

  const handleRejectionSave = async (appId: string, reason: string, reflection: string) => {
    try {
      await applicationService.updateApplication(appId, {
        status: "Rejected",
        rejectionReason: reason || null,
        reflectionNote: reflection || null,
      } as any);
      setApplications(prev => prev.map(app =>
        String(app.id) === appId
          ? { ...app, status: "Rejected", rejectionReason: reason, reflectionNote: reflection }
          : app
      ));
      toast.success("Rejection note saved.");
    } catch {
      toast.error("Failed to save rejection note.");
    } finally {
      setRejectionModalApp(null);
    }
  };

  const handleRejectionSkip = async () => {
    if (!rejectionModalApp?.id) { setRejectionModalApp(null); return; }
    try {
      await applicationService.updateApplication(String(rejectionModalApp.id), { status: "Rejected" } as any);
    } catch {
      // Rollback optimistic update
      setApplications(prev => prev.map(app =>
        app.id === rejectionModalApp.id
          ? { ...app, status: rejectionModalApp.status }
          : app
      ));
      toast.error("Failed to update status.");
    } finally {
      setRejectionModalApp(null);
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
          rejectionReason: app.rejectionReason ?? undefined,
          reflectionNote: app.reflectionNote ?? undefined,
          reminderDate: app.reminderDate ?? undefined,
          reminderDone: app.reminderDone ?? false,
          deadlineType: app.deadlineType ?? undefined,
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

  const handleSetReminder = async (appId: string, date: string | null) => {
    try {
      await applicationService.updateApplication(appId, { reminderDate: date, reminderDone: false } as any);
      setApplications(prev => prev.map(app =>
        String(app.id) === appId
          ? { ...app, reminderDate: date ?? undefined, reminderDone: false }
          : app
      ));
      toast.success("Reminder set!");
    } catch {
      toast.error("Failed to set reminder.");
    }
  };

  const handleMarkReminderDone = async (appId: string) => {
    try {
      await applicationService.updateApplication(appId, { reminderDone: true } as any);
      setApplications(prev => prev.map(app =>
        String(app.id) === appId ? { ...app, reminderDone: true } : app
      ));
      toast.success("Reminder marked as done!");
    } catch {
      toast.error("Failed to mark reminder as done.");
    }
  };

  const handleSetDeadline = async (appId: string, date: string, type: string) => {
    try {
      await applicationService.updateApplication(appId, { deadline: date, deadlineType: type } as any);
      setApplications(prev => prev.map(app =>
        String(app.id) === appId
          ? { ...app, deadline: date, deadlineType: type }
          : app
      ));
      toast.success("Deadline set!");
    } catch {
      toast.error("Failed to set deadline.");
    }
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
        onSave={(savedApp) => {
          handleSave(savedApp);
          // If the saved app is Rejected and has no rejection note yet, prompt the modal
          const frontendStatus = savedApp.status as string;
          if (frontendStatus === "Rejected" && !savedApp.rejectionReason) {
            setRejectionModalApp(savedApp);
          }
        }}
        onViewExistingApp={(existingApp) => {
          setSelectedApp(existingApp);
          setShowForm(true);
        }}
      />

      {/* Rejection Reflection Modal */}
      {rejectionModalApp && (
        <RejectionModal
          app={rejectionModalApp}
          isOpen={true}
          onSave={handleRejectionSave}
          onSkip={handleRejectionSkip}
        />
      )}

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
                          onSetReminder={handleSetReminder}
                          onSetDeadline={handleSetDeadline}
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

              {/* Dashboard View */}
              <div style={{ display: activeTab === "Dashboard" ? "block" : "none" }} className="py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: This Week */}
                  <div>
                    <h2 className="text-base font-semibold text-text mb-4">📅 This Week</h2>
                    {(() => {
                      const now = new Date();
                      now.setHours(0, 0, 0, 0);

                      const nextWeek = new Date(now);
                      nextWeek.setDate(nextWeek.getDate() + 7);

                      type DashboardItem = {
                        key: string;
                        app: Application;
                        date: Date;
                        type: "Deadline" | "Reminder";
                        label: string;
                      };

                      const thisWeekItems: DashboardItem[] = [];

                      applications.forEach(app => {
                        // Check deadlines
                        if (app.deadline) {
                          const dlDate = new Date(app.deadline);
                          dlDate.setHours(0, 0, 0, 0);
                          if (dlDate <= nextWeek) {
                            thisWeekItems.push({
                              key: `dl-${app.id}`,
                              app,
                              date: dlDate,
                              type: "Deadline",
                              label: app.deadlineType ? `Deadline: ${app.deadlineType}` : "Deadline"
                            });
                          }
                        }

                        // Check reminders
                        if (app.reminderDate && !app.reminderDone) {
                          const remDate = new Date(app.reminderDate);
                          remDate.setHours(0, 0, 0, 0);
                          if (remDate <= nextWeek) {
                            thisWeekItems.push({
                              key: `rm-${app.id}`,
                              app,
                              date: remDate,
                              type: "Reminder",
                              label: "Follow-up Reminder"
                            });
                          }
                        }
                      });

                      // Sort soonest first
                      thisWeekItems.sort((a, b) => a.date.getTime() - b.date.getTime());

                      if (thisWeekItems.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-surface">
                            <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-2xl mb-3">✨</div>
                            <p className="text-[13px] text-text-muted">You have a clear week ahead!</p>
                            <p className="text-[13px] text-text-muted">Take a deep breath or apply to a new role.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          {thisWeekItems.map(item => {
                            const isOverdue = item.date < now;
                            const isCritical = item.date.getTime() - now.getTime() <= 3 * 24 * 60 * 60 * 1000 && !isOverdue;
                            const isSoon = item.date.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000 && !isCritical && !isOverdue;

                            return (
                              <div
                                key={item.key}
                                onClick={() => {
                                  setSelectedApp(item.app);
                                  setShowForm(true);
                                }}
                                className={`flex items-center justify-between p-4 rounded-lg border group cursor-pointer transition-colors ${
                                  isOverdue
                                    ? "bg-status-rejected/5 border-status-rejected/30 hover:border-status-rejected/50"
                                    : isCritical
                                    ? "bg-surface border-status-rejected/30 hover:border-status-rejected/50"
                                    : isSoon
                                    ? "bg-surface border-warning/30 hover:border-warning/50"
                                    : "bg-surface border-border hover:border-text-muted/30"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-xl opacity-80">
                                    {item.type === "Deadline" ? "📅" : "🔔"}
                                  </div>
                                  <div>
                                    <p className="text-[13px] font-semibold text-text group-hover:text-primary transition-colors">
                                      {item.app.company} <span className="text-[11px] font-normal text-text-muted mx-1">•</span> <span className="text-[12px] font-normal text-text-muted">{item.app.role}</span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className={`text-[11px] font-medium ${
                                        isOverdue ? "text-status-rejected" : isCritical ? "text-status-rejected" : isSoon ? "text-warning" : "text-status-interview"
                                      }`}>
                                        {isOverdue ? "⚠️ Overdue · " : ""}
                                        {item.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                                      </p>
                                      <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded bg-background border border-border">
                                        {item.label}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {item.type === "Reminder" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // prevent opening form
                                      handleMarkReminderDone(String(item.app.id));
                                    }}
                                    className="ml-4 px-3 py-1.5 text-[12px] font-semibold bg-background hover:bg-primary hover:border-primary border border-border hover:text-white text-text-muted rounded-md transition-colors whitespace-nowrap"
                                  >
                                    Mark Done
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Right Column: Rejection Insights */}
                  <div>
                    <h2 className="text-base font-semibold text-text mb-4">📉 Rejection Insights</h2>
                    {(() => {
                      // Process only correctly filtered apps
                      const rejectedApps = filteredApps.filter(app => app.status === "Rejected" && app.rejectionReason);
                      
                      if (rejectedApps.length < 3) {
                        return (
                          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-surface h-full min-h-[300px]">
                            <div className="w-14 h-14 rounded-2xl bg-secondary-light flex items-center justify-center text-2xl mb-3 text-primary">✨</div>
                            <p className="text-[13px] font-medium text-text mb-1">Not enough data to analyze yet.</p>
                            <p className="text-[12px] text-text-muted">Keep applying! Insights appear after 3 rejections.</p>
                          </div>
                        );
                      }

                      // Aggregate reasons
                      const counts: Record<string, number> = {};
                      rejectedApps.forEach(app => {
                        const reason = app.rejectionReason as string;
                        counts[reason] = (counts[reason] || 0) + 1;
                      });

                      const chartData = Object.entries(counts)
                        .map(([reason, count]) => ({ reason, count }))
                        .sort((a, b) => b.count - a.count); // Highest count first

                      return (
                        <div className="border rounded-xl bg-surface p-6 h-full min-h-[300px] flex flex-col">
                          <p className="text-[12px] text-text-muted mb-6">
                            Based on {rejectedApps.length} rejected applications matching your current filters.
                          </p>
                          <div className="flex-1 w-full min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                <XAxis type="number" allowDecimals={false} hide />
                                <YAxis 
                                  dataKey="reason" 
                                  type="category" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} 
                                  width={120} 
                                />
                                <Tooltip 
                                  cursor={{ fill: 'var(--color-background)' }}
                                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '12px' }}
                                />
                                <Bar 
                                  dataKey="count" 
                                  fill="var(--color-primary)" 
                                  radius={[0, 4, 4, 0]} 
                                  barSize={24}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
