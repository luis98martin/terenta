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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CreateProposal() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { createProposal } = useProposals();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [creating, setCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expires_at: '',
    event_date: '',
    location: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !groupId) {
      toast({
        title: t('createProposal.missingFields'),
        description: t('createProposal.enterTitle'),
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      let imageUrl: string | undefined;

      if (imageFile && user) {
        const path = `${user.id}/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from('proposal-images')
          .upload(path, imageFile, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: pub } = supabase.storage.from('proposal-images').getPublicUrl(path);
        imageUrl = pub.publicUrl;
      }

      await createProposal({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        group_id: groupId,
        expires_at: formData.expires_at || undefined,
        event_date: formData.event_date || undefined,
        image_url: imageUrl,
        location: formData.location.trim() || undefined,
      });

      toast({
        title: t('createProposal.proposalCreated'),
        description: t('createProposal.openForVoting').replace('{title}', formData.title),
      });

      navigate(`/groups/${groupId}`);
    } catch (error: any) {
      toast({
        title: t('createProposal.failedToCreate'),
        description: error.message || t('chat.somethingWrong'),
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title={t('createProposal.title')} showBack />
      
      <div className="px-4 py-6 max-w-lg mx-auto">
        <TeRentaCard>
          <form onSubmit={handleCreateProposal} className="space-y-4">
            <h3 className="font-semibold text-card-foreground mb-4">{t('createProposal.createNew')}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">{t('createProposal.proposalTitle')} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('createProposal.titlePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('createProposal.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('createProposal.descriptionPlaceholder')}
                className="min-h-20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">{t('createProposal.votingDeadline')}</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">{t('createProposal.eventDate')}</Label>
              <Input
                id="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t('createProposal.location')}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder={t('createProposal.locationPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">{t('createProposal.image')}</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/groups/${groupId}`)}
                className="flex-1"
              >
                {t('createProposal.cancel')}
              </Button>
              <Button
                type="submit"
                variant="mustard"
                disabled={creating}
                className="flex-1"
              >
                {creating ? t('createProposal.creating') : t('createProposal.create')}
              </Button>
            </div>
          </form>
        </TeRentaCard>
      </div>

      <BottomNavigation />
    </div>
  );
}