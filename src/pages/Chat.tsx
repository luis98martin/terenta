import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useChats } from "@/hooks/useChats";

export default function Chat() {
  const { chats, loading } = useChats();

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Chats" showSearch />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-text-secondary">Loading chats...</p>
          </div>
        ) : chats.length > 0 ? (
          chats.map((chat, index) => (
            <TeRentaCard 
              key={chat.id} 
              variant="interactive"
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center relative">
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
                      Group chat
                    </span>
                  </div>
                  
                  <p className="text-sm text-text-secondary truncate">
                    No messages yet
                  </p>
                </div>
              </div>
            </TeRentaCard>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 mx-auto text-text-secondary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No chats yet</h3>
            <p className="text-text-secondary mb-6 max-w-sm mx-auto">
              Join or create groups to start chatting with others!
            </p>
            <Button variant="mustard" asChild>
              <Link to="/groups">
                <Users className="w-4 h-4 mr-2" />
                View Groups
              </Link>
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}