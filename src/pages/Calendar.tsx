import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, MapPin, Users, Clock } from "lucide-react";
import { useProposals } from "@/hooks/useProposals";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Calendar() {
  const { proposals, loading } = useProposals();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Use proposals with a scheduled event date
  const proposalsWithDate = proposals.filter(p => p.event_date);

  // Filter proposals for selected date
  const itemsForSelectedDate = selectedDate
    ? proposalsWithDate.filter(p => new Date(p.event_date!).toDateString() === selectedDate.toDateString())
    : proposalsWithDate;

  // Dates that have proposals for calendar highlighting
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
              {selectedDate ? `Proposals for ${selectedDate.toLocaleDateString()}` : 'All Proposals'}
            </h2>
            <p className="text-sm text-text-secondary">{itemsForSelectedDate.length} items</p>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-text-secondary">Loading...</p>
            </div>
          ) : itemsForSelectedDate.length > 0 ? (
            itemsForSelectedDate.map((proposal, index) => (
              <Link
                key={proposal.id}
                to={`/groups/${proposal.group_id}/proposals/${proposal.id}`}
                className="block"
              >
                <TeRentaCard 
                  variant="interactive"
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="space-y-3">
                    {proposal.image_url && (
                      <div className="overflow-hidden rounded-md">
                        <img
                          src={proposal.image_url}
                          alt={`${proposal.title} image`}
                          loading="lazy"
                          className="w-full h-36 object-cover"
                        />
                      </div>
                    )}
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
                        <span>{new Date(proposal.event_date!).toLocaleString()}</span>
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
              </Link>
            ))
) : (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 mx-auto text-text-secondary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {selectedDate ? 'No proposals on this date' : 'No scheduled proposals'}
              </h3>
              <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                {selectedDate ? 'Try selecting a different date or check upcoming proposals.' : 'Proposals appear here when they are scheduled with a date.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}