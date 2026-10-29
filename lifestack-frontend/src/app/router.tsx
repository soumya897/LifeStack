import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { SchedulePage } from '@/features/schedule/SchedulePage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { AdminRoute } from '@/features/auth/AdminRoute';
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage';
import { RoadmapListPage } from '@/features/learning/RoadmapListPage';
import { RoadmapDetailPage } from '@/features/learning/RoadmapDetailPage';
import { CodingPracticePage } from '@/features/coding/CodingPracticePage';
import { ProblemDetailPage } from '@/features/coding/ProblemDetailPage';
import { NotesPage } from '@/features/notes/NotesPage';
import { JobTrackerPage } from '@/features/jobs/JobTrackerPage';
import { ApplicationDetailPage } from '@/features/jobs/ApplicationDetailPage';
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { TermsPage } from '@/features/legal/TermsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    element: <AdminRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminDashboardPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'schedule',
            element: <SchedulePage />,
          },
          {
            path: 'today',
            element: <Navigate to="/schedule" replace />,
          },
          {
            path: 'learning',
            element: <RoadmapListPage />,
          },
          {
            path: 'learning/:roadmapId',
            element: <RoadmapDetailPage />,
          },
          {
            path: 'coding',
            element: <CodingPracticePage />,
          },
          {
            path: 'coding/:problemId',
            element: <ProblemDetailPage />,
          },
          {
            path: 'notes',
            element: <NotesPage />,
          },
          {
            path: 'jobs',
            element: <JobTrackerPage />,
          },
          {
            path: 'jobs/:applicationId',
            element: <ApplicationDetailPage />,
          },
          {
            path: 'analytics',
            element: <AnalyticsPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
