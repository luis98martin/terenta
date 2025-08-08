import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThumbsUp, ThumbsDown, Minus, MessageSquare, Calendar, ArrowLeft, Send, Edit2, Upload, X } from "lucide-react";
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

interface Vote {
  id: string;
  user_id: string;
  vote_type: 'yes' | 'no' | 'abstain';
  created_at: string;
}

export default function ProposalDetail() {
  const { groupId, proposalId } = useParams<{ groupId: string; proposalId: string }>();
  const navigate = useNavigate();
  const { proposals, vote, refetch } = useProposals(groupId);
  const { toast } = useToast();
  const { getDisplayName, fetchProfiles } = useProfiles();
  const { user } = useAuth();

  const [comments, setComments] = useState<ProposalComment[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Find the current proposal
  const proposal = proposals.find(p => p.id === proposalId);

  // Fetch comments and votes
  const fetchData = async () => {
    if (!proposalId) return;

    try {
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('proposal_comments')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      setComments(commentsData || []);

      // Fetch individual votes
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .eq('proposal_id', proposalId);

      if (votesError) throw votesError;
      setVotes((votesData || []).map(v => ({
        ...v,
        vote_type: v.vote_type as 'yes' | 'no' | 'abstain'
      })));

      // Fetch profiles for comment authors and voters
      const allUserIds = [
        ...new Set([
          ...(commentsData || []).map(c => c.user_id),
          ...(votesData || []).map(v => v.user_id)
        ])
      ];
      if (allUserIds.length > 0) {
        fetchProfiles(allUserIds);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [proposalId]);

  // Real-time subscription for comments, votes and proposal updates
  useEffect(() => {
    if (!proposalId) return;

    const channel = supabase
      .channel(`proposal-${proposalId}-realtime`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proposal_comments', filter: `proposal_id=eq.${proposalId}` },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `proposal_id=eq.${proposalId}` },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proposals', filter: `id=eq.${proposalId}` },
        () => {
          // Ensure header, counts, etc. update
          refetch();
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [proposalId, refetch]);

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
      fetchData(); // Refresh to show new comment
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

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user?.id}/${proposalId}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('proposal-images')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('proposal-images').getPublicUrl(path);
      setEditedImageUrl(data.publicUrl);
      toast({ title: 'Image uploaded', description: 'Preview updated' });
    } catch (error: any) {
      toast({ title: 'Image upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!proposal) return;
    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          title: editedTitle || proposal.title,
          description: editedDescription || null,
          image_url: editedImageUrl,
        })
        .eq('id', proposal.id);
      if (error) throw error;
      toast({ title: 'Proposal updated', description: 'Changes saved successfully' });
      setIsEditing(false);
      refetch();
    } catch (error: any) {
      toast({ title: 'Failed to save', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteProposal = async () => {
    if (!proposal) return;
    if (!window.confirm('Delete this proposal? This action cannot be undone.')) return;
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', proposal.id);
      if (error) throw error;
      toast({ title: 'Proposal deleted' });
      navigate(`/groups/${groupId}`);
    } catch (error: any) {
      toast({ title: 'Failed to delete proposal', description: error.message, variant: 'destructive' });
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
      <AppHeader title="TeRenta?" />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Proposal Header */}
        <TeRentaCard>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={proposal.image_url} alt={`Proposal image for ${proposal.title}`} />
                  <AvatarFallback>{proposal.title.charAt(0)}</AvatarFallback>
                </Avatar>
                <h1 className="text-xl font-bold text-card-foreground">{proposal.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                {proposal.status !== 'active' && (
                  <Badge 
                    variant={
                      proposal.status === 'passed' ? 'secondary' :
                      proposal.status === 'failed' ? 'destructive' :
                      'outline'
                    }
                  >
                    {proposal.status}
                  </Badge>
                )}
                {proposal.created_by === user?.id && proposal.status === 'active' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setEditedTitle(proposal.title);
                      setEditedDescription(proposal.description || '');
                      setEditedImageUrl(proposal.image_url || null);
                      setIsEditing(true);
                    }}
                  >
                    <Edit2 size={14} className="mr-1" />
                    Edit
                  </Button>
                )}
                {proposal.created_by === user?.id && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteProposal}>
                    Delete
                  </Button>
                )}
              </div>
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

            {proposal.location && (
              <div className="text-sm">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(proposal.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-accent hover:opacity-80"
                >
                  View location in Google Maps
                </a>
              </div>
            )}
          </div>
        </TeRentaCard>

        {/* Voting (Unified) */}
        <TeRentaCard>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-text-secondary">Voting</h2>
              <span className="text-xs text-text-secondary">Total: {proposal.total_votes || 0}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 text-xs">
                <ThumbsUp size={12} />
                <span>{proposal.yes_votes || 0}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-700 dark:text-red-300 text-xs">
                <ThumbsDown size={12} />
                <span>{proposal.no_votes || 0}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-text-secondary text-xs">
                <Minus size={12} />
                <span>{proposal.abstain_votes || 0}</span>
              </div>
            </div>

            {proposal.status === 'active' && (
              <div className="flex gap-2">
                <Button
                  variant={proposal.user_vote === 'yes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVote('yes')}
                  className="flex-1"
                >
                  <ThumbsUp size={14} className="mr-1" /> Yes ({proposal.yes_votes || 0})
                </Button>
                <Button
                  variant={proposal.user_vote === 'no' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => handleVote('no')}
                  className="flex-1"
                >
                  <ThumbsDown size={14} className="mr-1" /> No ({proposal.no_votes || 0})
                </Button>
                <Button
                  variant={proposal.user_vote === 'abstain' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => handleVote('abstain')}
                  className="flex-1"
                >
                  <Minus size={14} className="mr-1" /> Abstain ({proposal.abstain_votes || 0})
                </Button>
              </div>
            )}

            {proposal.user_vote && proposal.status === 'active' && (
              <div className="text-xs text-center text-text-secondary bg-background/50 py-2 rounded">
                You voted: {proposal.user_vote} • Tap to change
              </div>
            )}

            {/* Individual Votes (condensed) */}
            <div className="space-y-2 pt-1">
              {(['yes', 'no', 'abstain'] as const).map((voteType) => {
                const votesByType = votes.filter(v => v.vote_type === voteType);
                if (votesByType.length === 0) return null;

                return (
                  <div key={voteType} className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {voteType === 'yes' && <ThumbsUp size={14} className="text-green-600" />}
                      {voteType === 'no' && <ThumbsDown size={14} className="text-red-600" />}
                      {voteType === 'abstain' && <Minus size={14} className="text-gray-600" />}
                      <span className="capitalize">{voteType} ({votesByType.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1 ml-6">
                      {votesByType.map((vote) => (
                        <div key={vote.id} className="flex items-center gap-2 bg-background/50 rounded px-2 py-1">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={`https://kpwiblindzupzbwavump.supabase.co/storage/v1/object/public/avatars/${vote.user_id}/avatar.jpg`} />
                            <AvatarFallback className="text-xs">
                              {getDisplayName(vote.user_id).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{getDisplayName(vote.user_id)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {votes.length === 0 && (
                <p className="text-sm text-text-secondary">No votes yet.</p>
              )}
            </div>
          </div>
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

      {/* Edit Proposal Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Proposal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Enter proposal title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Enter proposal description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Image</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-2">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={editedImageUrl || undefined} alt="Proposal image preview" />
                  <AvatarFallback>{(editedTitle || proposal?.title || 'P').charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <label className="inline-flex items-center gap-1 px-3 py-2 rounded border border-border cursor-pointer">
                    <Upload size={14} />
                    <span className="text-sm">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </label>
                  {editedImageUrl && (
                    <Button variant="outline" size="sm" onClick={() => setEditedImageUrl(null)}>
                      <X size={14} className="mr-1" /> Remove
                    </Button>
                  )}
                </div>
              </div>
              {uploadingImage && (
                <p className="text-xs text-text-secondary mt-1">Uploading...</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="w-full sm:flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges}
                className="w-full sm:flex-1"
                disabled={uploadingImage}
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