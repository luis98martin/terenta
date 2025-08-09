import { Bell, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { useEffect, useState } from "react";

interface AppHeaderProps {
  title: string;
  showNotifications?: boolean;
  showSearch?: boolean;
  showBack?: boolean;
  backTo?: string;
}

export function AppHeader({ title, showNotifications = true, showSearch = false, showBack = false, backTo }: AppHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profiles, getDisplayName } = useProfiles();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(() => (
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('avatar_url') || undefined : undefined)
  ));
  const displayName = user ? getDisplayName(user.id) : 'Profile';

  // Helper to compare URLs ignoring cache-busting query
  const stripQuery = (url?: string) => (url ? url.split('?')[0] : undefined);

  // Keep header avatar in sync with profiles without dropping cache-busting
  useEffect(() => {
    if (!user) return;
    const latest = profiles[user.id]?.avatar_url;
    if (latest && stripQuery(latest) !== stripQuery(avatarUrl)) {
      setAvatarUrl(latest);
      try { localStorage.setItem('avatar_url', latest); } catch {}
    }
  }, [profiles, user, avatarUrl]);

  // Listen for immediate avatar updates from Profile page
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ url: string; version: number }>;
      if (!ce.detail) return;
      const busted = `${ce.detail.url}?v=${ce.detail.version}`;
      setAvatarUrl(busted);
      try { localStorage.setItem('avatar_url', busted); } catch {}
    };
    window.addEventListener('avatar-updated', handler as EventListener);
    return () => window.removeEventListener('avatar-updated', handler as EventListener);
  }, []);
  const initials = (displayName || 'U')
    .split(' ')
    .map((n) => n?.[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';
  return (
    <header className="bg-primary backdrop-blur-sm border-b border-border/30 px-4 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button variant="header-mustard" size="icon-sm" onClick={() => (backTo ? navigate(backTo) : navigate(-1))} aria-label="Go back">
              <ChevronLeft size={18} />
            </Button>
          )}
          <img
            src="/lovable-uploads/clearlogo.png"
            alt="TeRenta? app icon"
            className="w-7 h-7 rounded scale-110"
            loading="lazy"
          />
          <h1 className="text-2xl font-bold text-white font-chewy">Te Renta?</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Avatar
            className="h-8 w-8 cursor-pointer"
            onClick={() => navigate('/profile')}
            role="button"
            aria-label="Open profile"
          >
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={`${displayName} avatar`} loading="lazy" />
            ) : (
              <AvatarFallback className="text-foreground/80">{initials}</AvatarFallback>
            )}
          </Avatar>
        </div>
      </div>
    </header>
  );
}