# Session 5 - Complete Frontend Implementation

## Date: 2026-05-04

## Changes Made

### 1. Project Detail Page (`/projects/[id]/page.tsx`)
- ✅ Added **Edit Project** functionality (form with name, description, type)
- ✅ Added **Objectives CRUD** (Create, Read, Update, Delete)
- ✅ Added **Axes CRUD** (Create, Read, Update, Delete)
- ✅ Added tabs to switch between Objectives and Axes views
- ✅ Added "View Axes" button from objectives → filters axes by objective
- ✅ Added "View Hypotheses" button from axes → filters hypotheses by axe
- ✅ Display counts (axes count per objective, hypotheses count per axe)
- ✅ Confirmation dialogs for delete operations

### 2. Project Hypotheses Page (`/projects/[id]/hypotheses/page.tsx`)
- ✅ **Create Hypothesis** (linked to an axe)
- ✅ **Edit Hypothesis** (statement, priority, linked axe)
- ✅ **Delete Hypothesis** (with confirmation, deletes related plans)
- ✅ **Change Status** (OPEN, IN_PROGRESS, VALIDATED, INVALIDATED) via dropdown
- ✅ **Filter by Axe** (dropdown to show only hypotheses for selected axe)
- ✅ **Display Collection Plans** linked to each hypothesis
- ✅ **"Create Plan" button** → redirects to Plans page with hypothesis pre-selected

### 3. Project Collection Plans Page (`/projects/[id]/plans/page.tsx`)
- ✅ **Create Plan** (linked to a hypothesis)
- ✅ **Edit Plan** (name, frequency, dates)
- ✅ **Delete Plan** (with confirmation)
- ✅ **Add Sources** (RSS feeds, Websites, PDFs) with dynamic form
- ✅ **Add Keywords** (Include/Exclude) with dynamic form
- ✅ **Frequency Configuration** (On Demand, Daily, Weekly, Monthly)
- ✅ **Date Range** (start date, end date)
- ✅ **Filter by Hypothesis** (dropdown filter)
- ✅ **Display Sources** as badges with icons (RSS, Web, PDF)
- ✅ **Display Raw Data count** collected by each plan

### 4. Axes List Page (`/axes/page.tsx`)
- ✅ **List all Axes** across all projects
- ✅ **Create Axe** (linked to an objective)
- ✅ **Edit Axe** (name, description, linked objective)
- ✅ **Delete Axe** (with confirmation, deletes related hypotheses)
- ✅ **Display linked Objective** and Project
- ✅ **Display Hypotheses count** per axe

### 5. Navigation Flow
```
Project Detail (/projects/[id])
  ├─ Objectives Tab
  │   ├─ Create Objective
  │   ├─ Edit Objective
  │   ├─ Delete Objective
  │   └─ "View Axes" → Filters Axes by Objective
  │
  └─ Axes Tab
      ├─ Create Axe (select objective)
      ├─ Edit Axe
      ├─ Delete Axe
      └─ "View Hypotheses" → Filters Hypotheses by Axe

Project Hypotheses (/projects/[id]/hypotheses)
  ├─ Create Hypothesis (select axe)
  ├─ Edit Hypothesis
  ├─ Delete Hypothesis
  ├─ Change Status (OPEN → IN_PROGRESS → VALIDATED/INVALIDATED)
  ├─ Filter by Axe
  └─ "Create Plan" → Go to Plans page

Project Collection Plans (/projects/[id]/plans)
  ├─ Create Plan (select hypothesis)
  │   ├─ Add Sources (RSS/Web/PDF)
  │   ├─ Add Keywords (Include/Exclude)
  │   └─ Set Frequency + Dates
  ├─ Edit Plan
  ├─ Delete Plan
  └─ Filter by Hypothesis
```

## Database Relations
- **Project** has many **Objectives**
- **Objective** has many **Axes** (with `_count` for display)
- **Axe** has many **Hypotheses** (with `_count` for display)
- **Hypothesis** has many **CollectionPlans**
- **CollectionPlan** has many **Sources** and **Keywords**

## Files Modified/Created
1. `/client/src/app/projects/[id]/page.tsx` - Complete rewrite with tabs, CRUD for objectives & axes
2. `/client/src/app/projects/[id]/hypotheses/page.tsx` - New file with full CRUD + status
3. `/client/src/app/projects/[id]/plans/page.tsx` - New file with sources/keywords
4. `/client/src/app/axes/page.tsx` - New file with list + CRUD

## Backend Requirements (Already Implemented ✅)
- `POST /objectives` - Create objective
- `PATCH /objectives/:id` - Update objective
- `DELETE /objectives/:id` - Delete objective
- `POST /axes` - Create axe
- `PATCH /axes/:id` - Update axe
- `DELETE /axes/:id` - Delete axe
- `POST /hypotheses` - Create hypothesis
- `PATCH /hypotheses/:id` - Update hypothesis (including status)
- `DELETE /hypotheses/:id` - Delete hypothesis
- `POST /collection-plans` - Create plan
- `PATCH /collection-plans/:id` - Update plan
- `DELETE /collection-plans/:id` - Delete plan
- `POST /collection-plans/:id/sources` - Add source
- `POST /collection-plans/:id/keywords` - Add keyword

## Next Steps
1. **Test the full flow**:
   - Register/Login
   - Create Project
   - Add Objective
   - Add Axe (linked to objective)
   - Add Hypothesis (linked to axe)
   - Add Collection Plan (linked to hypothesis) with sources & keywords
2. **Polish UI** (optional):
   - Add loading states
   - Add error handling with toasts
   - Add empty states illustrations
3. **Integration** (future):
   - Connect to Collector Engine
   - Implement data collection
   - Display collected data in RawData page

## Notes
- All pages use **shadcn/ui** components (Button, Card, Input, Textarea, Label, Badge, Select)
- All forms use **React useState** for local state management
- API calls use **Axios** with JWT interceptors
- Styling uses **TailwindCSS** with dark mode support
- Animations use **Framer Motion** for smooth transitions
- All entities show **counts** (_count from Prisma) for better UX

## Fix: Project API not returning axes

### Problem
- Created axes were not showing in project detail page
- API response did not include `axes` field
- `include: { axes: true }` failed because Project has no direct relation to Axe

### Root Cause
- Axe is related to Project **indirectly** via Objective:
  ```
  Project → Objective → Axe
  ```
- Prisma `include: { axes: true }` only works for **direct relations**

### Solution
Modified `ProjectsService.findOne()` to:
1. Fetch project with objectives (direct relation)
2. **Separately query** axes via:
   ```typescript
   const axes = await this.prisma.axis.findMany({
     where: {
       objective: {
         projectId: id
       }
     }
   });
   ```
3. Manually add `axes` to returned object

### Files Modified
- `server/backend/src/modules/projects/projects.service.ts`

### Status
✅ Fixed - **Requires backend restart**
