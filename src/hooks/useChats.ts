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
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data?.map(message => ({
        ...message,
        message_type: message.message_type as 'text' | 'image' | 'file',
        user_name: 'User' // TODO: Implement user name lookup
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  const sendMessage = async (content: string, messageType: 'text' | 'image' | 'file' = 'text', fileUrl?: string) => {
    if (!user || !chatId) throw new Error('User not authenticated or chat not selected');

    const { error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        user_id: user.id,
        content,
        message_type: messageType,
        file_url: fileUrl
      });

    if (error) throw error;

    await fetchMessages();
  };

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages
  };
}