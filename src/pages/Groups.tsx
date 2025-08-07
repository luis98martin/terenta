import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Users, Hash, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const groups = [
  { 
    id: 1, 
    name: "Weekend Squad", 
    members: 6, 
    code: "WSQ123",
    lastActivity: "2h ago", 
    unread: 3,
    color: "bg-accent/10",
    textColor: "text-accent"
  },
  { 
    id: 2, 
    name: "Work Friends", 
    members: 4, 
    code: "WRK456",
    lastActivity: "1d ago", 
    unread: 0,
    color: "bg-primary/10",
    textColor: "text-primary"
  },
  { 
    id: 3, 
    name: "Family Fun", 
    members: 8, 
    code: "FAM789",
    lastActivity: "3d ago", 
    unread: 1,
    color: "bg-destructive/10",
    textColor: "text-destructive"
  },
];

export default function Groups() {
  const [joinCode, setJoinCode] = useState("");
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleJoinGroup = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement join group functionality
    console.log("Joining group with code:", joinCode);
    setJoinCode("");
    setShowJoinForm(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Groups" showSearch />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="mustard" 
            className="h-14 flex-col"
            onClick={() => setShowJoinForm(!showJoinForm)}
          >
            <Hash size={20} className="mb-1" />
            Join Group
          </Button>
          
          <Button 
            variant="mustard-outline" 
            className="h-14 flex-col"
            asChild
          >
            <Link to="/groups/create">
              <Plus size={20} className="mb-1" />
              Create Group
            </Link>
          </Button>
        </div>

        {/* Join Group Form */}
        {showJoinForm && (
          <TeRentaCard className="animate-slide-up">
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <h3 className="font-semibold text-card-foreground mb-2">
                  Join with Code
                </h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter group code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="flex-1 h-12 rounded-xl"
                  />
                  <Button type="submit" variant="mustard" size="icon">
                    <Plus size={20} />
                  </Button>
                </div>
              </div>
            </form>
          </TeRentaCard>
        )}

        {/* My Groups */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">My Groups</h3>
          
          {groups.map((group, index) => (
            <TeRentaCard 
              key={group.id} 
              variant="interactive"
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${group.color} rounded-full flex items-center justify-center`}>
                    <Users className={group.textColor} size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-card-foreground">
                      {group.name}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {group.members} members • {group.lastActivity}
                    </p>
                    <p className="text-xs text-text-secondary font-mono">
                      Code: {group.code}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {group.unread > 0 && (
                    <div className="bg-accent text-accent-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                      {group.unread}
                    </div>
                  )}
                </div>
              </div>
            </TeRentaCard>
          ))}
        </div>

        {/* Empty State or Load More */}
        {groups.length === 0 && (
          <TeRentaCard className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
            <h3 className="font-medium text-card-foreground mb-2">
              No groups yet
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Create your first group or join one with a code
            </p>
            <Button variant="mustard" size="sm">
              Get Started
            </Button>
          </TeRentaCard>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}