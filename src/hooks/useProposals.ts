import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Proposal {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  location?: string;
  group_id: string;
  created_by: string;
  expires_at?: string;
  event_date?: string;
  status: 'active' | 'closed' | 'passed' | 'failed';
  created_at: string;
  updated_at: string;
  group_name?: string;
  user_vote?: 'yes' | 'no';
  yes_votes?: number;
  no_votes?: number;
  total_votes?: number;
}

export function useProposals(groupId?: string) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProposals = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('proposals')
        .select(`
          *,
          groups(name),
          votes(vote_type, user_id)
        `)
        .order('created_at', { ascending: false });

      if (groupId) {
        query = query.eq('group_id', groupId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedProposals = data?.map(proposal => {
        const votes = proposal.votes || [];
        const userVote = votes.find(v => v.user_id === user.id);
        
        return {
          ...proposal,
          status: proposal.status as 'active' | 'closed' | 'passed' | 'failed',
          group_name: proposal.groups?.name,
          user_vote: userVote && (userVote.vote_type === 'yes' || userVote.vote_type === 'no') ? (userVote.vote_type as 'yes' | 'no') : undefined,
          yes_votes: votes.filter(v => v.vote_type === 'yes').length,
          no_votes: votes.filter(v => v.vote_type === 'no').length,
          total_votes: votes.length
        };
      }) || [];

      setProposals(formattedProposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [user, groupId]);

  // Realtime updates for proposals and votes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`proposals-realtime-${groupId || 'all'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proposals' },
        () => {
          fetchProposals();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          fetchProposals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, groupId]);

  const createProposal = async (proposalData: {
    title: string;
    description?: string;
    group_id: string;
    expires_at?: string;
    event_date?: string;
    image_url?: string;
    location?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        ...proposalData,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    await fetchProposals();
    return data;
  };

  const vote = async (proposalId: string, voteType: 'yes' | 'no') => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('votes')
      .upsert({
        proposal_id: proposalId,
        user_id: user.id,
        vote_type: voteType
      }, {
        onConflict: 'proposal_id,user_id'
      });

    if (error) throw error;

    await fetchProposals();
  };

  return {
    proposals,
    loading,
    createProposal,
    vote,
    refetch: fetchProposals
  };
}