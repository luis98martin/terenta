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
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        {navigationItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200",
                "min-w-0 flex-1 hover:bg-muted/50",
                isActive && "text-accent"
              )}
            >
              <Icon 
                size={24} 
                className={cn(
                  "transition-all duration-200",
                  isActive ? "fill-current" : "stroke-current"
                )}
              />
              <span className={cn(
                "text-xs mt-1 font-medium transition-colors",
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