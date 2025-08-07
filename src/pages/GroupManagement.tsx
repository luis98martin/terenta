import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Users, Crown, Edit2, UserMinus, Upload } from "lucide-react";
import { useGroups } from "@/hooks/useGroups";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GroupMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile?: {
    display_name?: string;
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
  };
}

export default function GroupManagement() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { groups } = useGroups();
  const { user } = useAuth();
  const { getDisplayName, fetchProfiles } = useProfiles();
  const { toast } = useToast();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  const group = groups.find(g => g.id === groupId);
  const isAdmin = group?.user_role === 'admin';

  // Fetch group members
  const fetchMembers = async () => {
    if (!groupId) return;

    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId);

      if (error) throw error;

      const membersData = data?.map(member => ({
        ...member,
        role: member.role as 'admin' | 'member'
      })) || [];

      setMembers(membersData);

      // Fetch user profiles
      const userIds = membersData.map(m => m.user_id);
      if (userIds.length > 0) {
        fetchProfiles(userIds);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    if (group) {
      setEditedName(group.name);
      setEditedDescription(group.description || "");
    }
  }, [groupId, group]);

  const handleUpdateGroup = async () => {
    if (!group || !editedName.trim()) return;

    try {
      const { error } = await supabase
        .from('groups')
        .update({
          name: editedName.trim(),
          description: editedDescription.trim() || null
        })
        .eq('id', group.id);

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Group updated",
        description: "Group information has been saved"
      });
    } catch (error: any) {
      toast({
        title: "Failed to update group",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!groupId) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      fetchMembers();
      toast({
        title: "Member removed",
        description: "The member has been removed from the group"
      });
    } catch (error: any) {
      toast({
        title: "Failed to remove member",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handlePromoteToAdmin = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role: 'admin' })
        .eq('id', memberId);

      if (error) throw error;

      fetchMembers();
      toast({
        title: "Member promoted",
        description: "The member has been promoted to admin"
      });
    } catch (error: any) {
      toast({
        title: "Failed to promote member",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Group Not Found" />
        <div className="px-4 py-6 max-w-lg mx-auto">
          <TeRentaCard>
            <div className="text-center">
              <p className="text-text-secondary mb-4">This group doesn't exist or you don't have access to it.</p>
              <Button variant="mustard" onClick={() => navigate('/groups')}>
                Back to Groups
              </Button>
            </div>
          </TeRentaCard>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Access Denied" />
        <div className="px-4 py-6 max-w-lg mx-auto">
          <TeRentaCard>
            <div className="text-center">
              <p className="text-text-secondary mb-4">You need admin privileges to manage this group.</p>
              <Button variant="mustard" onClick={() => navigate(`/groups/${groupId}`)}>
                Back to Group
              </Button>
            </div>
          </TeRentaCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="flex items-center px-4 py-3 bg-surface border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mr-3">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold">Manage Group</h1>
      </div>
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Group Info */}
        <TeRentaCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{group.name}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} className="mr-1" />
                Edit
              </Button>
            </div>
            {group.description && (
              <p className="text-text-secondary">{group.description}</p>
            )}
            <div className="text-sm text-text-secondary">
              Invite Code: <span className="font-mono bg-background/50 px-2 py-1 rounded">{group.invite_code}</span>
            </div>
          </div>
        </TeRentaCard>

        {/* Members List */}
        <TeRentaCard>
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} />
            <h2 className="font-semibold">Members ({members.length})</h2>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage 
                        src={`https://kpwiblindzupzbwavump.supabase.co/storage/v1/object/public/avatars/${member.user_id}/avatar.jpg`}
                      />
                      <AvatarFallback>
                        {getDisplayName(member.user_id).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getDisplayName(member.user_id)}</span>
                        {member.role === 'admin' && (
                          <Badge variant="secondary" className="text-xs">
                            <Crown size={10} className="mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {member.user_id !== user?.id && (
                    <div className="flex items-center gap-2">
                      {member.role === 'member' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePromoteToAdmin(member.id)}
                        >
                          <Crown size={14} className="mr-1" />
                          Promote
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <UserMinus size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </TeRentaCard>
      </div>

      {/* Edit Group Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Enter group description"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateGroup}
                className="flex-1"
                disabled={!editedName.trim()}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
}