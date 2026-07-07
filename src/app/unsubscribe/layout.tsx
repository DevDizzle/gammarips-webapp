import type { Metadata } from "next";

// Client-only email utility page — keep it out of the index (it was surfacing
// in GSC as indexation noise with no canonical).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function UnsubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
