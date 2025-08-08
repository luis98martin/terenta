import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useGroups } from "@/hooks/useGroups";
import { useEvents } from "@/hooks/useEvents";
import { useChats } from "@/hooks/useChats";
import { format } from "date-fns";

export default function Dashboard() {
  const { groups, loading: groupsLoading } = useGroups();
  const { events, loading: eventsLoading } = useEvents();
  const { chats, loading: chatsLoading } = useChats();

  // Calculate stats from real data
  const groupsCount = groups?.length || 0;
  const eventsCount = events?.length || 0;
  const chatsCount = chats?.length || 0;


  // Get recent groups (limit to 3)
  const recentGroups = groups?.slice(0, 3) || [];

  // Get upcoming events (limit to 2)
  const upcomingEvents = events?.slice(0, 2) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="TeRenta?" />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-foreground/70">
            Ready to plan something amazing?
          </p>
        </div>



        {/* Recent Groups */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Recent Groups</h3>
            <Button variant="ghost" size="sm" className="text-accent" asChild>
              <Link to="/groups">View all</Link>
            </Button>
          </div>
          
          {groupsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : recentGroups.length > 0 ? (
            recentGroups.map((group, index) => (
              <Link key={group.id} to={`/groups/${group.id}`} className="block">
                <TeRentaCard 
                  variant="interactive" 
                  className={`animate-slide-up`}
                  style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={group.image_url || undefined} alt={`${group.name} image`} />
                        <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-card-foreground">
                          {group.name}
                        </h4>
                        <p className="text-sm text-text-secondary">
                          {group.member_count} members • {group.user_role}
                        </p>
                      </div>
                    </div>
                  </div>
                </TeRentaCard>
              </Link>
            ))
          ) : (
            <TeRentaCard className="text-center py-6">
              <Users className="w-8 h-8 mx-auto mb-2 text-text-secondary" />
              <p className="text-sm text-text-secondary mb-3">No groups yet</p>
              <Button variant="mustard" size="sm" asChild>
                <Link to="/groups/create">Create Group</Link>
              </Button>
            </TeRentaCard>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Upcoming Events</h3>
          
          {eventsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <Link key={event.id} to="/calendar" className="block">
                <TeRentaCard 
                  variant="interactive"
                  className={`animate-slide-up`}
                  style={{ animationDelay: `${(index + 6) * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={(event.image_url || event.group_image_url) || undefined} alt={`${event.title} image`} />
                      <AvatarFallback>{(event.title || 'E').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground">
                        {event.title}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {format(new Date(event.start_date), 'MMM d, h:mm a')} • {event.group_name || 'Personal'}
                      </p>
                    </div>
                  </div>
                </TeRentaCard>
              </Link>
            ))
          ) : (
            <TeRentaCard className="text-center py-6">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-text-secondary" />
              <p className="text-sm text-text-secondary mb-3">No upcoming events</p>
              <Button variant="mustard" size="sm" asChild>
                <Link to="/calendar">View Calendar</Link>
              </Button>
            </TeRentaCard>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}