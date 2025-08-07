import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, MapPin, Users } from "lucide-react";

const today = new Date();
const upcomingEvents = [
  {
    id: 1,
    title: "Movie Night",
    time: "8:00 PM",
    date: "Today",
    location: "Cinema Downtown",
    group: "Weekend Squad",
    attendees: 4,
    status: "confirmed"
  },
  {
    id: 2,
    title: "Dinner at Mario's",
    time: "7:00 PM",
    date: "Tomorrow",
    location: "Mario's Restaurant",
    group: "Work Friends",
    attendees: 3,
    status: "confirmed"
  },
  {
    id: 3,
    title: "Beach Day",
    time: "10:00 AM",
    date: "Saturday",
    location: "Santa Monica Beach",
    group: "Family Fun",
    attendees: 6,
    status: "pending"
  },
];

const proposalsNeedingVote = [
  {
    id: 1,
    title: "Weekend Getaway",
    group: "Weekend Squad",
    options: 3,
    votes: 2,
    deadline: "2 days left"
  },
  {
    id: 2,
    title: "Birthday Party Location",
    group: "Family Fun",
    options: 4,
    votes: 5,
    deadline: "5 days left"
  },
];

export default function Calendar() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Calendar" />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Quick Calendar View */}
        <TeRentaCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-card-foreground">
              {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <Button variant="ghost" size="sm" className="text-accent">
              View Full Calendar
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-text-secondary font-medium">
                {day}
              </div>
            ))}
            
            {/* Simple calendar grid for current month */}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 6; // Adjust for month start
              const isToday = day === today.getDate();
              const hasEvent = [15, 16, 22].includes(day); // Mock event days
              
              return (
                <div 
                  key={i} 
                  className={`p-2 text-center rounded-lg transition-colors ${
                    day > 0 && day <= 31 
                      ? isToday 
                        ? 'bg-accent text-accent-foreground font-bold' 
                        : hasEvent
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-card-foreground hover:bg-muted/50'
                      : 'text-text-secondary/50'
                  }`}
                >
                  {day > 0 && day <= 31 ? day : ''}
                </div>
              );
            })}
          </div>
        </TeRentaCard>

        {/* Upcoming Events */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Upcoming Events</h3>
          
          {upcomingEvents.map((event, index) => (
            <TeRentaCard 
              key={event.id} 
              variant="interactive"
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  event.status === 'confirmed' 
                    ? 'bg-accent/10 text-accent' 
                    : 'bg-muted text-text-secondary'
                }`}>
                  <CalendarIcon size={20} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-card-foreground">
                      {event.title}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      event.status === 'confirmed' 
                        ? 'bg-accent/10 text-accent' 
                        : 'bg-muted text-text-secondary'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>{event.date} at {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>{event.attendees} attending • {event.group}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TeRentaCard>
          ))}
        </div>

        {/* Proposals Needing Vote */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Need Your Vote</h3>
          
          {proposalsNeedingVote.map((proposal, index) => (
            <TeRentaCard 
              key={proposal.id} 
              variant="highlighted"
              className="animate-slide-up"
              style={{ animationDelay: `${(index + 3) * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-card-foreground mb-1">
                    {proposal.title}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {proposal.group} • {proposal.options} options • {proposal.votes} votes
                  </p>
                  <p className="text-xs text-accent mt-1 font-medium">
                    {proposal.deadline}
                  </p>
                </div>
                <Button variant="mustard" size="sm">
                  Vote Now
                </Button>
              </div>
            </TeRentaCard>
          ))}
        </div>

        {/* Empty States */}
        {upcomingEvents.length === 0 && (
          <TeRentaCard className="text-center py-8">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
            <h3 className="font-medium text-card-foreground mb-2">
              No events scheduled
            </h3>
            <p className="text-sm text-text-secondary">
              Create proposals with your groups to start planning
            </p>
          </TeRentaCard>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}