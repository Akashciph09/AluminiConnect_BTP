# Freelance Experiences - Integration Guide

## Overview
The Freelance Experiences feature allows authenticated students to share their freelancing experiences, projects, and achievements with fellow students. This feature is **student-only** - mentors and alumni cannot access it.

## Backend Implementation

### 1. Database Model
**File:** `backend/models/FreelanceEntry.js`

The Mongoose schema includes:

- **Required fields:** title, shortSummary (max 200 chars), role, technologies, problemSolved, implementationDetails
- **Optional fields:** githubLink, demoLink, figmaLink, attachments, isAnonymous
- **Relationships:** References User model via studentId

### 2. API Routes
**File:** `backend/routes/freelanceEntriesRoutes.js`

**Endpoints:**
- `POST /api/student-entries` - Create a new entry (student-only)
- `GET /api/student-entries` - List all entries (student-only)
- `GET /api/student-entries/:id` - Get a single entry (student-only)
- `PUT /api/student-entries/:id` - Update an entry (owner only)
- `DELETE /api/student-entries/:id` - Delete an entry (owner only)

**Authentication:**
- All routes require authentication via `auth` middleware
- All routes require student role via `studentOnly` middleware
- Update/Delete operations require ownership verification

### 3. Server Configuration
**File:** `backend/server.js`

The route is registered as:
```javascript
app.use('/api/student-entries', freelanceEntriesRoutes);
```

## Frontend Implementation

### 1. Main Component
**File:** `frontend/src/components/student/sections/FreelanceShowTell.js`

This component includes:
- **Feed Tab:** Displays all entries in a card grid layout
- **Submit Tab:** Form for creating new entries
- **Entry Detail Dialog:** Modal showing full entry details

### 2. Features
- **Form Validation:**
  - Short summary max 200 characters
  - Required fields validation
  - Technology tags input (press Enter to add)
  
- **Display Features:**
  - Role-based icons (Developer, Designer, PM, Other)
  - Technology chips display
  - Anonymous posting option
  - Links to GitHub, Demo, Figma
  - Responsive grid layout

### 3. Navigation Integration
**Files Updated:**
- `frontend/src/components/student/StudentSidebar.js` - Added "Experiences" menu item
- `frontend/src/routes/StudentRoute.js` - Added route for `/student/show-tell`
- `frontend/src/components/student/StudentDashboard.js` - Added case for rendering component

## Access Control

### Backend
- Middleware `studentOnly` checks `req.user.role === 'student'`
- Returns 403 Forbidden if user is not a student
- Update/Delete operations verify entry ownership

### Frontend
- Route protection via `StudentRoute` component
- Checks user role before rendering
- Redirects to login if not authenticated

## Usage

### For Students:

1. **Access the Feature:**
   - Log in as a student
   - Navigate to "Experiences" in the sidebar
   - Or go to `/student/show-tell`

2. **Submit an Entry:**
   - Click on "Submit Entry" tab
   - Fill in required fields:
     - Title
     - Short Summary (max 200 chars)
     - Role (Developer/Designer/PM/Other)
     - Technologies (press Enter after each)
     - Problem Solved
     - Implementation Details
   - Optionally add:
     - GitHub link
     - Demo link
     - Figma link
     - Check "Post anonymously" if desired
   - Click "Submit Entry"

3. **View Entries:**
   - Click on "Feed" tab to see all entries
   - Click "Read More" on any card to see full details
   - Entries are sorted by creation date (newest first)

### For Developers:

**Testing the API:**
```bash
# Create an entry
curl -X POST http://localhost:3002/api/student-entries \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "E-commerce Platform",
    "shortSummary": "Built a full-stack e-commerce platform",
    "role": "Developer",
    "technologies": ["React", "Node.js", "MongoDB"],
    "problemSolved": "Client needed an online store",
    "implementationDetails": "Used React for frontend..."
  }'

# Get all entries
curl -X GET http://localhost:3002/api/student-entries \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get single entry
curl -X GET http://localhost:3002/api/student-entries/ENTRY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Data Structure

### Entry Object:
```javascript
{
  _id: "ObjectId",
  studentId: "ObjectId (ref: User)",
  title: "String",
  shortSummary: "String (max 200 chars)",
  role: "Developer | Designer | PM | Other",
  technologies: ["String"],
  problemSolved: "String",
  implementationDetails: "String",
  githubLink: "String (optional)",
  demoLink: "String (optional)",
  figmaLink: "String (optional)",
  attachments: ["String"] (optional),
  isAnonymous: Boolean,
  createdAt: Date,
  updatedAt: Date,
  student: {
    name: "String (or 'Anonymous')",
    email: "String"
  }
}
```

## Security Considerations

1. **Authentication:** All endpoints require valid JWT token
2. **Authorization:** Only students can access endpoints
3. **Ownership:** Users can only update/delete their own entries
4. **Input Validation:** 
   - Short summary length validation
   - Role enum validation
   - ObjectId validation for route parameters

## Future Enhancements

Potential improvements:
- File upload for attachments
- Rich text editor for implementation details
- Comments/feedback on entries
- Search and filter functionality
- Pagination for large entry lists
- Like/favorite entries
- Categories/tags for better organization

## Troubleshooting

**Issue:** "Access denied" error
- **Solution:** Ensure user is logged in as a student (role: "student")

**Issue:** Entries not showing
- **Solution:** Check browser console for API errors, verify token is valid

**Issue:** Form submission fails
- **Solution:** Check all required fields are filled, short summary is ≤ 200 chars

**Issue:** Technologies not adding
- **Solution:** Press Enter after typing each technology, ensure no duplicates

## Files Created/Modified

### Created:
- `backend/models/FreelanceEntry.js`
- `backend/routes/freelanceEntriesRoutes.js`
- `frontend/src/components/student/sections/FreelanceShowTell.js`
- `FREELANCE_SHOW_TELL_INTEGRATION.md`

### Modified:
- `backend/server.js` - Added route registration
- `frontend/src/components/student/StudentSidebar.js` - Added menu item
- `frontend/src/routes/StudentRoute.js` - Added route
- `frontend/src/components/student/StudentDashboard.js` - Added render case

