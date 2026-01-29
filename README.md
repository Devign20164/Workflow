# Workflow Automation System

Build an enterprise-grade Workflow Automation System for internal company operations.

**Live Demo**: [https://workflow-flame-six.vercel.app/auth](https://workflow-flame-six.vercel.app/auth)

## 🎯 Product Goal

Create a secure internal web application that digitizes and automates approval-based workflows (e.g., Purchase Requests, Leave Requests, IT Support Tickets) to reduce manual processes, improve accountability, and provide real-time visibility across departments.

## 👥 User Roles

- **Employee**: Submit requests (purchase, leave, IT support), view request status and history, add comments or attachments.
- **Manager**: Review and approve/reject employee requests, add approval notes, view team-level requests.
- **Finance / IT / HR**: Handle requests after manager approval, update fulfillment status, upload documents or resolution notes.
- **Admin**: Manage users and roles, configure workflow steps per request type, view system-wide analytics and audit logs.

## 🔄 Core Features

### Workflow Engine

- Status-based request flow (Submitted → Approved → In Progress → Completed / Rejected)
- Configurable steps depending on request type
- Role-Based Access Control (RBAC): Actions and visibility depend on user role
- Secure data isolation between departments

### Request Management

- Create, edit, and track requests
- Attach files and comments
- Automatic status transitions

### Timeline & Audit History

- Full activity log per request
- Shows who acted, what changed, and when

### Notifications

- In-app notifications on status changes
- Optional email notifications

## 📊 Dashboard & Analytics

- Role-specific dashboards
- Pending approvals count
- Requests by status and type
- Average approval time
- Filters by date, department, and requester

## 🎨 UI / UX

- **Clean, modern enterprise UI**
- Responsive layout (desktop-first)
- Table views with filters and bulk actions
- Timeline view for request history
- Clear visual status indicators

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS, shadcn-ui
- **State/Data**: React Query
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Routing**: React Router
- **Icons**: Lucide React

## 📦 Getting Started

### Prerequisites

- Node.js & npm installed

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd WorkFlow

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

This project uses Supabase for the backend. You need to set up the following environment variables in a `.env` file (copied from `.env.example` if available, or ask the team for keys):

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Deployment

Automated deployments are set up via Vercel.
