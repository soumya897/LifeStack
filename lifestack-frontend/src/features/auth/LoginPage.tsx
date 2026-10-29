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
        await login(pendingCredentialsRef.current);
        setIsWakingUp(false);
        navigate(from, { replace: true });
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
      await login(data);
      navigate(from, { replace: true });
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
    <div className="min-h-screen w-full bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Mobile / Tablet Segmented Toggle */}
      <div className="lg:hidden max-w-md mx-auto w-full mb-6 flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
        <button
          onClick={() => setMobileTab('login')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'login'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMobileTab('about')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'about'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Info className="h-3.5 w-3.5" />
          About LifeStack & Guide
        </button>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* LEFT COLUMN: About LifeStack & Visual Tour (Desktop visible, mobile conditional) */}
        <div
          className={`lg:col-span-7 ${
            mobileTab === 'about' ? 'block' : 'hidden lg:block'
          } order-2 lg:order-1`}
        >
          <div className="bg-white/80 backdrop-blur-xs rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <AboutLifeStackSection />

            {/* Mobile quick switch button */}
            <div className="lg:hidden mt-6 pt-4 border-t border-slate-200 text-center">
              <button
                onClick={() => setMobileTab('login')}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors w-full justify-center"
              >
                Proceed to Sign In <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign In Card & Cloud Wake-Up State */}
        <div
          className={`lg:col-span-5 ${
            mobileTab === 'login' ? 'block' : 'hidden lg:block'
          } order-1 lg:order-2 w-full max-w-md mx-auto`}
        >
          <div className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            {/* Brand Header */}
            <div className="text-center">
              <div className="mx-auto flex justify-center">
                <LifeStackLogo className="h-14 w-14 drop-shadow-md" withBackground={true} />
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                Sign in to LifeStack
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Access your private roadmaps, algorithms, and job tracker
              </p>
            </div>

            {/* Cloud Wake-Up & Connection Card */}
            {isWakingUp ? (
              <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-6 text-center space-y-4 animate-in fade-in duration-300">
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

                <div className="inline-flex items-center gap-2 rounded-full bg-brand-100/80 px-3 py-1 text-[11px] font-semibold text-brand-800 border border-brand-200">
                  <RefreshCw className="h-3 w-3 animate-spin text-brand-600" />
                  <span>Connecting instance... (Check #{wakeUpAttemptCount})</span>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleManualRetry}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry Connection Now
                  </button>
                  <button
                    onClick={() => {
                      setIsWakingUp(false);
                      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1"
                  >
                    Edit credentials
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Standard Global Error Banner */}
                {errorMessage && (
                  <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
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
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        autoComplete="email"
                        {...register('email')}
                        placeholder="name@example.com"
                        className={`block w-full rounded-xl border py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 ${
                          errors.email ? 'border-red-300 bg-red-50/30' : 'border-slate-300'
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
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type="password"
                        autoComplete="current-password"
                        {...register('password')}
                        placeholder="••••••••"
                        className={`block w-full rounded-xl border py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 ${
                          errors.password ? 'border-red-300 bg-red-50/30' : 'border-slate-300'
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-2.5 px-4 text-sm font-semibold text-white shadow-xs hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <LifeStackLoader size="xs" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Links & Mobile Guide Switch */}
                <div className="space-y-3 pt-2 text-center text-xs text-slate-500">
                  <div>
                    Don't have an account yet?{' '}
                    <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                      Create account
                    </Link>
                  </div>

                  <div className="lg:hidden pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setMobileTab('about')}
                      className="text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1"
                    >
                      <Info className="h-3.5 w-3.5" />
                      What is LifeStack & How to use it?
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
