import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Plus, Users, Calendar, MessageCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const quickStats = [
  { icon: Users, label: "Groups", value: "3", color: "text-accent" },
  { icon: Calendar, label: "Events", value: "12", color: "text-accent" },
  { icon: MessageCircle, label: "Messages", value: "47", color: "text-accent" },
];

const recentGroups = [
  { id: 1, name: "Weekend Squad", members: 6, lastActivity: "2h ago", unread: 3 },
  { id: 2, name: "Work Friends", members: 4, lastActivity: "1d ago", unread: 0 },
  { id: 3, name: "Family Fun", members: 8, lastActivity: "3d ago", unread: 1 },
];

const upcomingEvents = [
  { id: 1, title: "Movie Night", date: "Tonight 8PM", group: "Weekend Squad" },
  { id: 2, title: "Dinner at Mario's", date: "Tomorrow 7PM", group: "Work Friends" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="TeRenta?" />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-foreground/70">
            Ready to plan something amazing?
          </p>
        </div>

        {/* Quick Actions */}
        <TeRentaCard variant="highlighted" className="animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-card-foreground mb-1">
                Quick Start
              </h3>
              <p className="text-sm text-text-secondary">
                Create a new group or proposal
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="mustard" size="icon" asChild>
                <Link to="/groups/create">
                  <Plus size={20} />
                </Link>
              </Button>
            </div>
          </div>
        </TeRentaCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {quickStats.map((stat, index) => (
            <TeRentaCard 
              key={stat.label} 
              className={`text-center animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold text-card-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-text-secondary">
                {stat.label}
              </div>
            </TeRentaCard>
          ))}
        </div>

        {/* Recent Groups */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recent Groups</h3>
            <Button variant="ghost" size="sm" className="text-accent" asChild>
              <Link to="/groups">View all</Link>
            </Button>
          </div>
          
          {recentGroups.map((group, index) => (
            <TeRentaCard 
              key={group.id} 
              variant="interactive" 
              className={`animate-slide-up`}
              style={{ animationDelay: `${(index + 3) * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Users className="text-accent" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      {group.name}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {group.members} members • {group.lastActivity}
                    </p>
                  </div>
                </div>
                {group.unread > 0 && (
                  <div className="bg-accent text-accent-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                    {group.unread}
                  </div>
                )}
              </div>
            </TeRentaCard>
          ))}
        </div>

        {/* Upcoming Events */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Upcoming Events</h3>
          
          {upcomingEvents.map((event, index) => (
            <TeRentaCard 
              key={event.id} 
              variant="interactive"
              className={`animate-slide-up`}
              style={{ animationDelay: `${(index + 6) * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="text-primary" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-card-foreground">
                    {event.title}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {event.date} • {event.group}
                  </p>
                </div>
              </div>
            </TeRentaCard>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}