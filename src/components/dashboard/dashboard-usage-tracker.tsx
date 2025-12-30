'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { incrementDashboardViewCount } from '@/app/actions';

export function DashboardUsageTracker() {
  const { user } = useAuth();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (user && !trackedRef.current) {
      trackedRef.current = true;
      incrementDashboardViewCount(user.uid).catch(console.error);
    }
  }, [user]);

  return null;
}
