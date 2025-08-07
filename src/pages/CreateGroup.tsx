import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TeRentaCard } from "@/components/TeRentaCard";
import { ArrowLeft, Users, Hash, Upload, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function CreateGroup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    inviteCode: '',
    isPrivate: false
  });

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(prev => ({ ...prev, inviteCode: code }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement group creation with Supabase
    console.log("Creating group:", formData);
    navigate('/groups');
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

            {/* Invite Code */}
            <div className="space-y-2">
              <Label htmlFor="inviteCode" className="text-card-foreground font-medium">
                Invite Code
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                  <Input
                    id="inviteCode"
                    type="text"
                    placeholder="Auto-generated"
                    value={formData.inviteCode}
                    onChange={(e) => handleInputChange('inviteCode', e.target.value)}
                    className="pl-10 h-12 rounded-xl border-2 focus:border-accent font-mono"
                  />
                </div>
                <Button
                  type="button"
                  variant="mustard-outline"
                  size="icon"
                  onClick={generateInviteCode}
                  className="h-12 w-12"
                >
                  <Sparkles size={18} />
                </Button>
              </div>
              <p className="text-sm text-text-secondary">
                Friends can join using this code
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full mt-8"
              disabled={!formData.name.trim()}
            >
              Create Group
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
            <li>• Share the invite code with friends to let them join</li>
            <li>• You can change settings later in group preferences</li>
          </ul>
        </TeRentaCard>
      </div>
    </div>
  );
}