import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

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
        element: (
          <FeaturePlaceholder
            title="Learning & Roadmaps"
            description="Manage learning roadmaps such as DSA and Core Java, ordered topics, and progress calculations."
          />
        ),
      },
      {
        path: 'coding',
        element: (
          <FeaturePlaceholder
            title="Coding Practice"
            description="Record problems, code solutions, difficulty ratings, time/space complexity, and attempt histories."
          />
        ),
      },
      {
        path: 'notes',
        element: (
          <FeaturePlaceholder
            title="Notes & Resources"
            description="Maintain standalone and attached knowledge notes with tags and markdown support."
          />
        ),
      },
      {
        path: 'jobs',
        element: (
          <FeaturePlaceholder
            title="Job Tracker"
            description="Track applications, interview rounds, outcomes, and customizable career fields."
          />
        ),
      },
      {
        path: 'analytics',
        element: (
          <FeaturePlaceholder
            title="Analytics"
            description="Review monthly submission trends, interview funnel statistics, and learning velocity."
          />
        ),
      },
      {
        path: 'settings',
        element: (
          <FeaturePlaceholder
            title="Settings & Customization"
            description="Configure timezone, custom template versions, appearance, and workspace options."
          />
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
