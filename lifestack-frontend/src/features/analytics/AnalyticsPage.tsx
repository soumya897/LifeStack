import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
  AlertCircle,
  Calendar,
  Layers,
  Target,
  Code2,
  FileSpreadsheet,
  Award,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useWorkspace } from '../workspace/WorkspaceContext';
import { LifeStackLoader } from '@/components/LifeStackLoader';

export const AnalyticsPage: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'learning'>('overview');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const workspaceId = currentWorkspace?.id;

  // 1. Job Summary Query
  const {
    data: jobSummaryData,
    isLoading: isLoadingJobSummary,
    refetch: refetchJobSummary,
    isFetching: isFetchingJobSummary,
  } = useQuery({
    queryKey: ['analytics-job-summary', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const res = await api.analytics.jobSummary(workspaceId);
      return res.data;
    },
    enabled: !!workspaceId,
  });

  // 2. Monthly Velocity Query
  const {
    data: monthlyVelocityData,
    refetch: refetchMonthly,
    isFetching: isFetchingMonthly,
  } = useQuery({
    queryKey: ['analytics-job-monthly', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const res = await api.analytics.jobMonthly(workspaceId);
      return res.data;
    },
    enabled: !!workspaceId,
  });

  // 3. Source Analytics Query
  const {
    data: sourceData,
    refetch: refetchSource,
    isFetching: isFetchingSource,
  } = useQuery({
    queryKey: ['analytics-job-source', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const res = await api.analytics.jobBySource(workspaceId);
      return res.data;
    },
    enabled: !!workspaceId,
  });

  // 4. Interview Analytics Query
  const {
    data: interviewData,
    refetch: refetchInterviews,
    isFetching: isFetchingInterviews,
  } = useQuery({
    queryKey: ['analytics-job-interviews', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const res = await api.analytics.jobInterviews(workspaceId);
      return res.data;
    },
    enabled: !!workspaceId,
  });

  // 5. Roadmap & Learning Analytics Query
  const {
    data: roadmapData,
    isLoading: isLoadingRoadmaps,
    refetch: refetchRoadmaps,
    isFetching: isFetchingRoadmaps,
  } = useQuery({
    queryKey: ['analytics-roadmaps', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const res = await api.analytics.roadmaps(workspaceId);
      return res.data;
    },
    enabled: !!workspaceId,
  });

  const isRefreshingAll =
    isFetchingJobSummary ||
    isFetchingMonthly ||
    isFetchingSource ||
    isFetchingInterviews ||
    isFetchingRoadmaps;

  const handleRefreshAll = () => {
    refetchJobSummary();
    refetchMonthly();
    refetchSource();
    refetchInterviews();
    refetchRoadmaps();
  };

  // CSV Export: Job Applications Funnel & Sources
  const handleExportJobsCSV = () => {
    if (!sourceData && !jobSummaryData) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const headers = ['Source', 'Total Applications', 'Interviews', 'Offers', 'Interview Rate (%)', 'Offer Rate (%)'];
    const rows =
      sourceData?.sources?.map((s) => [
        `"${s.source}"`,
        s.totalApplications,
        s.interviewCount,
        s.offerCount,
        (s.interviewRate ?? 0).toFixed(1),
        (s.offerRate ?? 0).toFixed(1),
      ]) || [];

    const summarySection = [
      ['\n--- SUMMARY METRICS ---'],
      ['Metric', 'Value'],
      ['Total Applications', jobSummaryData?.totalApplications ?? 0],
      ['Applied This Month', jobSummaryData?.appliedThisMonth ?? 0],
      ['Active Interviews', jobSummaryData?.activeInterviews ?? 0],
      ['Total Offers', jobSummaryData?.offersCount ?? 0],
      ['Total Rejections', jobSummaryData?.rejectionsCount ?? 0],
      ['Offer Rate Percentage', `${(jobSummaryData?.offerRatePercentage ?? 0).toFixed(1)}%`],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(',')), ...summarySection.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lifestack-jobs-analytics-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportMenuOpen(false);
  };

  // CSV Export: Learning & Curriculum Velocity
  const handleExportLearningCSV = () => {
    if (!roadmapData) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    const headers = ['Roadmap Name', 'Status', 'Progress (%)', 'Completed Topics', 'Total Topics', 'Target Date', 'Is Overdue'];
    const rows =
      roadmapData.roadmaps.map((r) => [
        `"${r.name}"`,
        r.status,
        ((r.progressPercentage ?? r.progress ?? 0)).toFixed(1),
        r.completedTopics,
        r.totalTopics,
        r.targetDate || 'None',
        r.overdue ? 'YES' : 'NO',
      ]) || [];

    const summarySection = [
      ['\n--- CURRICULUM METRICS ---'],
      ['Metric', 'Value'],
      ['Total Roadmaps', roadmapData.totalRoadmaps],
      ['Active Roadmaps', roadmapData.activeRoadmaps],
      ['Completed Roadmaps', roadmapData.completedRoadmaps],
      ['Total Topics', roadmapData.totalTopics],
      ['Completed Topics', roadmapData.completedTopics],
      ['Topic Completion Rate', `${(roadmapData.topicCompletionRate ?? roadmapData.overallTopicCompletionPercentage ?? 0).toFixed(1)}%`],
      ['Total Problems Solved', `${roadmapData.solvedProblems} / ${roadmapData.totalProblems}`],
      ['Problem Solve Rate', `${(roadmapData.problemSolveRate ?? (roadmapData.totalProblems ? Math.round(((roadmapData.solvedProblems || 0) * 100.0) / roadmapData.totalProblems * 10.0) / 10.0 : 0)).toFixed(1)}%`],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(',')), ...summarySection.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lifestack-learning-analytics-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportMenuOpen(false);
  };

  // Calculations for KPI Cards
  const totalApps = jobSummaryData?.totalApplications ?? 0;
  const totalOffers = jobSummaryData?.offersCount ?? 0;
  const offerRate = jobSummaryData?.offerRatePercentage ?? 0;
  const activeInterviews = jobSummaryData?.activeInterviews ?? 0;
  const followUpsDue = jobSummaryData?.followUpsDue ?? 0;

  const topicCompletionRate =
    roadmapData?.topicCompletionRate ?? roadmapData?.overallTopicCompletionPercentage ?? 0;
  const problemSolveRate =
    roadmapData?.problemSolveRate ??
    (roadmapData?.totalProblems && roadmapData.totalProblems > 0
      ? Math.round(((roadmapData.solvedProblems || 0) * 100.0) / roadmapData.totalProblems * 10.0) / 10.0
      : 0);
  const totalRoadmaps = roadmapData?.totalRoadmaps ?? 0;

  // Max value for monthly velocity bar chart scaling
  const maxMonthlyVal = Math.max(
    ...(monthlyVelocityData?.months?.map((m) => Math.max(m.applicationsCount, m.interviewsCount)) || [1]),
    4
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Analytics & Reporting
            </h1>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              Real-time
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Workspace: <span className="font-semibold text-slate-800">{currentWorkspace?.name || 'Personal Workspace'}</span> &bull; Career pipeline conversion rates & learning velocity
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshingAll}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            title="Refresh analytics data"
          >
            {isRefreshingAll ? <LifeStackLoader size="xs" /> : <RefreshCw className="h-3.5 w-3.5 text-slate-500" />}
            Refresh
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>

            {exportMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-20"
                onMouseLeave={() => setExportMenuOpen(false)}
              >
                <button
                  onClick={handleExportJobsCSV}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <FileSpreadsheet className="h-4 w-4 text-brand-600" />
                  <div>
                    <div className="font-semibold text-slate-900">Job Pipeline CSV</div>
                    <div className="text-[11px] text-slate-400">Sources, stages & metrics</div>
                  </div>
                </button>
                <button
                  onClick={handleExportLearningCSV}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <GraduationCap className="h-4 w-4 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-slate-900">Learning Velocity CSV</div>
                    <div className="text-[11px] text-slate-400">Curricula & problem metrics</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Offer Conversion Rate */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Offer Conversion Rate</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {isLoadingJobSummary ? '—' : `${offerRate.toFixed(1)}%`}
            </span>
            <span className="text-xs text-slate-500">
              ({totalOffers} of {totalApps} apps)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span>Applications yielding job offers</span>
          </div>
        </div>

        {/* KPI 2: Active Pipeline Load */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Active Pipeline Load</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {isLoadingJobSummary ? '—' : activeInterviews}
            </span>
            <span className="text-xs text-slate-500">rounds in-flight</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-blue-500" />
            <span>{jobSummaryData?.appliedThisMonth ?? 0} submitted this month</span>
          </div>
        </div>

        {/* KPI 3: Curriculum Mastery */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Curriculum Completion</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {isLoadingRoadmaps ? '—' : `${topicCompletionRate.toFixed(1)}%`}
            </span>
            <span className="text-xs text-slate-500">
              ({roadmapData?.completedTopics ?? 0}/{roadmapData?.totalTopics ?? 0} topics)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Target className="h-3.5 w-3.5 text-purple-500" />
            <span>{problemSolveRate.toFixed(1)}% problems solved &bull; {totalRoadmaps} roadmap{totalRoadmaps !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* KPI 4: Action Items & Follow-ups */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Action Items & Follow-ups</span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {isLoadingJobSummary ? '—' : followUpsDue}
            </span>
            <span className="text-xs text-slate-500">due or overdue</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-amber-500" />
            <span>Follow-up dates reached</span>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 whitespace-nowrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Overview & Funnel
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`inline-flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-semibold transition-colors ${
              activeTab === 'jobs'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Job Pipeline Insights
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`inline-flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-semibold transition-colors ${
              activeTab === 'learning'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Learning Velocity
          </button>
        </nav>
      </div>

      {/* TAB 1: OVERVIEW & FUNNEL */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Stage Funnel Progression */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Application Stage Funnel</h2>
                  <p className="text-xs text-slate-500">Pipeline progression & conversion per recruitment milestone</p>
                </div>
                <span className="text-xs font-semibold text-slate-400">Total: {totalApps}</span>
              </div>

              <div className="mt-6 space-y-4">
                {jobSummaryData?.stageFunnel && jobSummaryData.stageFunnel.length > 0 ? (
                  jobSummaryData.stageFunnel.map((item, idx) => {
                    const pct = totalApps > 0 ? Math.round((item.count / totalApps) * 100) : 0;
                    return (
                      <div key={item.stage} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                            <span className="inline-block w-4 text-center text-slate-400 font-mono text-[10px]">
                              {idx + 1}.
                            </span>
                            {item.stage}
                          </span>
                          <span className="text-slate-600">
                            <strong className="text-slate-900">{item.count}</strong> apps ({pct}%)
                          </span>
                        </div>
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.stage === 'OFFER' || item.stage === 'HIRED'
                                ? 'bg-emerald-500'
                                : item.stage === 'INTERVIEW'
                                ? 'bg-blue-500'
                                : 'bg-brand-500'
                            }`}
                            style={{ width: `${Math.max(pct, item.count > 0 ? 5 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No application stages recorded yet. Add job applications to see the pipeline funnel.
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Application & Interview Velocity */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Monthly Velocity (6 Months)</h2>
                  <p className="text-xs text-slate-500">Application volume vs interview rounds conducted</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs bg-brand-500" />
                    <span className="text-slate-600 font-medium">Applications</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />
                    <span className="text-slate-600 font-medium">Interviews</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex h-48 items-end gap-4 border-b border-slate-100 pb-2">
                {monthlyVelocityData?.months && monthlyVelocityData.months.length > 0 ? (
                  monthlyVelocityData.months.map((m) => {
                    const appHeight = Math.min(Math.round((m.applicationsCount / maxMonthlyVal) * 100), 100);
                    const intHeight = Math.min(Math.round((m.interviewsCount / maxMonthlyVal) * 100), 100);

                    return (
                      <div key={m.monthKey} className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
                        <div className="flex w-full items-end justify-center gap-1.5 h-36">
                          {/* Applications Bar */}
                          <div
                            className="w-1/2 max-w-[20px] rounded-t bg-brand-500 transition-all hover:bg-brand-600 relative group"
                            style={{ height: `${Math.max(appHeight, m.applicationsCount > 0 ? 8 : 0)}%` }}
                            title={`${m.applicationsCount} Applications`}
                          >
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white z-10 whitespace-nowrap">
                              {m.applicationsCount} apps
                            </span>
                          </div>
                          {/* Interviews Bar */}
                          <div
                            className="w-1/2 max-w-[20px] rounded-t bg-emerald-500 transition-all hover:bg-emerald-600 relative group"
                            style={{ height: `${Math.max(intHeight, m.interviewsCount > 0 ? 8 : 0)}%` }}
                            title={`${m.interviewsCount} Interviews`}
                          >
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white z-10 whitespace-nowrap">
                              {m.interviewsCount} ints
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500 truncate w-full text-center">
                          {m.label}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    No timeline activity recorded in the past 6 months.
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Hover over bars for exact volume numbers.</span>
                <span className="font-semibold text-slate-700">6-Month Window</span>
              </div>
            </div>
          </div>

          {/* Quick Source Effectiveness Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">Application Source Distribution</h2>
                <p className="text-xs text-slate-500">Where top recruitment results and offers originate</p>
              </div>
              <button
                onClick={() => setActiveTab('jobs')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View detailed breakdown <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {sourceData?.sources && sourceData.sources.length > 0 ? (
                sourceData.sources.map((s) => (
                  <div
                    key={s.source}
                    className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-slate-200 hover:bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-sm truncate">{s.source}</span>
                      <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700 border border-brand-100">
                        {s.totalApplications} apps
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>Interviews: <strong className="text-slate-800">{s.interviewCount}</strong></span>
                      <span>Offers: <strong className="text-emerald-700">{s.offerCount}</strong></span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Offer Rate</span>
                      <span className="font-bold text-slate-800">{(s.offerRate ?? 0).toFixed(1)}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-6 text-center text-xs text-slate-400">
                  No application sources recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JOB PIPELINE INSIGHTS */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Source Performance Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Source Conversion Matrix</h2>
              <p className="text-xs text-slate-500">
                Detailed conversion percentages by application channel (e.g. LinkedIn, Referrals, Inbound)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-5">Source / Platform</th>
                    <th className="py-3 px-5 text-right">Total Applied</th>
                    <th className="py-3 px-5 text-right">Interview Rounds</th>
                    <th className="py-3 px-5 text-right">Offers Received</th>
                    <th className="py-3 px-5 text-right">Interview Rate (%)</th>
                    <th className="py-3 px-5 text-right">Offer Rate (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sourceData?.sources && sourceData.sources.length > 0 ? (
                    sourceData.sources.map((s) => (
                      <tr key={s.source} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-5 font-semibold text-slate-900 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-brand-500" />
                          {s.source}
                        </td>
                        <td className="py-3 px-5 text-right text-slate-800 font-medium">
                          {s.totalApplications}
                        </td>
                        <td className="py-3 px-5 text-right text-slate-800 font-medium">
                          {s.interviewCount}
                        </td>
                        <td className="py-3 px-5 text-right text-emerald-700 font-bold">
                          {s.offerCount}
                        </td>
                        <td className="py-3 px-5 text-right text-slate-600">
                          {(s.interviewRate ?? 0).toFixed(1)}%
                        </td>
                        <td className="py-3 px-5 text-right font-bold text-emerald-600">
                          {(s.offerRate ?? 0).toFixed(1)}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No sources recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interview Rounds & Outcomes Breakdown */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* By Round Type */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900">Interviews by Round Type</h2>
              <p className="text-xs text-slate-500 mb-5">Technical, Behavioral, HR, System Design breakdown</p>

              <div className="space-y-3">
                {interviewData?.byRoundType && Object.keys(interviewData.byRoundType).length > 0 ? (
                  Object.entries(interviewData.byRoundType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{type}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-brand-500 h-full rounded-full"
                            style={{
                              width: `${Math.min(
                                (count / Math.max(interviewData.totalInterviews, 1)) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="w-8 text-right font-bold text-slate-900">{count}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No interview rounds recorded.
                  </div>
                )}
              </div>
            </div>

            {/* By Result & Status */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900">Interview Outcomes & Status</h2>
              <p className="text-xs text-slate-500 mb-5">Scheduled rounds, completed rounds, and results</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                  <div className="text-xs text-slate-500">Upcoming Rounds</div>
                  <div className="mt-1 text-2xl font-bold text-blue-600">
                    {interviewData?.upcomingInterviews ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Scheduled in future</div>
                </div>

                <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                  <div className="text-xs text-slate-500">Completed Rounds</div>
                  <div className="mt-1 text-2xl font-bold text-emerald-600">
                    {interviewData?.completedInterviews ?? 0}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Conducted to date</div>
                </div>
              </div>

              {/* Result Distribution */}
              <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                <div className="text-xs font-semibold text-slate-600 mb-2">Round Results:</div>
                {interviewData?.byResult && Object.keys(interviewData.byResult).length > 0 ? (
                  Object.entries(interviewData.byResult).map(([res, count]) => (
                    <div key={res} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{res}</span>
                      <span className="font-bold text-slate-800">{count}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400">No results recorded yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEARNING VELOCITY */}
      {activeTab === 'learning' && (
        <div className="space-y-6">
          {/* Learning Metrics Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Curricula Roadmaps</span>
                <Layers className="h-4 w-4 text-brand-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {roadmapData?.totalRoadmaps ?? 0}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {roadmapData?.activeRoadmaps ?? 0} active &bull; {roadmapData?.completedRoadmaps ?? 0} completed
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Topics Mastery</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {roadmapData?.completedTopics ?? 0} / {roadmapData?.totalTopics ?? 0}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {topicCompletionRate.toFixed(1)}% topic syllabus mastered
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Coding Problems Solved</span>
                <Code2 className="h-4 w-4 text-purple-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {roadmapData?.solvedProblems ?? 0} / {roadmapData?.totalProblems ?? 0}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {problemSolveRate.toFixed(1)}% problem solve rate
              </div>
            </div>
          </div>

          {/* Roadmaps Progress List */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Active & Completed Roadmaps</h2>
                <p className="text-xs text-slate-500">Progress completion, topic milestones, and timeline health</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {roadmapData?.roadmaps && roadmapData.roadmaps.length > 0 ? (
                roadmapData.roadmaps.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:border-slate-200 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">{r.name}</span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            r.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {r.status}
                        </span>
                        {r.overdue && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                            Overdue
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        <span>
                          Topics: <strong className="text-slate-700">{r.completedTopics}</strong> of {r.totalTopics}
                        </span>
                        {r.targetDate && (
                          <span>Target: <strong className="text-slate-700">{r.targetDate}</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:w-48">
                      <div className="w-full">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                          <span>{((r.progressPercentage ?? r.progress ?? 0)).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-brand-600 transition-all"
                            style={{ width: `${r.progressPercentage ?? r.progress ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No learning roadmaps found in this workspace. Create one from the Roadmaps page.
                </div>
              )}
            </div>
          </div>

          {/* Coding Problem Difficulty & Status Matrix */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* By Difficulty */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900">Problem Difficulty Distribution</h2>
              <p className="text-xs text-slate-500 mb-5">Algorithms and coding challenges logged</p>

              <div className="space-y-4">
                {roadmapData?.problemsByDifficulty &&
                Object.keys(roadmapData.problemsByDifficulty).length > 0 ? (
                  Object.entries(roadmapData.problemsByDifficulty).map(([diff, count]) => {
                    const totalP = Math.max(roadmapData.totalProblems, 1);
                    const pct = Math.round((count / totalP) * 100);
                    return (
                      <div key={diff} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span
                            className={`font-bold ${
                              diff === 'HARD'
                                ? 'text-red-600'
                                : diff === 'MEDIUM'
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {diff}
                          </span>
                          <span className="text-slate-600">
                            {count} problems ({pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              diff === 'HARD'
                                ? 'bg-red-500'
                                : diff === 'MEDIUM'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No coding problems added yet.
                  </div>
                )}
              </div>
            </div>

            {/* By Problem Status */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900">Problem Practice Status</h2>
              <p className="text-xs text-slate-500 mb-5">Unsolved, Attempted, Solved & Mastered challenges</p>

              <div className="space-y-3">
                {roadmapData?.problemsByStatus && Object.keys(roadmapData.problemsByStatus).length > 0 ? (
                  Object.entries(roadmapData.problemsByStatus).map(([st, count]) => (
                    <div key={st} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{st}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-800">
                        {count}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No coding problem status details.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
