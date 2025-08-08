import { Button } from "@/components/ui/button";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Users, Calendar, MessageCircle, Vote } from "lucide-react";
import { Link } from "react-router-dom";
import TypewriterText from "@/components/TypewriterText";
const teRentaIcon = "/lovable-uploads/a878b72e-05fa-459d-a514-06cf3eca6f6c.png";

const features = [
  {
    icon: Users,
    title: "Create Groups",
    description: "Easily invite friends with simple codes"
  },
  {
    icon: Vote,
    title: "Make Proposals",
    description: "Suggest dates, activities, and times"
  },
  {
    icon: MessageCircle,
    title: "Chat & Vote",
    description: "Discuss and vote on the best options"
  },
  {
    icon: Calendar,
    title: "Plan Together",
    description: "Turn decisions into confirmed events"
  }
];

export default function Welcome() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="mb-8">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <img
                src={teRentaIcon}
                alt="Te Renta hand icon"
                className="w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-lg"
              />
              <div className="flex flex-col items-start text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 text-[hsl(var(--brand-red,0_71%_38%))] leading-tight" aria-level={1}>
                  Te Renta
                </h1>
                <TypewriterText
                  words={["Comida", "Cine", "Golf", "Copas", "Viaje", "Fiesta", "Padel", "Cerves", "Cena"]}
                  className="text-2xl md:text-3xl text-[hsl(var(--typewriter,0_0%_0%))]"
                />
              </div>
            </div>
          </div>
          
          <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
            The easiest way to organize plans with friends. Create proposals, vote together, and turn decisions into memories.
          </p>
          
          <div className="space-y-3">
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full animate-fade-in"
              asChild
            >
              <Link to="/auth/register">Get Started</Link>
            </Button>
            
            <Button 
              variant="mustard-outline" 
              size="lg" 
              className="w-full"
              asChild
            >
              <Link to="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 pb-8">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
            How it works
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
          Join thousands planning better together
        </p>
      </div>
    </div>
  );
}