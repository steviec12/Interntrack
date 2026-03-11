# Project 2: InternTrack Public API Documentation

Welcome to the API documentation for **InternTrack**. Our system utilizes Next.js API Routes to provide a secure and reliable RESTful JSON backend for managing job applications.

## Base URL
All API requests should be prefixed tightly with our version 1 routing scheme:
> `/api/v1`

## Authentication
This API is protected via **JWT Session Cookies** powered by [Auth.js (NextAuth)](https://next-auth.js.org/). 
1. Users must authenticate via `/api/auth/signin` or the `/login` frontend route.
2. Every request to restricted endpoints will verify the session context on the server using `getServerSession()`.
3. If no valid session exists, the API will uniformly return `401 Unauthorized`.
4. Users can only access and modify their *own* application records based on their authenticated `userId`.

---

## Endpoints

### 1. Applications (`/applications`)

#### `GET /api/v1/applications`
Retrieve a list of all custom job applications created by the authenticated user.
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**: None
- **Response Format**: Array of Application objects, sorted by creation date descending.
- **Success Response (200 OK)**:
```json
[
  {
    "id": "cm70g9h1m000...",
    "companyName": "Google",
    "roleTitle": "Software Engineering Intern",
    "status": "Applied",
    "type": "Internship",
    "createdAt": "2026-03-10T21:00:00.000Z",
    "updatedAt": "2026-03-10T21:00:00.000Z"
  }
]
```

#### `POST /api/v1/applications`
Create a new application entry for the authenticated user.
- **Method**: `POST`
- **Auth Required**: Yes
- **Body Context (JSON)**:
```json
{
  "companyName": "Meta",
  "roleTitle": "Frontend Engineer",
  "status": "Saved",
  "type": "Full-time",
  "season": "Fall 2026",
  "url": "https://meta.com/careers/frontend",
  "isRolling": true
}
```
- **Success Response (201 Created)**: Returns the newly created Application object including its generated database `id`.
- **Error Response (400 Bad Request)**: 
```json
{
  "message": "Validation error",
  "errors": {
    "companyName": ["Required"]
  }
}
```

---

### 2. Individual Application (`/applications/[id]`)

#### `GET /api/v1/applications/:id`
Fetch a specific application by its unique ID.
- **Method**: `GET`
- **Auth Required**: Yes
- **Params**:
  - `id` (string): The UUID/CUID of the application.
- **Success Response (200 OK)**: Returns the Application JSON payload.
- **Error Responses**:
  - `404 Not Found`: If the application does not exist.
  - `403 Forbidden`: If the application belongs to another user.

#### `PUT /api/v1/applications/:id`
Updates an existing application. Commonly used for advancing pipeline statuses (e.g. from `Applied` to `Interviewing`).
- **Method**: `PUT`
- **Auth Required**: Yes
- **Params**:
  - `id` (string): The UUID/CUID of the application.
- **Body Context (JSON)**: Any fields you wish to update.
```json
{
  "status": "Offer",
  "offerAmount": 120000,
  "offerCurrency": "USD"
}
```
- **Success Response (200 OK)**: Returns the updated Application JSON.

#### `DELETE /api/v1/applications/:id`
Permanently deletes an application.
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Params**:
  - `id` (string): The UUID/CUID of the application.
- **Success Response (200 OK)**:
```json
{
  "message": "Application deleted successfully"
}
```

---

### 3. User Authentication (`/auth/register`)

*(Note: Session management like login/logout is handled inherently by Auth.js at `/api/auth/*`)*

#### `POST /api/v1/auth/register`
Creates a brand new user account.
- **Method**: `POST`
- **Auth Required**: No
- **Body Context (JSON)**:
```json
{
  "email": "student@northeastern.edu",
  "password": "strongPassword123!"
}
```
- **Success Response (201 Created)**: Returns the minimal user object.
- **Error Response (400 Bad Request)**: 
```json
{
  "message": "User with this email already exists"
}
```
