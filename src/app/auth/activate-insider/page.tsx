
import { activateInsiderUser } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activate Insider Access | GammaRips',
  description: 'Activate your exclusive insider access.',
};

export default async function ActivateInsiderPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token;

  if (!token || typeof token !== 'string') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">Invalid Activation Link</h1>
        <p className="mt-2 text-muted-foreground">The link you used is invalid or missing the activation token.</p>
        <Link href="/" className="mt-6 text-primary hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  const result = await activateInsiderUser(token);

  if (result.success) {
    redirect('/dashboard?welcome=insider');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <h1 className="text-2xl font-bold text-destructive">Activation Failed</h1>
      <p className="mt-2 text-muted-foreground">{result.error || 'An unexpected error occurred.'}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        This link may have already been used or has expired.
      </p>
      <Link href="/" className="mt-6 text-primary hover:underline">
        Return to Home
      </Link>
    </div>
  );
}
