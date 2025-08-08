import { Bell, Search, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AppHeaderProps {
  title: string;
  showNotifications?: boolean;
  showSearch?: boolean;
  showBack?: boolean;
  backTo?: string;
}

export function AppHeader({ title, showNotifications = true, showSearch = false, showBack = false, backTo }: AppHeaderProps) {
  const navigate = useNavigate();
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
          {showSearch && (
            <Button variant="glass" size="icon-sm" className="text-white/80">
              <Search size={18} />
            </Button>
          )}
          
        </div>
      </div>
    </header>
  );
}