import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TeRentaCard } from "@/components/TeRentaCard";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";

export default function JoinGroup() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [group, setGroup] = useState<{ id: string; name: string; image_url?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `Join Group | TeRenta`;
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Join a TeRenta group with your invite link.';
    document.head.appendChild(meta);
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = `${window.location.origin}/join/${code || ''}`;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(meta);
      document.head.removeChild(link);
    };
  }, [code]);

  useEffect(() => {
    const run = async () => {
      if (!code) { setLoading(false); return; }
      const normalized = code.toUpperCase();

      if (!user) {
        // Persist invite code and show auth choice
        localStorage.setItem('pending_join_code', normalized);
        try {
          const { data } = await supabase.rpc('get_group_by_invite', { invite_code: normalized });
          setGroup((data && Array.isArray(data) ? data[0] : null) || null);
        } catch (_) {
          setGroup(null);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const { data: groupId, error } = await supabase.rpc('join_group', { invite_code: normalized });
        if (error) throw error;
        if (!groupId) throw new Error('Invalid or expired invite code');
        toast({ title: t('joinGroup.joinedGroup'), description: t('joinGroup.welcomeToGroup') });
        navigate(`/groups/${groupId}`);
      } catch (err: any) {
        toast({ title: t('joinGroup.failedToJoin'), description: err.message || 'Please try again', variant: 'destructive' });
        navigate('/groups');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [code, user, navigate, toast]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title={t('joinGroup.title')} showBack backTo="/" />
      <div className="px-4 py-6 max-w-lg mx-auto">
        <TeRentaCard>
          {!user ? (
            <div className="py-8 space-y-5 text-center">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-text-secondary">{t('joinGroup.loadingInvite')}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={group?.image_url || undefined} alt={`${group?.name || 'Group'} image`} />
                      <AvatarFallback>{(group?.name || 'G').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <h1 className="font-semibold text-card-foreground">
                        {group?.name ? t('joinGroup.invitedToJoin').replace('{groupName}', group.name) : t('joinGroup.invitedGeneric')}
                      </h1>
                      <p className="text-sm text-text-secondary">{t('joinGroup.chooseContinue')}</p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Button variant="mustard" onClick={() => navigate('/auth/login')}>
                      {t('joinGroup.haveAccount')}
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/auth/register')}>
                      {t('joinGroup.createAccount')}
                    </Button>
                  </div>

                  <p className="text-xs text-text-secondary">
                    {t('joinGroup.autoJoin')}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-text-secondary">{t('joinGroup.processingInvite')}</p>
            </div>
          )}
        </TeRentaCard>
      </div>
      <BottomNavigation />
    </div>
  );
}
