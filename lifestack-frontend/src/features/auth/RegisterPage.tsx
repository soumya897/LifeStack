import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2, AlertCircle, ArrowRight, Lock, Mail, User, Globe } from 'lucide-react';
import { LifeStackLogo } from '@/components/LifeStackLogo';

const registerSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    timezone: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const commonTimezones = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
];

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      await registerUser({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        timezone: data.timezone,
      });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create account. Please try again.');
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex justify-center">
            <LifeStackLogo className="h-14 w-14 drop-shadow-md" withBackground={true} />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Create your LifeStack account
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Start organizing your roadmaps, practice problems, and applications
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Full Name
            </label>
            <div className="relative mt-1.5 rounded-lg shadow-2xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                autoComplete="name"
                {...register('displayName')}
                placeholder="Alex Developer"
                className={`block w-full rounded-lg border py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 ${
                  errors.displayName ? 'border-red-300 bg-red-50/30' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.displayName && (
              <p className="mt-1 text-xs text-red-600">{errors.displayName.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Email Address
            </label>
            <div className="relative mt-1.5 rounded-lg shadow-2xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                autoComplete="email"
                {...register('email')}
                placeholder="name@example.com"
                className={`block w-full rounded-lg border py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 ${
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Password (min. 8 characters)
            </label>
            <div className="relative mt-1.5 rounded-lg shadow-2xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                autoComplete="new-password"
                {...register('password')}
                placeholder="••••••••"
                className={`block w-full rounded-lg border py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 ${
                  errors.password ? 'border-red-300 bg-red-50/30' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Confirm Password
            </label>
            <div className="relative mt-1.5 rounded-lg shadow-2xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                placeholder="••••••••"
                className={`block w-full rounded-lg border py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 ${
                  errors.confirmPassword ? 'border-red-300 bg-red-50/30' : 'border-slate-300'
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
            <div className="relative mt-1.5 rounded-lg shadow-2xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Globe className="h-4 w-4" />
              </div>
              <select
                {...register('timezone')}
                className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500"
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 transition-colors mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
