import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Plus, MapPin, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import { useGroups } from "@/hooks/useGroups";
import { useToast } from "@/hooks/use-toast";

export default function Calendar() {
  const { events, loading, createEvent, updateAttendance } = useEvents();
  const { groups } = useGroups();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    group_id: ''
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.start_date || !formData.group_id) {
      toast({
        title: "Missing required fields",
        description: "Please enter a title, start date, and select a group",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      await createEvent({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        location: formData.location.trim() || undefined,
        group_id: formData.group_id,
      });

      toast({
        title: "Event created!",
        description: `"${formData.title}" has been scheduled`,
      });

      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        group_id: ''
      });
      setShowCreateForm(false);
    } catch (error: any) {
      toast({
        title: "Failed to create event",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

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
        {/* Create Event Button */}
        {groups.length > 0 ? (
          <Button 
            variant="mustard" 
            className="w-full h-14"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus size={20} className="mr-2" />
            Create Event
          </Button>
        ) : (
          <TeRentaCard variant="highlighted">
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-2">
                You need to join a group to create events
              </p>
              <Button variant="mustard" size="sm" asChild>
                <Link to="/groups">Join a Group</Link>
              </Button>
            </div>
          </TeRentaCard>
        )}

        {/* Create Event Form */}
        {showCreateForm && (
          <TeRentaCard className="animate-slide-up">
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <h3 className="font-semibold text-card-foreground mb-4">Create New Event</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Movie Night"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What's this event about?"
                  className="min-h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Where will this happen?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group_id">Group *</Label>
                <select
                  id="group_id"
                  value={formData.group_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, group_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  required
                >
                  <option value="">Select a group...</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                {groups.length === 0 && (
                  <p className="text-sm text-text-secondary">
                    You need to join a group first to create events
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="mustard"
                  disabled={creating}
                  className="flex-1"
                >
                  {creating ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </form>
          </TeRentaCard>
        )}

        {/* Events List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-text-secondary">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            events.map((event, index) => (
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
                      event.attendance_status === 'attending' ? 'bg-green-100 text-green-800' :
                      event.attendance_status === 'not_attending' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
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
              <h3 className="text-xl font-semibold text-foreground mb-2">No events scheduled</h3>
              <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                Create your first event or join a group to see upcoming activities!
              </p>
              <Button 
                variant="mustard" 
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}