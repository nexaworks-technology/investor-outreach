import { signup } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { SubmitButton } from '@/components/submit-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter your details below to get started
          </p>
        </div>

        {resolvedSearchParams?.error && (
          <div className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-500 dark:bg-rose-950/50 dark:text-rose-400">
            {resolvedSearchParams.error}
          </div>
        )}

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          <div className="flex flex-col gap-4 pt-2">
            <SubmitButton formAction={signup} className="w-full">
              Sign Up
            </SubmitButton>
            <div className="text-center text-sm text-zinc-500">
              Already have an account?{' '}
              <Link href="/login" className="text-zinc-900 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300">
                Log in
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
