import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  group_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  group_name?: string;
  attendance_status?: 'attending' | 'not_attending' | 'pending';
  attendee_count?: number;
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          groups(name),
          event_attendees(status, user_id)
        `)
        .order('start_date', { ascending: true });

      if (error) throw error;

      const formattedEvents = data?.map(event => ({
        ...event,
        group_name: event.groups?.name,
        attendance_status: (event.event_attendees?.find(a => a.user_id === user.id)?.status || 'pending') as 'attending' | 'not_attending' | 'pending',
        attendee_count: event.event_attendees?.filter(a => a.status === 'attending').length || 0
      })) || [];

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const createEvent = async (eventData: {
    title: string;
    description?: string;
    start_date: string;
    end_date?: string;
    location?: string;
    group_id?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    await fetchEvents();
    return data;
  };

  const updateAttendance = async (eventId: string, status: 'attending' | 'not_attending' | 'pending') => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('event_attendees')
      .upsert({
        event_id: eventId,
        user_id: user.id,
        status
      });

    if (error) throw error;

    await fetchEvents();
  };

  return {
    events,
    loading,
    createEvent,
    updateAttendance,
    refetch: fetchEvents
  };
}