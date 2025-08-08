import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Chat {
  id: string;
  name?: string;
  type: 'group' | 'direct';
  group_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  group_name?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  created_at: string;
  user_name?: string;
}

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchChats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          groups(name),
          messages(content, created_at)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedChats = data?.map(chat => ({
        ...chat,
        type: chat.type as 'group' | 'direct',
        group_name: chat.groups?.name,
        last_message: chat.messages?.[0]?.content,
        last_message_at: chat.messages?.[0]?.created_at,
        unread_count: 0 // TODO: Implement unread count logic
      })) || [];

      setChats(formattedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [user]);

  const createChat = async (chatData: {
    name?: string;
    type: 'group' | 'direct';
    group_id?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('chats')
      .insert({
        ...chatData,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    await fetchChats();
    return data;
  };

  return {
    chats,
    loading,
    createChat,
    refetch: fetchChats
  };
}

export function useMessages(chatId: string) {
  const PAGE_SIZE = 30;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const formatMessages = (data: any[] | null) => (
    data?.map((message) => ({
      ...message,
      message_type: message.message_type as 'text' | 'image' | 'file',
      user_name: 'User',
    })) || []
  );

  const fetchMessages = async () => {
    if (!chatId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      const latest = formatMessages(data);
      // reverse to show oldest at top within the page and newest at bottom
      setMessages([...latest].reverse());
      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!chatId || !hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    try {
      const oldest = messages[0]?.created_at;
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .lt('created_at', oldest)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      const older = formatMessages(data);
      setMessages([...older.reverse(), ...messages]);
      if (!data || data.length < PAGE_SIZE) setHasMore(false);
    } catch (error) {
      console.error('Error loading older messages:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  const sendMessage = async (
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    fileUrl?: string
  ) => {
    if (!user || !chatId) throw new Error('User not authenticated or chat not selected');

    const { error } = await supabase.from('messages').insert({
      chat_id: chatId,
      user_id: user.id,
      content,
      message_type: messageType,
      file_url: fileUrl,
    });

    if (error) throw error;

    await fetchMessages();
  };

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    sendMessage,
    refetch: fetchMessages,
  };
}