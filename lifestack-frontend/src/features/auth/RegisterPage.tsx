import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AlertCircle, ArrowRight, Lock, Mail, User, Globe, Info, ExternalLink } from 'lucide-react';
import { LifeStackLogo } from '@/components/LifeStackLogo';
import { LifeStackLoader } from '@/components/LifeStackLoader';
import { isCloudConnectingError } from '@/lib/api';
import { AboutLifeStackSection } from './AboutLifeStackSection';

const registerSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    timezone: z.string().min(1, 'Timezone is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const commonTimezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Australia/Sydney',
];

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWakingUp, setIsWakingUp] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'register' | 'about'>('register');

  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      timezone: detectedTimezone,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setErrorMessage(null);
      setIsWakingUp(false);
      await registerUser({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        timezone: data.timezone,
      });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (isCloudConnectingError(err)) {
        setIsWakingUp(true);
        setErrorMessage(null);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create account. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 overflow-x-hidden">
      {/* Mobile Top Segmented Toggle */}
      <div className="lg:hidden p-4 bg-white border-b border-slate-200 w-full z-20 shadow-2xs">
        <div className="max-w-md mx-auto flex rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-2xs">
          <button
            onClick={() => setMobileTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mobileTab === 'register'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => setMobileTab('about')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'about'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            About LifeStack & Guide
          </button>
        </div>
      </div>

      {/* LEFT PANE: Full-Screen About LifeStack & Visual Tour */}
      <div
        className={`lg:w-[55%] xl:w-[58%] min-h-screen bg-gradient-to-br from-brand-50/90 via-sky-50/50 to-brand-100/40 p-6 sm:p-10 lg:p-14 xl:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/90 relative overflow-hidden ${
          mobileTab === 'about' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding Bar */}
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LifeStackLogo className="h-9 w-9 drop-shadow-sm" withBackground={false} />
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block">LifeStack</span>
              <span className="text-[10px] text-brand-600 font-bold tracking-wider uppercase block">
                Engineering OS
              </span>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-700 bg-white/90 px-3 py-1 rounded-full border border-slate-200/90 shadow-2xs backdrop-blur-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Cloud Systems Active
          </span>
        </div>

        {/* Central Showcase Content */}
        <div className="relative z-10 my-auto py-4">
          <AboutLifeStackSection isDark={false} />

          {/* Mobile switch to register form button */}
          <div className="lg:hidden mt-8 pt-4 border-t border-slate-200 text-center">
            <button
              onClick={() => setMobileTab('register')}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-brand-700 transition-colors w-full justify-center"
            >
              Proceed to Registration <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom Left Trust Footer */}
        <div className="relative z-10 pt-8 border-t border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-3">
            <span className="font-medium">Multi-Tenant Isolation</span>
            <span className="text-slate-300">&bull;</span>
            <Link to="/terms" className="font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-2 transition-colors">
              Terms & Conditions
            </Link>
          </div>
          <a
            href="https://soumya-here.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-brand-700 transition-colors"
          >
            <span>Crafted by Soumya</span>
            <ExternalLink className="h-3 w-3 text-brand-600" />
          </a>
        </div>
      </div>

      {/* RIGHT PANE: Full-Screen Register Form */}
      <div
        className={`lg:w-[45%] xl:w-[42%] min-h-screen bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 relative z-10 ${
          mobileTab === 'register' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Mobile Top Navigation */}
        <div className="lg:hidden w-full flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <LifeStackLogo className="h-6 w-6" withBackground={false} />
            <span className="text-sm font-bold text-slate-900">LifeStack</span>
          </div>
          <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
            Register
          </span>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-sm mx-auto my-auto py-8 space-y-5">
          <div>
            <div className="inline-flex justify-center sm:justify-start mb-2">
              <LifeStackLogo className="h-10 w-10 drop-shadow-sm" withBackground={true} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Create an account
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Start tracking your roadmaps, algorithm problems, and job applications.
            </p>
          </div>

          {/* Cloud Wake-Up State */}
          {isWakingUp ? (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-6 text-center space-y-4 animate-in fade-in duration-300">
              <div className="flex justify-center">
                <LifeStackLoader size="lg" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Connecting to Cloud Services...
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  Our secure cloud services are waking up and connecting. 
                  Please hold on a moment while we set up your session.
                </p>
              </div>

              <button
                onClick={() => setIsWakingUp(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer"
              >
                Back to registration form
              </button>
            </div>
          ) : (
            <>
              {/* Error Banner */}
              {errorMessage && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Full Name
                  </label>
                  <div className="relative mt-1.5 rounded-xl shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      autoComplete="name"
                      {...register('displayName')}
                      placeholder="Jane Doe"
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all ${
                        errors.displayName ? 'border-red-300 bg-red-50/30' : 'border-slate-300 bg-slate-50/40 focus:bg-white'
                      }`}
                    />
                  </div>
                  {errors.displayName && (
                    <p className="mt-1 text-xs text-red-600">{errors.displayName.message}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Email Address
                  </label>
                  <div className="relative mt-1.5 rounded-xl shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      placeholder="jane@example.com"
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all ${
                        errors.email ? 'border-red-300 bg-red-50/30' : 'border-slate-300 bg-slate-50/40 focus:bg-white'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <div className="relative mt-1.5 rounded-xl shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      autoComplete="new-password"
                      {...register('password')}
                      placeholder="Min. 8 characters"
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all ${
                        errors.password ? 'border-red-300 bg-red-50/30' : 'border-slate-300 bg-slate-50/40 focus:bg-white'
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative mt-1.5 rounded-xl shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      autoComplete="new-password"
                      {...register('confirmPassword')}
                      placeholder="Repeat password"
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50/30' : 'border-slate-300 bg-slate-50/40 focus:bg-white'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Timezone
                  </label>
                  <div className="relative mt-1.5 rounded-xl shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Globe className="h-4 w-4" />
                    </div>
                    <select
                      {...register('timezone')}
                      className="block w-full rounded-xl border border-slate-300 bg-slate-50/40 py-2.5 pl-10 pr-3 text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 cursor-pointer"
                    >
                      {commonTimezones.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold text-white shadow-md bg-brand-600 hover:bg-brand-700 focus:ring-brand-500 shadow-brand-500/20 focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-all cursor-pointer mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <LifeStackLoader size="xs" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create account</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Already have an account link - placed directly below the button */}
                <div className="pt-2 text-center text-xs text-slate-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2 transition-colors"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Bottom Right Footer */}
        <div className="w-full pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} LifeStack</span>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-slate-700 underline underline-offset-2 transition-colors">
              Terms & Conditions
            </Link>
          </div>
          <a
            href="https://soumya-here.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-brand-600 font-semibold transition-colors"
          >
            <span>Portfolio: Soumya</span>
            <ExternalLink className="h-3 w-3 text-brand-600" />
          </a>
        </div>
      </div>
    </div>
  );
}
