import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  user_id: string;
  display_name?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  birth_date?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(false);

  const fetchProfile = async (userId: string) => {
    if (profiles[userId] || loading) return profiles[userId];

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, username, first_name, last_name, avatar_url, created_at, updated_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfiles(prev => ({ ...prev, [userId]: data }));
        return data;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async (userIds: string[]) => {
    const missingIds = userIds.filter(id => !profiles[id]);
    if (missingIds.length === 0) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, username, first_name, last_name, avatar_url, created_at, updated_at')
        .in('user_id', missingIds);

      if (error) throw error;

      if (data) {
        const profilesMap = data.reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {} as Record<string, Profile>);
        
        setProfiles(prev => ({ ...prev, ...profilesMap }));
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (userId: string) => {
    const profile = profiles[userId];
    if (!profile) {
      // Auto-fetch profile if not already loaded
      fetchProfile(userId);
      return 'Loading...';
    }
    
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile.display_name) {
      return profile.display_name;
    }
    if (profile.username) {
      return profile.username;
    }
    return 'Unknown User';
  };

  return {
    profiles,
    loading,
    fetchProfile,
    fetchProfiles,
    getDisplayName
  };
}