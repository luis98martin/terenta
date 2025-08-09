import { useState, useEffect, useRef } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useMessages } from "@/hooks/useChats";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { messages, loading, sendMessage } = useMessages(chatId || '');
  const { toast } = useToast();
  const { t } = useLanguage();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error: any) {
      toast({
        title: t('chat.failedToSend'),
        description: error.message || t('chat.somethingWrong'),
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-white px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to="/chat">
            <ArrowLeft size={20} className="text-white" />
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">{t('chat.title')}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-4 pb-24 max-w-lg mx-auto w-full space-y-3 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-text-secondary">{t('chat.loadingMessages')}</p>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div key={message.id} className="flex justify-start">
              <TeRentaCard className="max-w-xs">
                <div className="space-y-1">
                  <p className="text-xs text-text-secondary font-medium">
                    {message.user_name}
                  </p>
                  <p className="text-card-foreground">{message.content}</p>
                  <p className="text-xs text-text-secondary">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </TeRentaCard>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-text-secondary">{t('chat.noMessagesYet')}</p>
            <p className="text-sm text-text-secondary mt-2">
              {t('chat.startConversation')}
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border/30 p-4">
        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('chat.typeMessage')}
              className="flex-1"
              disabled={sending}
            />
            <Button 
              type="submit" 
              variant="mustard" 
              size="icon"
              disabled={!newMessage.trim() || sending}
            >
              <Send size={18} />
            </Button>
          </form>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}