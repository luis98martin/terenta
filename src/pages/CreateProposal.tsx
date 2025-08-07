import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProposals } from "@/hooks/useProposals";
import { useToast } from "@/hooks/use-toast";

export default function CreateProposal() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { createProposal } = useProposals();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expires_at: '',
    event_date: ''
  });

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !groupId) {
      toast({
        title: "Missing required fields",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      await createProposal({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        group_id: groupId,
        expires_at: formData.expires_at || undefined,
        event_date: formData.event_date || undefined,
      });

      toast({
        title: "Proposal created!",
        description: `"${formData.title}" is now open for voting`,
      });

      navigate(`/groups/${groupId}`);
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Create Proposal" />
      
      <div className="px-4 py-6 max-w-lg mx-auto">
        <TeRentaCard>
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
              <Label htmlFor="expires_at">Voting Deadline (Optional)</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date (If proposal becomes an event)</Label>
              <Input
                id="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/groups/${groupId}`)}
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
      </div>

      <BottomNavigation />
    </div>
  );
}