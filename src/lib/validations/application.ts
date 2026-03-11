import { z } from "zod";

export const ApplicationStatusEnum = z.enum(["Saved", "Applied", "Interviewing", "Offer", "Rejected"]);
export const ApplicationTypeEnum = z.enum(["Internship", "FullTime"]);

export const applicationCreateSchema = z.object({
    companyName: z.string().min(1, "Company name is required"),
    roleTitle: z.string().min(1, "Role title is required"),
    url: z.string().url("Invalid URL format").optional().nullable().or(z.literal("").nullable()),
    salaryRange: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    status: ApplicationStatusEnum.default("Saved"),
    type: ApplicationTypeEnum.default("Internship"),
    season: z.string().optional().nullable(),
    deadline: z.string().datetime().optional().nullable(),
    isRolling: z.boolean().default(false),
    dateApplied: z.string().datetime().optional().nullable(),
    notes: z.string().optional().nullable(),
    rejectionReason: z.string().optional().nullable(),
    reflectionNote: z.string().optional().nullable(),
});

export const applicationUpdateSchema = z.object({
    companyName: z.string().min(1, "Company name cannot be empty").optional(),
    roleTitle: z.string().min(1, "Role title cannot be empty").optional(),
    url: z.string().url("Invalid URL format").optional().nullable().or(z.literal("").nullable()),
    salaryRange: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    status: ApplicationStatusEnum.optional(),
    type: ApplicationTypeEnum.optional(),
    season: z.string().optional().nullable(),
    deadline: z.string().datetime().optional().nullable(),
    deadlineType: z.string().optional().nullable(),
    isRolling: z.boolean().optional(),
    dateApplied: z.string().datetime().optional().nullable(),
    notes: z.string().optional().nullable(),
    rejectionReason: z.string().optional().nullable(),
    reflectionNote: z.string().optional().nullable(),
    reminderDate: z.string().datetime().optional().nullable(),
    reminderDone: z.boolean().optional(),
});
