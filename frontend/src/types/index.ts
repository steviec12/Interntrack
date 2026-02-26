export type ApplicationStatus = 'Saved' | 'Applied' | 'Phone Screen' | 'Interview' | 'Offer' | 'Rejected';
export type ApplicationType = 'Internship' | 'Full-time';

export interface Application {
    id?: number | string;
    company: string;
    role: string;
    url?: string;
    location?: string;
    salary?: string;
    dateApplied?: string;
    status: ApplicationStatus;
    type: ApplicationType;
    season?: string;
    deadline?: string;
    isRolling?: boolean;
    notes?: string;
}
