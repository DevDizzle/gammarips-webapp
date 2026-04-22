
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProcessingPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (authLoading) return;

        if (user) {
            toast({
                title: "You're in.",
                description: "Browse today's pick, the signals list, and the latest report. Upgrade to Pro anytime from /pricing.",
            });
        }
        router.replace('/');
    }, [user, authLoading, router, toast]);

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-center">Signing you in…</CardTitle>
                <CardDescription className="text-center">
                    One moment.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
        </Card>
    );
}
