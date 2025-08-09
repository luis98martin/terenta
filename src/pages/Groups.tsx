import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Users, Calendar, MessageCircle, Search, Share } from "lucide-react";
import { Link } from "react-router-dom";
import { useGroups } from "@/hooks/useGroups";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Groups() {
  const { groups, loading, joinGroup, leaveGroup } = useGroups();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [inviteCode, setInviteCode] = useState("");
  const [joiningGroup, setJoiningGroup] = useState(false);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: t('groups.enterInviteCode'),
        description: t('groups.pleaseEnterValidCode'),
        variant: "destructive",
      });
      return;
    }

    setJoiningGroup(true);
    try {
      await joinGroup(inviteCode.trim().toUpperCase());
      toast({
        title: t('groups.joinedGroup'),
        description: t('groups.successfullyJoined'),
      });
      setInviteCode("");
    } catch (error: any) {
      toast({
        title: t('groups.failedToJoinGroup'),
        description: error.message || t('groups.invalidInviteCode'),
        variant: "destructive",
      });
    } finally {
      setJoiningGroup(false);
    }
  };

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    const confirm = window.confirm(`Leave "${groupName}"?`);
    if (!confirm) return;
    setLeavingId(groupId);
    try {
      await leaveGroup(groupId);
      toast({ title: t('groups.leftGroup'), description: `You left ${groupName}` });
    } catch (error: any) {
      toast({ title: t('groups.couldNotLeaveGroup'), description: error.message || 'Please try again', variant: 'destructive' });
    } finally {
      setLeavingId(null);
    }
  };

  const handleShareGroup = async (group: { name: string; invite_code: string }) => {
    const url = `${window.location.origin}/join/${group.invite_code}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${group.name} on TeRenta`, text: `Join ${group.name} on TeRenta`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: t('groups.inviteLinkCopied'), description: t('groups.shareWithFriends') });
      }
    } catch (e) {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: t('groups.inviteLinkCopied'), description: t('groups.shareWithFriends') });
      } catch {
        toast({ title: t('groups.unableToShare'), description: t('groups.copyCodeManually'), variant: 'destructive' });
      }
    }
  };
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title={t('groups.title')} showSearch />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <div>
          <Button 
            variant="mustard"
            className="w-full h-12"
            asChild
          >
            <Link to="/groups/create">
              <Plus size={16} className="mr-2" />
              {t('groups.createGroup')}
            </Link>
          </Button>
        </div>

        {/* Join Group Section */}
        <TeRentaCard className="animate-fade-in">
          <div className="space-y-4">
            <h3 className="font-semibold text-card-foreground">{t('groups.joinGroup')}</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                <Input
                  placeholder={t('groups.joinGroupPlaceholder')}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="pl-10"
                  maxLength={8}
                />
              </div>
              <Button 
                onClick={handleJoinGroup}
                disabled={joiningGroup || !inviteCode.trim()}
                variant="mustard"
              >
                {joiningGroup ? t('groups.joining') : t('groups.join')}
              </Button>
            </div>
          </div>
        </TeRentaCard>

        {/* Groups List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-text-secondary">{t('groups.loadingGroups')}</p>
            </div>
          ) : groups.length > 0 ? (
            groups.map((group, index) => (
              <Link 
                key={group.id}
                to={`/groups/${group.id}`}
                className="block"
              >
                <TeRentaCard 
                  variant="interactive" 
                  className={`animate-slide-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <div className="grid grid-cols-[3rem,1fr] gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={group.image_url || undefined} alt={`${group.name} image`} />
                        <AvatarFallback>
                          {group.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-card-foreground truncate">
                            {group.name}
                          </h3>
                          <span className="text-xs text-text-secondary bg-background/50 px-2 py-1 rounded">
                            {group.user_role}
                          </span>
                        </div>
                        {group.description && (
                          <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                            {group.description}
                          </p>
                        )}
                      </div>

                      <div className="col-span-2 mt-1 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {group.member_count} {t('groups.members')}
                        </span>
                        <span>{t('groups.code')} {group.invite_code}</span>

                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShareGroup(group); }}
                        >
                          <Share size={14} className="mr-1" /> {t('groups.share')}
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLeaveGroup(group.id, group.name); }}
                          disabled={leavingId === group.id}
                        >
                          {leavingId === group.id ? t('groups.leaving') : t('groups.leave')}
                        </Button>
                      </div>
                    </div>
                </TeRentaCard>
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-text-secondary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('groups.noGroups')}</h3>
              <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                {t('groups.noGroupsDescription')}
              </p>
              <Button variant="mustard" asChild>
                <Link to="/groups/create">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('groups.createGroup')}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}