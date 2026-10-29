import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  RefreshCw,
  Info,
  ExternalLink,
} from 'lucide-react';
import { LifeStackLogo } from '@/components/LifeStackLogo';
import { LifeStackLoader } from '@/components/LifeStackLoader';
import { isCloudConnectingError } from '@/lib/api';
import { checkBackendReadiness } from '@/lib/wakeUpService';
import { AboutLifeStackSection } from './AboutLifeStackSection';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWakingUp, setIsWakingUp] = useState<boolean>(false);
  const [wakeUpAttemptCount, setWakeUpAttemptCount] = useState<number>(0);
  const [mobileTab, setMobileTab] = useState<'login' | 'about'>('login');

  const pendingCredentialsRef = useRef<LoginFormData | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const handleSilentPollAndRetry = async () => {
    setWakeUpAttemptCount((prev) => prev + 1);
    const { ready } = await checkBackendReadiness();

    if (ready && pendingCredentialsRef.current) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }

      try {
        const loggedUser = await login(pendingCredentialsRef.current);
        setIsWakingUp(false);
        if (loggedUser?.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else {
          navigate(from === '/admin' ? '/' : from, { replace: true });
        }
      } catch (err: unknown) {
        setIsWakingUp(false);
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Failed to sign in. Please check your credentials.');
        }
      }
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setErrorMessage(null);
      setIsWakingUp(false);
      pendingCredentialsRef.current = data;
      const loggedUser = await login(data);
      if (loggedUser?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from === '/admin' ? '/' : from, { replace: true });
      }
    } catch (err: unknown) {
      if (isCloudConnectingError(err)) {
        // Backend / DB instance is offline, sleeping, or cold-starting
        setIsWakingUp(true);
        setWakeUpAttemptCount(1);
        setErrorMessage(null);

        // Start background readiness polling every 3.5s
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        pollTimerRef.current = setInterval(handleSilentPollAndRetry, 3500);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to sign in. Please verify your credentials.');
      }
    }
  };

  const handleManualRetry = async () => {
    if (pendingCredentialsRef.current) {
      await onSubmit(pendingCredentialsRef.current);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 overflow-x-hidden">
      {/* Mobile Top Segmented Toggle */}
      <div className="lg:hidden p-4 bg-white border-b border-slate-200 w-full z-20 shadow-2xs">
        <div className="max-w-md mx-auto flex rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-2xs">
          <button
            onClick={() => setMobileTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mobileTab === 'login'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
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
        className={`lg:w-[58%] xl:w-[62%] min-h-screen bg-gradient-to-br from-brand-50/90 via-sky-50/50 to-brand-100/40 p-6 sm:p-10 lg:p-14 xl:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/90 relative overflow-hidden ${
          mobileTab === 'about' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Subtle Ambient Radial Glows */}
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

          {/* Mobile switch to sign in button */}
          <div className="lg:hidden mt-8 pt-4 border-t border-slate-200 text-center">
            <button
              onClick={() => setMobileTab('login')}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-brand-700 transition-colors w-full justify-center"
            >
              Proceed to Sign In <ArrowRight className="h-4 w-4" />
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

      {/* RIGHT PANE: Full-Screen Sign In Form & Cloud Wake-Up Card */}
      <div
        className={`lg:w-[42%] xl:w-[38%] min-h-screen bg-white flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 relative z-10 ${
          mobileTab === 'login' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Mobile Top Navigation */}
        <div className="lg:hidden w-full flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <LifeStackLogo className="h-6 w-6" withBackground={false} />
            <span className="text-sm font-bold text-slate-900">LifeStack</span>
          </div>
          <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
            Sign In
          </span>
        </div>

        {/* Center Card Content */}
        <div className="w-full max-w-sm mx-auto my-auto py-8 space-y-6">
          {/* Header */}
          <div className="text-center sm:text-left">
            <div className="inline-flex justify-center sm:justify-start mb-3">
              <LifeStackLogo className="h-12 w-12 drop-shadow-sm" withBackground={true} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Sign in to access your roadmaps, algorithm problems, and job application pipeline.
            </p>
          </div>

          {/* Cloud Wake-Up & Connection Card */}
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
                  Our secure cloud services are waking up and establishing a connection. 
                  Because of idle hibernation, this may take 15–20 seconds. 
                  Please hold on while we prepare your session.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-brand-100/90 px-3.5 py-1 text-[11px] font-semibold text-brand-800 border border-brand-200">
                <RefreshCw className="h-3 w-3 animate-spin text-brand-600" />
                <span>Connecting instance... (Check #{wakeUpAttemptCount})</span>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleManualRetry}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry Connection Now
                </button>
                <button
                  onClick={() => {
                    setIsWakingUp(false);
                    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer"
                >
                  Edit credentials
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Standard Global Error Banner */}
              {errorMessage && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
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
                      placeholder="name@example.com"
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all ${
                        errors.email ? 'border-red-300 bg-red-50/30' : 'border-slate-300 bg-slate-50/40 focus:bg-white'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Password
                    </label>
                  </div>
                  <div className="relative mt-1.5 rounded-xl shadow-2xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      autoComplete="current-password"
                      {...register('password')}
                      placeholder="••••••••"
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all ${
                        errors.password ? 'border-red-300 bg-red-50/30' : 'border-slate-300 bg-slate-50/40 focus:bg-white'
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 px-4 text-sm font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <LifeStackLoader size="xs" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in to LifeStack</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Don't have an account link - placed directly below the button */}
                <div className="pt-2 text-center text-xs text-slate-600">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-brand-600 hover:text-brand-700 underline underline-offset-2 transition-colors"
                  >
                    Create account
                  </Link>
                </div>
              </form>

              {/* Mobile Guide Switch Link */}
              <div className="lg:hidden pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setMobileTab('about')}
                  className="text-xs text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Info className="h-3.5 w-3.5" />
                  What is LifeStack & How to use it?
                </button>
              </div>
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
