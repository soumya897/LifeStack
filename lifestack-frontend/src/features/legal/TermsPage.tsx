import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  Database,
  Trash2,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { LifeStackLogo } from '@/components/LifeStackLogo';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <LifeStackLogo className="h-8 w-8 drop-shadow-xs" withBackground={false} />
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 block group-hover:text-brand-600 transition-colors">
                LifeStack
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Terms of Service
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href="https://soumya-here.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
              title="Visit Developer Portfolio"
            >
              <Globe className="h-3.5 w-3.5 text-brand-600" />
              <span className="hidden sm:inline">Developer Portfolio</span>
              <span className="sm:hidden">Creator</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to App</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10 flex-1">
        {/* Hero Title Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            Legal Agreement & Usage Terms
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to LifeStack. By accessing or using our personal productivity and career engineering operating system, you agree to be bound by the terms outlined below.
          </p>
          <div className="text-xs text-slate-400 font-medium">
            Effective Date: October 2026 &bull; Version 1.0 &bull; Cloud Production Standard
          </div>
        </div>

        {/* Developer Attribution Card */}
        <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50/80 via-white to-sky-50/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">
              Project Creator & Lead Architect
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Designed & Developed by Soumya
            </h3>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              LifeStack is engineered as a high-performance productivity platform featuring multi-tenant workspace isolation, algorithm tracking, and interview pipelines.
            </p>
          </div>
          <a
            href="https://soumya-here.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-xs hover:bg-brand-700 transition-all shrink-0"
          >
            <span>Explore Soumya&apos;s Portfolio</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8 text-slate-700 leading-relaxed text-sm">
          {/* Section 1 */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-brand-100 text-brand-700 font-black text-xs flex items-center justify-center">
                1
              </span>
              Acceptance & Scope of Platform
            </h2>
            <p>
              LifeStack is provided as a unified career OS designed for software engineers, students, and professionals to organize learning roadmaps, record algorithmic practice solutions, maintain interview application pipelines on Kanban, and manage study schedules with synchronized audio reminders.
            </p>
            <p className="text-xs text-slate-500">
              By creating an account or accessing LifeStack via Web or PWA, you agree to comply with all applicable local, national, and international laws and regulations.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-brand-100 text-brand-700 font-black text-xs flex items-center justify-center">
                2
              </span>
              User Accounts, Password Security & Authentication
            </h2>
            <p>
              To access private roadmaps and workspace features, users must register an account with a valid email and strong password (minimum 8 characters).
            </p>
            <ul className="space-y-2 pt-1 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Argon2 Cryptographic Hashing:</strong> Your password is never stored in plain text. It is securely salted and hashed using modern memory-hard Argon2id cryptography.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Stateless Token Validation:</strong> Authenticated sessions use cryptographically signed JWT credentials with strict role validation.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Account Role Enforcement:</strong> Public registration is strictly locked to standard USER roles. Administrative roles can only be granted by verified system administrators.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-brand-100 text-brand-700 font-black text-xs flex items-center justify-center">
                3
              </span>
              Data Ownership & Multi-Tenant Isolation
            </h2>
            <p>
              You maintain 100% ownership of all career data, notes, algorithm solutions, interview questions, and job opportunity entries submitted to LifeStack.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-brand-600" />
                Strict Multi-Tenant Row-Level Scoping
              </div>
              <p className="text-slate-600">
                All records are strictly isolated by owner ID in PostgreSQL. No workspace data is shared, sold, or accessible by other users.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-brand-100 text-brand-700 font-black text-xs flex items-center justify-center">
                4
              </span>
              Right to Account Deletion & Data Purge
            </h2>
            <p>
              LifeStack believes in complete user autonomy and data sovereignty:
            </p>
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50/70 border border-red-200 text-xs text-red-800">
              <Trash2 className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-red-900 font-bold mb-0.5">Permanent Deletion Guarantee</strong>
                You can permanently delete your account at any time from your Dashboard or Settings. When deleted, all associated workspaces, roadmaps, notes, coding problems, job applications, and alerts are cascaded and erased permanently from our databases.
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-brand-100 text-brand-700 font-black text-xs flex items-center justify-center">
                5
              </span>
              Acceptable Use Policy
            </h2>
            <p>You agree not to engage in any of the following prohibited activities:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pl-2">
              <li>Attempting to bypass authentication checks or exploit multi-tenant data boundaries.</li>
              <li>Running automated scrapers, crawlers, or denial-of-service stress tests without authorization.</li>
              <li>Using LifeStack to distribute malicious software, phishing links, or unlawful materials.</li>
              <li>Attempting unauthorized privilege escalation to administrative endpoints.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-brand-100 text-brand-700 font-black text-xs flex items-center justify-center">
                6
              </span>
              Service Availability & Cloud Infrastructure
            </h2>
            <p>
              LifeStack is deployed on containerized cloud infrastructure powered by PostgreSQL and Spring Boot. While we endeavor to maintain high availability and data durability, the service is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis without warranties of any kind.
            </p>
          </section>

          {/* Section 7 */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-brand-100 text-brand-700 font-black text-xs flex items-center justify-center">
                7
              </span>
              Developer Contact & Portfolio
            </h2>
            <p>
              If you have any questions regarding these Terms & Conditions or wish to report a security vulnerability or feature request, you can contact the developer directly through the portfolio link below:
            </p>
            <div className="pt-2">
              <a
                href="https://soumya-here.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 underline underline-offset-4"
              >
                <span>https://soumya-here.vercel.app</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* Global Unified Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <LifeStackLogo className="h-5 w-5" withBackground={false} />
            <span>&copy; {new Date().getFullYear()} LifeStack. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-slate-900 font-medium transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-slate-300">&bull;</span>
            <a
              href="https://soumya-here.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1 transition-colors"
            >
              <span>Portfolio by Soumya</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
