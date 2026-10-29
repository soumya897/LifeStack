import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { RoadmapListPage } from '@/features/learning/RoadmapListPage';
import { RoadmapDetailPage } from '@/features/learning/RoadmapDetailPage';
import { CodingPracticePage } from '@/features/coding/CodingPracticePage';
import { ProblemDetailPage } from '@/features/coding/ProblemDetailPage';
import { NotesPage } from '@/features/notes/NotesPage';
import { JobTrackerPage } from '@/features/jobs/JobTrackerPage';
import { ApplicationDetailPage } from '@/features/jobs/ApplicationDetailPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { CustomizationStudioPage } from '@/features/templates/CustomizationStudioPage';

function FeaturePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="rounded-full bg-slate-100 p-3 text-slate-500">
        <span className="text-xl font-bold">#</span>
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-800">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      <span className="mt-4 inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
        Scheduled for upcoming milestone
      </span>
    </div>
  );
}

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
            path: 'today',
            element: (
              <FeaturePlaceholder
                title="Today Screen"
                description="View tasks due today, overdue items, and scheduled learning targets."
              />
            ),
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
            element: (
              <FeaturePlaceholder
                title="Analytics & Reports"
                description="Review monthly job application conversion rates and learning velocity."
              />
            ),
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: 'settings/templates',
            element: <CustomizationStudioPage />,
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
