
'use client';

import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { AuthDialog } from './auth-dialog';
import Link from 'next/link';

export function UserNav() {
  const { user, signOut, loading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Render the unauthenticated CTA in two cases:
  //  1) auth still resolving (loading=true) — true on SSR and pre-hydration
  //  2) auth resolved with no user
  // A real link (crawlable) to the product page, not an era-2 trial button:
  // the human site is free forever; the paid thing is agent access.
  if (loading || !user) {
    return (
      <div className="flex items-center gap-3">
        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
        <button
          onClick={() => setShowAuthDialog(true)}
          className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:inline"
        >
          Sign in
        </button>
        <Button asChild>
          <Link href="/developers">Connect Your Agent</Link>
        </Button>
      </div>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name[0] || 'U';
  };

  return (
    <>
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User Avatar'} />
              <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.displayName || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/pricing">
               <DropdownMenuItem>
                    <span className="text-primary font-semibold">Subscribe</span>
                </DropdownMenuItem>
            </Link>
            <Link href="/">
               <DropdownMenuItem>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Home</span>
                </DropdownMenuItem>
            </Link>
            <Link href="/account">
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    </>
  );
}
