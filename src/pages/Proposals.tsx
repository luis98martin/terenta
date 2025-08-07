import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Minus, Plus, Users, Clock } from "lucide-react";
import { useProposals } from "@/hooks/useProposals";
import { useGroups } from "@/hooks/useGroups";
import { useToast } from "@/hooks/use-toast";

export default function Proposals() {
  const { proposals, loading, createProposal, vote } = useProposals();
  const { groups } = useGroups();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    group_id: '',
    expires_at: ''
  });

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.group_id) {
      toast({
        title: "Missing required fields",
        description: "Please enter a title and select a group",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      await createProposal({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        group_id: formData.group_id,
        expires_at: formData.expires_at || undefined,
      });

      toast({
        title: "Proposal created!",
        description: `"${formData.title}" is now open for voting`,
      });

      setFormData({
        title: '',
        description: '',
        group_id: '',
        expires_at: ''
      });
      setShowCreateForm(false);
    } catch (error: any) {
      toast({
        title: "Failed to create proposal",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (proposalId: string, voteType: 'yes' | 'no' | 'abstain') => {
    try {
      await vote(proposalId, voteType);
      toast({
        title: "Vote recorded",
        description: `Your ${voteType} vote has been recorded`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to vote",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const getVotePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Proposals" />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Create Proposal Button */}
        <Button 
          variant="mustard" 
          className="w-full h-14"
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={groups.length === 0}
        >
          <Plus size={20} className="mr-2" />
          Create Proposal
        </Button>

        {groups.length === 0 && (
          <TeRentaCard variant="highlighted">
            <p className="text-sm text-text-secondary text-center">
              Join a group to create and vote on proposals
            </p>
          </TeRentaCard>
        )}

        {/* Create Proposal Form */}
        {showCreateForm && (
          <TeRentaCard className="animate-slide-up">
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <h3 className="font-semibold text-card-foreground mb-4">Create New Proposal</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Proposal Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Should we go to the beach this weekend?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide more details about your proposal..."
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group_id">Group *</Label>
                <select
                  id="group_id"
                  value={formData.group_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, group_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                >
                  <option value="">Select a group...</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">Voting Deadline (Optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="mustard"
                  disabled={creating}
                  className="flex-1"
                >
                  {creating ? 'Creating...' : 'Create Proposal'}
                </Button>
              </div>
            </form>
          </TeRentaCard>
        )}

        {/* Proposals List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-text-secondary">Loading proposals...</p>
            </div>
          ) : proposals.length > 0 ? (
            proposals.map((proposal, index) => (
              <TeRentaCard 
                key={proposal.id} 
                variant="interactive"
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground mb-1">
                        {proposal.title}
                      </h3>
                      {proposal.description && (
                        <p className="text-sm text-text-secondary mb-2">
                          {proposal.description}
                        </p>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      proposal.status === 'active' ? 'bg-green-100 text-green-800' :
                      proposal.status === 'passed' ? 'bg-blue-100 text-blue-800' :
                      proposal.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {proposal.status}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>{proposal.group_name}</span>
                    </div>
                    
                    {proposal.expires_at && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>Expires: {new Date(proposal.expires_at).toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="text-xs">
                      Created: {new Date(proposal.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Voting Results */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-card-foreground">
                      Voting Results ({proposal.total_votes || 0} votes)
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-green-600">
                          <ThumbsUp size={12} />
                          Yes: {proposal.yes_votes || 0}
                        </span>
                        <span>{getVotePercentage(proposal.yes_votes || 0, proposal.total_votes || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all" 
                          style={{ width: `${getVotePercentage(proposal.yes_votes || 0, proposal.total_votes || 0)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-red-600">
                          <ThumbsDown size={12} />
                          No: {proposal.no_votes || 0}
                        </span>
                        <span>{getVotePercentage(proposal.no_votes || 0, proposal.total_votes || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all" 
                          style={{ width: `${getVotePercentage(proposal.no_votes || 0, proposal.total_votes || 0)}%` }}
                        ></div>
                      </div>
                      
                      {(proposal.abstain_votes || 0) > 0 && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-gray-600">
                              <Minus size={12} />
                              Abstain: {proposal.abstain_votes || 0}
                            </span>
                            <span>{getVotePercentage(proposal.abstain_votes || 0, proposal.total_votes || 0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gray-500 h-2 rounded-full transition-all" 
                              style={{ width: `${getVotePercentage(proposal.abstain_votes || 0, proposal.total_votes || 0)}%` }}
                            ></div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Voting Buttons */}
                  {proposal.status === 'active' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant={proposal.user_vote === 'yes' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleVote(proposal.id, 'yes')}
                        className="flex-1"
                      >
                        <ThumbsUp size={14} className="mr-1" />
                        Yes
                      </Button>
                      <Button
                        variant={proposal.user_vote === 'no' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleVote(proposal.id, 'no')}
                        className="flex-1"
                      >
                        <ThumbsDown size={14} className="mr-1" />
                        No
                      </Button>
                      <Button
                        variant={proposal.user_vote === 'abstain' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => handleVote(proposal.id, 'abstain')}
                        className="flex-1"
                      >
                        <Minus size={14} className="mr-1" />
                        Abstain
                      </Button>
                    </div>
                  )}
                  
                  {proposal.user_vote && (
                    <div className="text-xs text-center text-text-secondary bg-background/50 py-2 rounded">
                      You voted: {proposal.user_vote}
                    </div>
                  )}
                </div>
              </TeRentaCard>
            ))
          ) : (
            <div className="text-center py-12">
              <ThumbsUp className="w-16 h-16 mx-auto text-text-secondary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No proposals yet</h3>
              <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                Create your first proposal or join a group to start voting on decisions!
              </p>
              {groups.length > 0 && (
                <Button 
                  variant="mustard" 
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Proposal
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}