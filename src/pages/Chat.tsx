import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { MessageCircle, Users } from "lucide-react";

const chats = [
  {
    id: 1,
    name: "Weekend Squad",
    lastMessage: "Who's up for the movie tonight?",
    timestamp: "2 min ago",
    unread: 3,
    members: 6,
    avatar: "bg-accent/10 text-accent"
  },
  {
    id: 2,
    name: "Work Friends",
    lastMessage: "Sarah: Let's do lunch tomorrow!",
    timestamp: "1h ago",
    unread: 0,
    members: 4,
    avatar: "bg-primary/10 text-primary"
  },
  {
    id: 3,
    name: "Family Fun",
    lastMessage: "Mom: Sunday dinner at 6pm?",
    timestamp: "3h ago",
    unread: 1,
    members: 8,
    avatar: "bg-destructive/10 text-destructive"
  },
];

export default function Chat() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Chats" showSearch />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {chats.map((chat, index) => (
          <TeRentaCard 
            key={chat.id} 
            variant="interactive"
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${chat.avatar} rounded-full flex items-center justify-center relative`}>
                <MessageCircle size={20} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-surface rounded-full flex items-center justify-center">
                  <Users size={10} className="text-text-secondary" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-card-foreground truncate">
                    {chat.name}
                  </h4>
                  <span className="text-xs text-text-secondary">
                    {chat.timestamp}
                  </span>
                </div>
                
                <p className="text-sm text-text-secondary truncate">
                  {chat.lastMessage}
                </p>
                
                <p className="text-xs text-text-secondary mt-1">
                  {chat.members} members
                </p>
              </div>
              
              {chat.unread > 0 && (
                <div className="bg-accent text-accent-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium ml-2">
                  {chat.unread}
                </div>
              )}
            </div>
          </TeRentaCard>
        ))}

        {/* Empty State */}
        {chats.length === 0 && (
          <TeRentaCard className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
            <h3 className="font-medium text-card-foreground mb-2">
              No chats yet
            </h3>
            <p className="text-sm text-text-secondary">
              Join or create groups to start chatting
            </p>
          </TeRentaCard>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}