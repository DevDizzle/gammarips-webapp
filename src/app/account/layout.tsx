import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Account',
  description: 'Manage your GammaRips subscription, billing, and AI agent connection.',
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col min-h-[calc(100vh-10rem)]">{children}</div>;
}
