import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TeRentaCard } from "@/components/TeRentaCard";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";

export default function JoinGroup() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

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
      if (!code) return;
      const normalized = code.toUpperCase();

      if (!user) {
        // Persist for after login and route to sign up
        localStorage.setItem('pending_join_code', normalized);
        navigate('/auth/register');
        return;
      }

      try {
        const { data: groupId, error } = await supabase.rpc('join_group', { invite_code: normalized });
        if (error) throw error;
        if (!groupId) throw new Error('Invalid or expired invite code');
        toast({ title: 'Joined group!', description: 'Welcome to your new group.' });
        navigate(`/groups/${groupId}`);
      } catch (err: any) {
        toast({ title: 'Failed to join group', description: err.message || 'Please try again', variant: 'destructive' });
        navigate('/groups');
      }
    };
    run();
  }, [code, user, navigate, toast]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Joining Group" showBack backTo="/" />
      <div className="px-4 py-6 max-w-lg mx-auto">
        <TeRentaCard>
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-text-secondary">Processing your invite…</p>
          </div>
        </TeRentaCard>
      </div>
      <BottomNavigation />
    </div>
  );
}
