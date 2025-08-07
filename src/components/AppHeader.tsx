import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  title: string;
  showNotifications?: boolean;
  showSearch?: boolean;
}

export function AppHeader({ title, showNotifications = true, showSearch = false }: AppHeaderProps) {
  return (
    <header className="bg-background border-b border-border/20 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        
        <div className="flex items-center gap-2">
          {showSearch && (
            <Button variant="ghost" size="sm" className="text-foreground/80">
              <Search size={20} />
            </Button>
          )}
          
          {showNotifications && (
            <Button variant="ghost" size="sm" className="text-foreground/80 relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}