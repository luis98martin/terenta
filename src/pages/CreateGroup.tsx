import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TeRentaCard } from "@/components/TeRentaCard";
import { ArrowLeft, Users, Hash, Upload, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useGroups } from "@/hooks/useGroups";
import { useToast } from "@/hooks/use-toast";

export default function CreateGroup() {
  const navigate = useNavigate();
  const { createGroup } = useGroups();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const group = await createGroup({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        // TODO: Implement image upload
        image_url: undefined
      });

      toast({
        title: "Group created!",
        description: `Your group "${group.name}" has been created successfully`,
      });

      navigate('/groups');
    } catch (error: any) {
      toast({
        title: "Failed to create group",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-6">
      <div className="max-w-sm mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="glass"
            size="icon-sm"
            className="text-foreground"
            asChild
          >
            <Link to="/groups">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          
          <h1 className="text-2xl font-bold text-foreground">
            Create Group
          </h1>
        </div>

        {/* Form Card */}
        <TeRentaCard className="animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Avatar */}
            <div className="text-center">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 cursor-pointer hover:bg-accent/20 transition-colors">
                <Upload className="text-accent" size={24} />
              </div>
              <Button variant="ghost" size="sm" className="text-accent">
                Add Group Photo
              </Button>
            </div>

            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground font-medium">
                Group Name *
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Weekend Squad"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10 h-12 rounded-xl border-2 focus:border-accent"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-card-foreground font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="What's this group about?"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-20 rounded-xl border-2 focus:border-accent resize-none"
              />
            </div>


            {/* Submit */}
            <Button
              type="submit"
              variant="mustard"
              size="lg"
              className="w-full mt-8"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </form>
        </TeRentaCard>

        {/* Tips Card */}
        <TeRentaCard variant="highlighted">
          <h3 className="font-semibold text-card-foreground mb-2">
            💡 Quick Tips
          </h3>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• Choose a memorable name for your group</li>
            <li>• An invite code will be automatically generated</li>
            <li>• You can change settings later in group preferences</li>
          </ul>
        </TeRentaCard>
      </div>
    </div>
  );
}