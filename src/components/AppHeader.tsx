import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  title: string;
  showNotifications?: boolean;
  showSearch?: boolean;
}

export function AppHeader({ title, showNotifications = true, showSearch = false }: AppHeaderProps) {
  return (
    <header className="bg-primary backdrop-blur-sm border-b border-border/30 px-4 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">
            {title}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {showSearch && (
            <Button variant="glass" size="icon-sm" className="text-white/80">
              <Search size={18} />
            </Button>
          )}
          
          {showNotifications && (
            <Button variant="glass" size="icon-sm" className="text-white/80 relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                3
              </span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}