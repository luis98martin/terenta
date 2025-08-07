import { Home, Users, MessageCircle, Calendar, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { 
    icon: Home, 
    label: "Home", 
    path: "/" 
  },
  { 
    icon: Users, 
    label: "Groups", 
    path: "/groups" 
  },
  { 
    icon: MessageCircle, 
    label: "Chat", 
    path: "/chat" 
  },
  { 
    icon: Calendar, 
    label: "Calendar", 
    path: "/calendar" 
  },
  { 
    icon: User, 
    label: "Profile", 
    path: "/profile" 
  },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-border/30 z-50 safe-area-pb">
      <div className="flex items-center justify-around py-3 px-4 max-w-lg mx-auto">
        {navigationItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-200",
                "min-w-0 flex-1 hover:bg-accent/10 active:scale-95",
                isActive && "bg-accent/10 text-accent"
              )}
            >
              <Icon 
                size={22} 
                className={cn(
                  "transition-all duration-200 mb-1",
                  isActive ? "fill-current stroke-2" : "stroke-current stroke-2"
                )}
              />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive ? "text-accent" : "text-text-secondary"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}