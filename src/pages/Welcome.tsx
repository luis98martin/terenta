import { Button } from "@/components/ui/button";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Users, Calendar, MessageCircle, Vote } from "lucide-react";
import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Welcome() {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Users,
      title: t('welcome.createGroups'),
      description: t('welcome.createGroupsDesc')
    },
    {
      icon: Vote,
      title: t('welcome.makeProposals'),
      description: t('welcome.makeProposalsDesc')
    },
    {
      icon: MessageCircle,
      title: t('welcome.chatVote'),
      description: t('welcome.chatVoteDesc')
    },
    {
      icon: Calendar,
      title: t('welcome.planTogether'),
      description: t('welcome.planTogetherDesc')
    }
  ];
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="mb-8">
            <Hero />
          </div>
          
          <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
            {t('welcome.tagline')}
          </p>
          
          <div className="space-y-3">
            <Button 
              variant="brand-hero" 
              size="lg" 
              className="w-full animate-fade-in"
              asChild
            >
              <Link to="/auth/register">{t('welcome.getStarted')}</Link>
            </Button>
            
            <Button 
              variant="brand-outline" 
              size="lg" 
              className="w-full"
              asChild
            >
              <Link to="/auth/login">{t('welcome.signIn')}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 pb-8">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
            {t('welcome.howItWorks')}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <TeRentaCard 
                key={feature.title} 
                className={`text-center animate-slide-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <feature.icon className="w-8 h-8 mx-auto mb-3 text-accent" />
                <h3 className="font-semibold text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {feature.description}
                </p>
              </TeRentaCard>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-8 text-center">
        <p className="text-sm text-foreground/60">
          {t('welcome.joinThousands')}
        </p>
      </div>
    </div>
  );
}