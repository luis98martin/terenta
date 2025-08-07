import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Group {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  user_role?: string;
}

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGroups = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(role),
          group_members(count)
        `)
        .eq('group_members.user_id', user.id);

      if (error) throw error;

      const formattedGroups = data?.map(group => ({
        ...group,
        member_count: group.group_members?.length || 0,
        user_role: group.group_members[0]?.role || 'member'
      })) || [];

      setGroups(formattedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const createGroup = async (groupData: {
    name: string;
    description?: string;
    image_url?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        ...groupData,
        created_by: user.id
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // The trigger will automatically add creator as admin
    await fetchGroups();
    return group;
  };

  const joinGroup = async (inviteCode: string) => {
    if (!user) throw new Error('User not authenticated');

    // Find group by invite code
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id')
      .eq('invite_code', inviteCode)
      .single();

    if (groupError) throw groupError;

    // Add user as member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'member'
      });

    if (memberError) throw memberError;

    await fetchGroups();
    return group;
  };

  return {
    groups,
    loading,
    createGroup,
    joinGroup,
    refetch: fetchGroups
  };
}