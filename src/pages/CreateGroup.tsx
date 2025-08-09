import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TeRentaCard } from "@/components/TeRentaCard";
import { ArrowLeft, Users, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useGroups } from "@/hooks/useGroups";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CreateGroup() {
  const navigate = useNavigate();
  const { createGroup } = useGroups();
  const { toast } = useToast();
  const { t } = useLanguage();
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
        title: t('createGroup.groupNameRequired'),
        description: t('createGroup.enterGroupName'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const group = await createGroup({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        image_url: undefined
      });

      // Upload image if selected
      if (formData.photo) {
        const path = `${group.id}/cover-${Date.now()}-${formData.photo.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from('group-images')
          .upload(path, formData.photo, { upsert: true, contentType: formData.photo.type, cacheControl: '3600' });
        if (uploadError) {
          toast({
            title: t('createGroup.imageUploadFailed'),
            description: uploadError.message,
            variant: "destructive",
          });
        } else {
          const { data: pub } = supabase.storage.from('group-images').getPublicUrl(path);
          const { error: updateError } = await supabase
            .from('groups')
            .update({ image_url: pub.publicUrl })
            .eq('id', group.id);
          if (updateError) {
            toast({
              title: t('createGroup.failedToSetImage'),
              description: updateError.message,
              variant: "destructive",
            });
          }
        }
      }

      toast({
        title: t('createGroup.groupCreated'),
        description: t('createGroup.groupCreatedDesc').replace('{name}', group.name),
      });

      navigate('/groups');
    } catch (error: any) {
      toast({
        title: t('createGroup.failedToCreate'),
        description: error.message || t('chat.somethingWrong'),
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
            {t('createGroup.title')}
          </h1>
        </div>

        {/* Form Card */}
        <TeRentaCard className="animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Avatar */}
            <div className="text-center">
              <input
                id="group-photo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.files?.[0] || null }))}
              />
              <div
                className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3 cursor-pointer active:bg-accent/20"
                onClick={() => document.getElementById('group-photo-input')?.click()}
              >
                <Upload className="text-accent" size={24} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-accent"
                onClick={() => document.getElementById('group-photo-input')?.click()}
              >
                {formData.photo ? t('createGroup.changePhoto') : t('createGroup.addPhoto')}
              </Button>
              {formData.photo && (
                <p className="text-xs text-text-secondary mt-2">{formData.photo.name}</p>
              )}
            </div>

            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground font-medium">
                {t('createGroup.groupName')} *
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                <Input
                  id="name"
                  type="text"
                  placeholder={t('createGroup.groupNamePlaceholder')}
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
                {t('createGroup.description')}
              </Label>
              <Textarea
                id="description"
                placeholder={t('createGroup.descriptionPlaceholder')}
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
              {loading ? t('createGroup.creating') : t('createGroup.create')}
            </Button>
          </form>
        </TeRentaCard>

        {/* Tips Card */}
        <TeRentaCard variant="highlighted">
          <h3 className="font-semibold text-card-foreground mb-2">
            {t('createGroup.quickTips')}
          </h3>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• {t('createGroup.tip1')}</li>
            <li>• {t('createGroup.tip2')}</li>
            <li>• {t('createGroup.tip3')}</li>
          </ul>
        </TeRentaCard>
      </div>
    </div>
  );
}