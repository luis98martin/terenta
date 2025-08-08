import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, MapPin, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Calendar() {
  const { events, loading, updateAttendance } = useEvents();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Filter events for selected date
  const eventsForSelectedDate = selectedDate 
    ? events.filter(event => {
        const eventDate = new Date(event.start_date);
        return eventDate.toDateString() === selectedDate.toDateString();
      })
    : events;

  // Get dates that have events for calendar highlighting
  const eventDates = events.map(event => new Date(event.start_date));

  const handleAttendanceUpdate = async (eventId: string, status: 'attending' | 'not_attending') => {
    try {
      await updateAttendance(eventId, status);
      toast({
        title: "Attendance updated",
        description: `You are ${status === 'attending' ? 'attending' : 'not attending'} this event`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to update attendance",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

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
            eventsForSelectedDate.map((event, index) => (
              <TeRentaCard 
                key={event.id} 
                variant="interactive"
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground mb-1">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-sm text-text-secondary mb-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.attendance_status === 'attending' ? 'bg-green-500/20 text-green-700 dark:text-green-300' :
                      event.attendance_status === 'not_attending' ? 'bg-red-500/20 text-red-700 dark:text-red-300' :
                      'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300'
                    }`}>
                      {event.attendance_status === 'attending' ? 'Going' :
                       event.attendance_status === 'not_attending' ? 'Not Going' : 'Pending'}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>
                        {new Date(event.start_date).toLocaleString()}
                        {event.end_date && ` - ${new Date(event.end_date).toLocaleString()}`}
                      </span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    {event.group_name && (
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>{event.group_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>{event.attendee_count || 0} attending</span>
                    </div>
                  </div>
                  
                  {/* Attendance Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant={event.attendance_status === 'attending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAttendanceUpdate(event.id, 'attending')}
                      className="flex-1"
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Going
                    </Button>
                    <Button
                      variant={event.attendance_status === 'not_attending' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => handleAttendanceUpdate(event.id, 'not_attending')}
                      className="flex-1"
                    >
                      <XCircle size={14} className="mr-1" />
                      Can't Go
                    </Button>
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