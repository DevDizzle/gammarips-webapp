
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
import { LogOut, User as UserIcon, LogIn } from 'lucide-react';
import { useState } from 'react';
import { AuthDialog } from './auth-dialog';
import { Skeleton } from '../ui/skeleton';

export function UserNav() {
  const { user, signOut, loading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  if (loading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }
  
  if (!user) {
    return (
      <>
        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
        <Button onClick={() => setShowAuthDialog(true)}>
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'G';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name[0];
  };

  return (
    <>
    <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
            <AvatarFallback>{user.isAnonymous ? 'G' : getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.isAnonymous ? 'Guest User' : user.displayName || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {!user.isAnonymous ? user.email : 'Sign in to save your history.'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!user.isAnonymous && (
           <DropdownMenuGroup>
             <DropdownMenuItem>
               <UserIcon className="mr-2 h-4 w-4" />
               <span>Profile</span>
             </DropdownMenuItem>
           </DropdownMenuGroup>
        )}
       
        {user.isAnonymous && (
            <DropdownMenuItem onClick={() => setShowAuthDialog(true)}>
                <LogIn className="mr-2 h-4 w-4" />
                <span>Sign In / Sign Up</span>
            </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}
