# InternTrack Public API Documentation

This document describes the custom JSON API exposed by InternTrack's Next.js API routes.

Base path:

`/api/v1`

## Authentication

InternTrack uses Auth.js (NextAuth) session cookies for authenticated requests.

- Register through `POST /api/v1/auth/register`
- Sign in through Auth.js at `/api/auth/signin` or the `/login` page
- Protected routes return `401 Unauthorized` when no valid session exists
- Application routes are user-scoped, so authenticated users can only read or modify their own records

## Data Model

### Application status values

- `Saved`
- `Applied`
- `Interviewing`
- `Offer`
- `Rejected`

### Application type values

- `Internship`
- `FullTime`

### Common application fields

- `companyName` string, required on create
- `roleTitle` string, required on create
- `url` string, optional, must be a valid URL when present
- `salaryRange` string, optional
- `location` string, optional
- `status` enum, defaults to `Saved`
- `type` enum, defaults to `Internship`
- `season` string, optional
- `deadline` ISO datetime string, optional
- `deadlineType` string, optional on update
- `isRolling` boolean, defaults to `false`
- `dateApplied` ISO datetime string, optional
- `notes` string, optional
- `rejectionReason` string, optional
- `reflectionNote` string, optional
- `reminderDate` ISO datetime string, optional on update
- `reminderDone` boolean, optional on update

All datetime values are serialized as ISO 8601 strings in JSON responses.

## Error Format

### Validation error

```json
{
  "message": "Validation error",
  "errors": {
    "companyName": ["Company name is required"]
  }
}
```

### Common non-validation errors

```json
{ "message": "Unauthorized" }
```

```json
{ "message": "Forbidden" }
```

```json
{ "message": "Application not found" }
```

```json
{ "message": "Internal server error" }
```

## Endpoints

### `GET /api/v1/applications`

Returns every application owned by the authenticated user, ordered by `createdAt` descending.

- Auth required: Yes
- Request body: None

Example response:

```json
[
  {
    "id": "cm8example123",
    "userId": "cm8user123",
    "companyName": "Google",
    "roleTitle": "Software Engineer Intern",
    "status": "Applied",
    "type": "Internship",
    "season": "Fall 2026",
    "deadline": null,
    "isRolling": true,
    "createdAt": "2026-03-10T21:00:00.000Z",
    "updatedAt": "2026-03-10T21:00:00.000Z"
  }
]
```

Possible errors:

- `401 Unauthorized`
- `500 Internal server error`

### `POST /api/v1/applications`

Creates a new application for the authenticated user.

- Auth required: Yes
- Request body: JSON

Example request:

```json
{
  "companyName": "Meta",
  "roleTitle": "Frontend Engineer Intern",
  "status": "Saved",
  "type": "Internship",
  "season": "Fall 2026",
  "url": "https://www.example.com/jobs/frontend",
  "isRolling": true,
  "location": "Menlo Park, CA",
  "notes": "Apply after referral is submitted"
}
```

Example success response:

```json
{
  "id": "cm8example456",
  "userId": "cm8user123",
  "companyName": "Meta",
  "roleTitle": "Frontend Engineer Intern",
  "status": "Saved",
  "type": "Internship",
  "season": "Fall 2026",
  "url": "https://www.example.com/jobs/frontend",
  "isRolling": true,
  "location": "Menlo Park, CA",
  "notes": "Apply after referral is submitted",
  "createdAt": "2026-03-10T21:05:00.000Z",
  "updatedAt": "2026-03-10T21:05:00.000Z"
}
```

Possible errors:

- `400 Validation error`
- `401 Unauthorized`
- `500 Internal server error`

### `GET /api/v1/applications/:id`

Returns one application by ID when it belongs to the authenticated user.

- Auth required: Yes
- Path params:
  - `id` string, application identifier

Example success response:

```json
{
  "id": "cm8example456",
  "userId": "cm8user123",
  "companyName": "Meta",
  "roleTitle": "Frontend Engineer Intern",
  "status": "Saved",
  "type": "Internship",
  "createdAt": "2026-03-10T21:05:00.000Z",
  "updatedAt": "2026-03-10T21:05:00.000Z"
}
```

Possible errors:

- `401 Unauthorized`
- `403 Forbidden`
- `404 Application not found`
- `500 Internal server error`

### `PUT /api/v1/applications/:id`

Updates one application by ID when it belongs to the authenticated user.

- Auth required: Yes
- Path params:
  - `id` string, application identifier
- Request body: any subset of updateable application fields

Example request:

```json
{
  "status": "Interviewing",
  "dateApplied": "2026-03-10T18:00:00.000Z",
  "reminderDate": "2026-03-14T09:00:00.000Z",
  "reminderDone": false,
  "notes": "Follow up after recruiter call"
}
```

Possible errors:

- `400 Validation error`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Application not found`
- `500 Internal server error`

### `DELETE /api/v1/applications/:id`

Deletes one application by ID when it belongs to the authenticated user.

- Auth required: Yes
- Path params:
  - `id` string, application identifier

Example success response:

```json
{
  "message": "Application deleted successfully"
}
```

Possible errors:

- `401 Unauthorized`
- `403 Forbidden`
- `404 Application not found`
- `500 Internal server error`

### `POST /api/v1/applications/check-duplicate`

Checks whether the authenticated user already has an application with the same `companyName` and `roleTitle`.

- Auth required: Yes
- Request body: JSON

Example request:

```json
{
  "companyName": "Stripe",
  "roleTitle": "Software Engineer Intern"
}
```

Example non-duplicate response:

```json
{
  "isDuplicate": false
}
```

Example duplicate response:

```json
{
  "isDuplicate": true,
  "existingApplication": {
    "id": "cm8duplicate123",
    "userId": "cm8user123",
    "companyName": "Stripe",
    "roleTitle": "Software Engineer Intern",
    "status": "Saved",
    "type": "Internship",
    "createdAt": "2026-03-09T17:30:00.000Z",
    "updatedAt": "2026-03-09T17:30:00.000Z"
  }
}
```

Possible errors:

- `400 companyName and roleTitle are required`
- `401 Unauthorized`
- `500 Internal server error`

### `POST /api/v1/auth/register`

Creates a new user account.

- Auth required: No
- Request body: JSON

Example request:

```json
{
  "email": "student@northeastern.edu",
  "password": "strongPassword123!"
}
```

Example success response:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "cm8user123",
    "email": "student@northeastern.edu",
    "createdAt": "2026-03-10T19:00:00.000Z"
  }
}
```

Possible errors:

- `400 Validation error`
- `400 User with this email already exists`
- `500 Internal server error`

## Notes

- Auth.js framework-managed routes under `/api/auth/*` handle login, logout, and session management.
- The duplicate-check route compares `companyName` and `roleTitle` case-insensitively within the current user's own dataset.
- Route behavior is implemented in `src/app/api/v1/...` and validated with Zod in `src/lib/validations/application.ts`.
