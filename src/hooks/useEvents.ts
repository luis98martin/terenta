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
  group_image_url?: string;
}

export function useEvents(groupId?: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEvents = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          groups(name, image_url),
          event_attendees(status, user_id)
        `)
        .order('start_date', { ascending: true });

      if (groupId) {
        // Fetch events for specific group
        query = query.eq('group_id', groupId);
      } else {
        // Fetch events from all user's groups for calendar view
        const { data: userGroups } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id);

        if (userGroups && userGroups.length > 0) {
          const groupIds = userGroups.map(g => g.group_id);
          query = query.in('group_id', groupIds);
        } else {
          // User has no groups, return empty events
          setEvents([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      const formattedEvents = data?.map(event => ({
        ...event,
        group_name: event.groups?.name,
        attendance_status: (event.event_attendees?.find(a => a.user_id === user.id)?.status || 'pending') as 'attending' | 'not_attending' | 'pending',
        attendee_count: event.event_attendees?.filter(a => a.status === 'attending').length || 0,
        group_image_url: event.groups?.image_url
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
  }, [user, groupId]);

  // Realtime updates for events and attendance
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`events-realtime-${groupId || 'all'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          fetchEvents();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_attendees' },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, groupId]);

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
      }, {
        onConflict: 'event_id,user_id'
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