import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, MapPin, Users, Clock } from "lucide-react";
import { useProposals } from "@/hooks/useProposals";
import { useState } from "react";

export default function Calendar() {
  const { proposals, loading } = useProposals();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Build proposal-based calendar data
  const proposalsWithDate = proposals.filter(p => p.event_date);
  const eventsForSelectedDate = selectedDate 
    ? proposalsWithDate.filter(p => {
        const d = new Date(p.event_date!);
        return d.toDateString() === (selectedDate as Date).toDateString();
      })
    : proposalsWithDate;

  // Get dates that have proposals for calendar highlighting
  const eventDates = proposalsWithDate.map(p => new Date(p.event_date!));


  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Calendar" />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Calendar Component */}
        <TeRentaCard>
          <div className="p-2">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
              modifiers={{
                hasEvent: eventDates
              }}
              modifiersStyles={{
                hasEvent: { 
                  backgroundColor: 'hsl(var(--primary))', 
                  color: 'hsl(var(--primary-foreground))',
                  borderRadius: '50%'
                }
              }}
            />
          </div>
        </TeRentaCard>

        {/* Events List for Selected Date */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {selectedDate ? `Events for ${selectedDate.toLocaleDateString()}` : 'All Events'}
            </h2>
            <p className="text-sm text-text-secondary">{eventsForSelectedDate.length} events</p>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-text-secondary">Loading events...</p>
            </div>
          ) : eventsForSelectedDate.length > 0 ? (
            eventsForSelectedDate.map((proposal, index) => (
              <TeRentaCard 
                key={proposal.id} 
                variant="interactive"
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="space-y-3">
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
                  </div>
                  
                  <div className="space-y-2 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>
                        {proposal.event_date ? new Date(proposal.event_date).toLocaleString() : ''}
                      </span>
                    </div>
                    
                    {proposal.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{proposal.location}</span>
                      </div>
                    )}
                    
                    {proposal.group_name && (
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>{proposal.group_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </TeRentaCard>
            ))
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 mx-auto text-text-secondary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {selectedDate ? 'No events on this date' : 'No events scheduled'}
              </h3>
              <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                {selectedDate ? 'Try selecting a different date or check upcoming events.' : 'Events appear here when they are created from accepted proposals.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}