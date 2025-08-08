import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Users, Calendar, MessageCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useGroups } from "@/hooks/useGroups";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Groups() {
  const { groups, loading, joinGroup } = useGroups();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState("");
  const [joiningGroup, setJoiningGroup] = useState(false);

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Enter invite code",
        description: "Please enter a valid invite code",
        variant: "destructive",
      });
      return;
    }

    setJoiningGroup(true);
    try {
      await joinGroup(inviteCode.trim().toUpperCase());
      toast({
        title: "Joined group!",
        description: "You've successfully joined the group",
      });
      setInviteCode("");
    } catch (error: any) {
      toast({
        title: "Failed to join group",
        description: error.message || "Invalid invite code",
        variant: "destructive",
      });
    } finally {
      setJoiningGroup(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Groups" showSearch />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        <div>
          <Button 
            variant="mustard"
            className="w-full h-12"
            asChild
          >
            <Link to="/groups/create">
              <Plus size={16} className="mr-2" />
              Create Group
            </Link>
          </Button>
        </div>

        {/* Join Group Section */}
        <TeRentaCard className="animate-fade-in">
          <div className="space-y-4">
            <h3 className="font-semibold text-card-foreground">Join a Group</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                <Input
                  placeholder="Enter invite code..."
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
                {joiningGroup ? 'Joining...' : 'Join'}
              </Button>
            </div>
          </div>
        </TeRentaCard>

        {/* Groups List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-text-secondary">Loading groups...</p>
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
                  className={`animate-slide-up cursor-pointer hover:bg-card/80 transition-colors`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={group.image_url || undefined} alt={`${group.name} image`} />
                      <AvatarFallback>
                        {group.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {group.member_count} members
                          </span>
                          <span>Code: {group.invite_code}</span>
                        </div>
                        <div className="flex gap-1">
                          <div className="text-accent p-1">
                            <MessageCircle size={16} />
                          </div>
                          <div className="text-accent p-1">
                            <Calendar size={16} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TeRentaCard>
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-text-secondary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No groups yet</h3>
              <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                Create your first group or join one with an invite code to get started!
              </p>
              <Button variant="mustard" asChild>
                <Link to="/groups/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
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