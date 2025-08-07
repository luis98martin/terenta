import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  Calendar,
  Users,
  MessageCircle,
  ChevronRight
} from "lucide-react";

const profileStats = [
  { icon: Calendar, label: "Events Organized", value: "24" },
  { icon: Users, label: "Groups Joined", value: "8" },
  { icon: MessageCircle, label: "Messages Sent", value: "156" },
];

const menuItems = [
  { icon: Settings, label: "Account Settings", description: "Update your profile and preferences" },
  { icon: Bell, label: "Notifications", description: "Manage notification settings" },
  { icon: Shield, label: "Privacy & Security", description: "Control your privacy settings" },
  { icon: HelpCircle, label: "Help & Support", description: "Get help and contact support" },
];

export default function Profile() {
  const { user, signOut } = useAuth();
  const { getDisplayName } = useProfiles();
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Profile" />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Profile Info */}
        <TeRentaCard className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-accent" size={32} />
          </div>
          
          <h2 className="text-xl font-semibold text-card-foreground mb-1">
            {user ? getDisplayName(user.id) : 'Loading...'}
          </h2>
          <p className="text-text-secondary mb-4">
            {user?.email || 'Loading...'}
          </p>
          
          <Button variant="mustard-outline" size="sm">
            Edit Profile
          </Button>
        </TeRentaCard>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {profileStats.map((stat, index) => (
            <TeRentaCard 
              key={stat.label} 
              className={`text-center animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-accent" />
              <div className="text-xl font-bold text-card-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-text-secondary">
                {stat.label}
              </div>
            </TeRentaCard>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <TeRentaCard 
              key={item.label} 
              variant="interactive"
              className={`animate-slide-up`}
              style={{ animationDelay: `${(index + 3) * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <item.icon className="text-text-secondary" size={18} />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-card-foreground">
                    {item.label}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {item.description}
                  </p>
                </div>
                
                <ChevronRight className="text-text-secondary" size={18} />
              </div>
            </TeRentaCard>
          ))}
        </div>

        {/* App Info */}
        <TeRentaCard>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-card-foreground">
              Te<span className="text-accent">Renta</span>? v1.0.0
            </h3>
            <p className="text-sm text-text-secondary">
              Making group planning simple and fun
            </p>
          </div>
        </TeRentaCard>

        {/* Sign Out */}
        <div onClick={() => signOut()}>
          <TeRentaCard variant="interactive">
            <div className="flex items-center gap-3 text-destructive">
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </div>
          </TeRentaCard>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}