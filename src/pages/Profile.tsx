import { useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  Calendar,
  Users,
  MessageCircle,
  ChevronRight,
  Upload,
  Globe
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";


export default function Profile() {
  const { user, signOut } = useAuth();
  const { getDisplayName, fetchProfile } = useProfiles();
  const { language, setLanguage, t } = useLanguage();
  
  const menuItems = [
    { icon: Settings, label: t('profile.edit'), description: "Update your profile and preferences" },
    { icon: Globe, label: t('profile.language'), description: "Change app language", isLanguage: true },
    { icon: Bell, label: t('profile.notifications'), description: t('profile.notificationsDesc') },
    { icon: Shield, label: t('profile.privacy'), description: t('profile.privacyDesc') },
    { icon: HelpCircle, label: t('profile.help'), description: t('profile.helpDesc') },
  ];
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ eventsOrganized: 0, groupsJoined: 0, messagesSent: 0 });

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      setAvatarUrl(profile?.avatar_url || null);

      const [{ count: eventsCount }, { count: groupsCount }, { count: messagesCount }] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('created_by', user.id),
        supabase.from('group_members').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      setStats({
        eventsOrganized: eventsCount || 0,
        groupsJoined: groupsCount || 0,
        messagesSent: messagesCount || 0,
      });
    };
    load();
  }, [user]);

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    try {
      setUploading(true);
      const path = `${user.id}/avatar.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const baseUrl = data.publicUrl;
      await supabase.from('profiles').update({ avatar_url: baseUrl }).eq('user_id', user.id);
      const version = Date.now();
      const bustedUrl = `${baseUrl}?v=${version}`;
      setAvatarUrl(bustedUrl);
      try { localStorage.setItem('avatar_url', bustedUrl); } catch {}
      window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { url: baseUrl, version } }));
      await fetchProfile(user.id);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title={t('profile.title')} />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Profile Info */}
        <TeRentaCard className="text-center animate-fade-in">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage src={avatarUrl || undefined} alt="Profile picture" />
            <AvatarFallback>
              {user ? getDisplayName(user.id).charAt(0) : 'U'}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-semibold text-card-foreground mb-1">
            {user ? getDisplayName(user.id) : 'Loading...'}
          </h2>
          <p className="text-text-secondary mb-4">
            {user?.email || 'Loading...'}
          </p>
          
          <Button variant="mustard-outline" size="sm" onClick={() => setIsEditing(true)}>
            {t('profile.editProfile')}
          </Button>
        </TeRentaCard>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <TeRentaCard className="text-center animate-slide-up" style={{ animationDelay: `0s` }}>
            <Calendar className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-xl font-bold text-card-foreground">{stats.eventsOrganized}</div>
            <div className="text-xs text-text-secondary">{t('profile.eventsOrganized')}</div>
          </TeRentaCard>
          <TeRentaCard className="text-center animate-slide-up" style={{ animationDelay: `0.1s` }}>
            <Users className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-xl font-bold text-card-foreground">{stats.groupsJoined}</div>
            <div className="text-xs text-text-secondary">{t('profile.groupsJoined')}</div>
          </TeRentaCard>
          <TeRentaCard className="text-center animate-slide-up" style={{ animationDelay: `0.2s` }}>
            <MessageCircle className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-xl font-bold text-card-foreground">{stats.messagesSent}</div>
            <div className="text-xs text-text-secondary">{t('profile.messagesSent')}</div>
          </TeRentaCard>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <TeRentaCard 
              key={item.label} 
              variant="interactive"
              className="animate-slide-up"
              style={{ animationDelay: `${(index + 3) * 0.1}s` }}
              onClick={item.isLanguage ? () => {
                console.log('Language switch clicked, current language:', language);
                setLanguage(language === 'en' ? 'es' : 'en');
              } : undefined}
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
                    {item.isLanguage ? (language === 'en' ? t('profile.english') : t('profile.spanish')) : item.description}
                  </p>
                </div>
                
                {item.isLanguage ? (
                  <div className="text-sm font-medium text-accent">
                    {language === 'en' ? 'EN' : 'ES'}
                  </div>
                ) : (
                  <ChevronRight className="text-text-secondary" size={18} />
                )}
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
              {t('profile.appVersion')}
            </p>
          </div>
        </TeRentaCard>

        {/* Sign Out */}
        <div onClick={() => signOut()}>
          <TeRentaCard variant="interactive">
            <div className="flex items-center gap-3 text-destructive">
              <LogOut size={20} />
              <span className="font-medium">{t('profile.signOut')}</span>
            </div>
          </TeRentaCard>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('profile.editProfile')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={avatarUrl || undefined} alt="Current avatar" />
                <AvatarFallback>{user ? getDisplayName(user.id).charAt(0) : 'U'}</AvatarFallback>
              </Avatar>
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded border border-border cursor-pointer">
                <Upload size={14} />
                <span className="text-sm">{uploading ? t('profile.uploading') : t('profile.uploadNew')}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 transition-none active:!scale-100" onClick={() => setIsEditing(false)}>
                {t('profile.close')}
              </Button>
              <Button className="flex-1 transition-none active:!scale-100" onClick={() => setIsEditing(false)} disabled={uploading}>
                {t('profile.done')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
}