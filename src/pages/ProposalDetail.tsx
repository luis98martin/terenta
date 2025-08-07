import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Minus, MessageSquare, Calendar, ArrowLeft, Send } from "lucide-react";
import { useProposals } from "@/hooks/useProposals";
import { useToast } from "@/hooks/use-toast";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ProposalComment {
  id: string;
  proposal_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function ProposalDetail() {
  const { groupId, proposalId } = useParams<{ groupId: string; proposalId: string }>();
  const navigate = useNavigate();
  const { proposals, vote } = useProposals(groupId);
  const { toast } = useToast();
  const { getDisplayName, fetchProfiles } = useProfiles();
  const { user } = useAuth();

  const [comments, setComments] = useState<ProposalComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // Find the current proposal
  const proposal = proposals.find(p => p.id === proposalId);

  // Fetch comments
  const fetchComments = async () => {
    if (!proposalId) return;

    try {
      const { data, error } = await supabase
        .from('proposal_comments')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);

      // Fetch profiles for comment authors
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        fetchProfiles(userIds);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [proposalId]);

  // Real-time subscription for comments
  useEffect(() => {
    if (!proposalId) return;

    const channel = supabase
      .channel('proposal-comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'proposal_comments',
          filter: `proposal_id=eq.${proposalId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [proposalId]);

  const handleVote = async (voteType: 'yes' | 'no' | 'abstain') => {
    if (!proposal) return;

    try {
      await vote(proposal.id, voteType);
      toast({
        title: "Vote recorded",
        description: `Your ${voteType} vote has been recorded`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to vote",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !proposalId || !user) return;

    try {
      const { error } = await supabase
        .from('proposal_comments')
        .insert({
          proposal_id: proposalId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your suggestion has been posted",
      });
    } catch (error: any) {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!proposal) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Proposal Not Found" />
        <div className="px-4 py-6 max-w-lg mx-auto">
          <TeRentaCard>
            <div className="text-center">
              <p className="text-text-secondary mb-4">This proposal doesn't exist or you don't have access to it.</p>
              <Button variant="mustard" asChild>
                <Link to={`/groups/${groupId}`}>Back to Group</Link>
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
        <h1 className="text-lg font-semibold">Proposal Details</h1>
      </div>
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Proposal Header */}
        <TeRentaCard>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h1 className="text-xl font-bold text-card-foreground">{proposal.title}</h1>
              <Badge 
                variant={
                  proposal.status === 'active' ? 'default' :
                  proposal.status === 'passed' ? 'secondary' :
                  proposal.status === 'failed' ? 'destructive' :
                  'outline'
                }
              >
                {proposal.status}
              </Badge>
            </div>
            
            {proposal.description && (
              <p className="text-text-secondary">{proposal.description}</p>
            )}

            {proposal.event_date && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar size={16} />
                <span>Proposed for: {new Date(proposal.event_date).toLocaleString()}</span>
              </div>
            )}
          </div>
        </TeRentaCard>

        {/* Voting Results */}
        <TeRentaCard>
          <h2 className="font-semibold text-card-foreground mb-4">Voting Results</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-green-600">
                <ThumbsUp size={16} />
                <span>Yes</span>
              </div>
              <span className="font-semibold">{proposal.yes_votes || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-red-600">
                <ThumbsDown size={16} />
                <span>No</span>
              </div>
              <span className="font-semibold">{proposal.no_votes || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-600">
                <Minus size={16} />
                <span>Abstain</span>
              </div>
              <span className="font-semibold">{proposal.abstain_votes || 0}</span>
            </div>
          </div>

          {/* Voting Buttons */}
          {proposal.status === 'active' && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <Button
                  variant={proposal.user_vote === 'yes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVote('yes')}
                  className="flex-1"
                >
                  <ThumbsUp size={14} className="mr-1" />
                  Yes
                </Button>
                <Button
                  variant={proposal.user_vote === 'no' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => handleVote('no')}
                  className="flex-1"
                >
                  <ThumbsDown size={14} className="mr-1" />
                  No
                </Button>
                <Button
                  variant={proposal.user_vote === 'abstain' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => handleVote('abstain')}
                  className="flex-1"
                >
                  <Minus size={14} className="mr-1" />
                  Abstain
                </Button>
              </div>

              {proposal.user_vote && (
                <div className="text-xs text-center text-text-secondary bg-background/50 py-2 rounded">
                  You voted: {proposal.user_vote} • Click any button to change your vote
                </div>
              )}
            </div>
          )}
        </TeRentaCard>

        {/* Comments Section */}
        <TeRentaCard>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={18} />
            <h2 className="font-semibold text-card-foreground">Suggestions & Comments</h2>
          </div>

          {/* Add Comment */}
          <div className="space-y-3 mb-4">
            <Textarea
              placeholder="Add a suggestion or comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleAddComment} 
                disabled={!newComment.trim()}
                size="sm"
              >
                <Send size={14} className="mr-1" />
                Post Comment
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="border-l-2 border-border pl-4 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{getDisplayName(comment.user_id)}</span>
                  <span className="text-xs text-text-secondary">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">{comment.content}</p>
              </div>
            ))}
            
            {comments.length === 0 && !loading && (
              <div className="text-center py-4">
                <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-text-secondary text-sm">No comments yet. Be the first to add a suggestion!</p>
              </div>
            )}
          </div>
        </TeRentaCard>
      </div>

      <BottomNavigation />
    </div>
  );
}