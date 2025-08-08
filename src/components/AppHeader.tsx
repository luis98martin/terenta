import { Bell, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";

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
  const avatarUrl = user ? profiles[user.id]?.avatar_url ?? undefined : undefined;
  const displayName = user ? getDisplayName(user.id) : 'Profile';
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
            <Button variant="mustard" size="icon-sm" onClick={() => (backTo ? navigate(backTo) : navigate(-1))} aria-label="Go back">
              <ChevronLeft size={18} />
            </Button>
          )}
          <img
            src="/lovable-uploads/a878b72e-05fa-459d-a514-06cf3eca6f6c.png"
            alt="TeRenta? app icon"
            className="w-7 h-7 rounded"
            loading="lazy"
          />
          <h1 className="text-2xl font-bold text-white">TeRenta?</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Avatar
            className="h-8 w-8 cursor-pointer ring-1 ring-border/50"
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