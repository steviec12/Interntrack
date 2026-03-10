export type ApplicationStatus = "Saved" | "Applied" | "Interviewing" | "Offer" | "Rejected";
export type ApplicationType = "Internship" | "FullTime";

// Base interface mirroring Prisma's Generated Application model
export interface Application {
    id: string;
    userId: string;
    companyName: string;
    roleTitle: string;
    url: string | null;
    salaryRange: string | null;
    location: string | null;
    status: ApplicationStatus;
    type: ApplicationType;
    season: string | null;
    deadline: string | null;
    isRolling: boolean;
    dateApplied: string | null;
    notes: string | null;
    rejectionReason: string | null;
    reflectionNote: string | null;
    createdAt: string;
    updatedAt: string;
}

export type CreateApplicationData = Omit<Application, "id" | "userId" | "createdAt" | "updatedAt">;
export type UpdateApplicationData = Partial<CreateApplicationData>;

const API_BASE_URL = "/api/v1/applications";

/**
 * Service to handle all client-side datastore operations for Applications using the Next.js API Routes.
 */
export const applicationService = {
    /**
     * Fetch all applications for the authenticated user.
     */
    async getApplications(): Promise<Application[]> {
        const response = await fetch(API_BASE_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch applications");
        }

        return response.json();
    },

    /**
     * Fetch a single application by its ID.
     */
    async getApplicationById(id: string): Promise<Application> {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to fetch application");
        }

        return response.json();
    },

    /**
     * Create a new application.
     */
    async createApplication(data: CreateApplicationData): Promise<Application> {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to create application");
        }

        return response.json();
    },

    /**
     * Partially update an existing application.
     */
    async updateApplication(id: string, data: UpdateApplicationData): Promise<Application> {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update application");
        }

        return response.json();
    },

    /**
     * Delete an application.
     */
    async deleteApplication(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to delete application");
        }
    },

    /**
     * Check if a duplicate application exists (same company + role, case-insensitive).
     */
    async checkDuplicate(companyName: string, roleTitle: string): Promise<{ isDuplicate: boolean; existingApplication?: Application }> {
        const response = await fetch(`${API_BASE_URL}/check-duplicate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ companyName, roleTitle }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to check for duplicates");
        }

        return response.json();
    },
};
