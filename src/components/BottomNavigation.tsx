import { Home, Users, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function BottomNavigation() {
  const location = useLocation();
  const { t } = useLanguage();

  const navigationItems = [
    { icon: Home, label: t('nav.home'), path: "/" },
    { icon: Users, label: t('nav.groups'), path: "/groups" },
    { icon: Calendar, label: t('nav.calendar'), path: "/calendar" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary/95 backdrop-blur-sm border-t border-border/30 z-50 safe-area-pb">
      <div className="flex items-center justify-around py-3 px-4 max-w-lg mx-auto">
        {navigationItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center justify-center py-3 flex-1"
            >
              <Icon 
                size={24} 
                className={`mb-1 ${isActive ? "text-accent" : "text-white/60"}`}
              />
              <span className={`text-xs font-medium ${isActive ? "text-accent" : "text-white/60"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}