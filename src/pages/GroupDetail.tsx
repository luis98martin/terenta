import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TeRentaCard } from "@/components/TeRentaCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Vote, Calendar, Users, Send, Plus, ThumbsUp, ThumbsDown, Check, X } from "lucide-react";
import { useGroups } from "@/hooks/useGroups";
import { useChats, useMessages } from "@/hooks/useChats";
import { useProposals } from "@/hooks/useProposals";

import { useToast } from "@/hooks/use-toast";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const { groups } = useGroups();
  const { chats, createChat } = useChats();
  const { proposals, createProposal, vote } = useProposals(groupId);
  
  const { toast } = useToast();
  const { getDisplayName, fetchProfiles } = useProfiles();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("chat");
  const [newMessage, setNewMessage] = useState("");
const [chatId, setChatId] = useState<string | null>(null);

// Group proposals by user answer and sort by event date
const proposalsSorted = [...proposals].sort((a, b) => {
  const aTime = new Date(a.event_date || a.created_at).getTime();
  const bTime = new Date(b.event_date || b.created_at).getTime();
  return aTime - bTime;
});
const notAnswered = proposalsSorted.filter(p => !p.user_vote);
const accepted = proposalsSorted.filter(p => p.user_vote === 'yes');
const notAccepted = proposalsSorted.filter(p => p.user_vote === 'no');
  // Find the current group
  const group = groups.find(g => g.id === groupId);

  // Find or create group chat
  useEffect(() => {
    const groupChat = chats.find(c => c.group_id === groupId);
    if (groupChat) {
      setChatId(groupChat.id);
    } else if (group) {
      // Create chat for this group
      createChat({
        name: `${group.name} Chat`,
        type: 'group' as const,
        group_id: groupId!
      }).then((chat) => {
        setChatId(chat.id);
      });
    }
  }, [chats, group, groupId, createChat]);

  const { messages, sendMessage, refetch: refetchMessages } = useMessages(chatId);

  // Fetch profiles for message authors
  useEffect(() => {
    if (messages.length > 0) {
      const userIds = [...new Set(messages.map(m => m.user_id))];
      fetchProfiles(userIds);
    }
  }, [messages, fetchProfiles]);

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        () => {
          // Refetch messages when a new message is inserted
          refetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, refetchMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleVote = async (proposalId: string, voteType: 'yes' | 'no') => {
    try {
      await vote(proposalId, voteType);
      toast({
        title: "Vote recorded",
        description: `Your ${voteType} vote has been recorded`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to vote",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader title="Group Not Found" />
        <div className="px-4 py-6 max-w-lg mx-auto">
          <TeRentaCard>
            <div className="text-center">
              <p className="text-text-secondary mb-4">This group doesn't exist or you don't have access to it.</p>
              <Button variant="mustard" asChild>
                <Link to="/groups">Back to Groups</Link>
              </Button>
            </div>
          </TeRentaCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="TeRenta?" />
      
      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Group Info */}
        <TeRentaCard className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={group.image_url || undefined} alt={`${group.name} image`} />
                <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
              <h2 className="font-semibold text-card-foreground">{group.name}</h2>
              <p className="text-sm text-text-secondary">{group.member_count} members</p>
            </div>
          </div>
          {group.description && (
            <p className="text-sm text-text-secondary mb-3">{group.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="text-xs text-text-secondary">
              Invite Code: <span className="font-mono bg-background/50 px-2 py-1 rounded">{group.invite_code}</span>
            </div>
            {group.user_role === 'admin' && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/groups/${groupId}/manage`}>Manage</Link>
              </Button>
            )}
          </div>
        </TeRentaCard>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle size={16} />
              Chat
            </TabsTrigger>
            <TabsTrigger value="proposals" className="flex items-center gap-2">
              <Vote size={16} />
              Proposals
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar size={16} />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <div className="space-y-3 overflow-y-auto px-2 pb-36">
              {messages.map((message) => {
                // Render system notifications (thin, yellow highlight)
                if (message.message_type === 'text' && message.content.endsWith('has an idea!')) {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <div className="w-full text-center text-xs px-3 py-1 rounded-md border bg-accent/15 text-foreground border-accent/30 inline-flex items-center gap-2 justify-center">
                        <img src="/lovable-uploads/e1c4fbef-fa5f-4a08-a376-2d3404ec4eb1.png" alt="App logo" className="w-4 h-4 rounded-full" />
                        <span className="truncate">{message.content}</span>
                      </div>
                    </div>
                  );
                }

                const isOwnMessage = message.user_id === user?.id;
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                        isOwnMessage 
                          ? 'bg-primary text-primary-foreground rounded-br-md' 
                          : 'bg-surface text-foreground rounded-bl-md border border-border'
                      }`}
                    >
                      <div className="flex flex-col space-y-1">
                        {!isOwnMessage && (
                          <span className="font-medium text-xs opacity-70">
                            {getDisplayName(message.user_id)}
                          </span>
                        )}
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <span className={`text-xs opacity-60 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                          {new Date(message.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>
            <div className="fixed inset-x-0 bottom-24 px-4">
              <div className="max-w-lg mx-auto flex gap-2 rounded-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 shadow-md">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="space-y-4">
            <Button variant="mustard" className="w-full" asChild>
              <Link to={`/groups/${groupId}/proposals/create`}>
                <Plus size={16} className="mr-2" />
                Create Proposal
              </Link>
            </Button>

            {/* Not Answered - shown by default */}
            <div className="space-y-4">
              {notAnswered.length > 0 ? (
                notAnswered.map((proposal) => (
                  <Link key={proposal.id} to={`/groups/${groupId}/proposals/${proposal.id}`} className="block">
                    <TeRentaCard variant="interactive">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 flex items-start gap-3">
                            <Avatar className="w-10 h-10 mt-0.5">
                              <AvatarImage src={proposal.image_url || undefined} alt={`Proposal image for ${proposal.title}`} />
                              <AvatarFallback>{proposal.title.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-card-foreground mb-1">{proposal.title}</h3>
                              <p className="text-xs text-text-secondary">by {getDisplayName(proposal.created_by)}</p>
                              {proposal.description && (
                                <p className="text-sm text-text-secondary mt-1 line-clamp-2">{proposal.description}</p>
                              )}
                            </div>
                          </div>
                          {proposal.status !== 'active' && (
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              proposal.status === 'passed' ? 'bg-blue-100 text-blue-800' :
                              proposal.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {proposal.status}
                            </div>
                          )}
                        </div>


                        {/* Voting Buttons */}
                        {proposal.status === 'active' && (
                          <div className="flex gap-2">
                          <Button
                            variant={proposal.user_vote === 'yes' ? 'default' : 'outline'}
                            size="sm"
                            onClick={(e) => { e.preventDefault(); handleVote(proposal.id, 'yes'); }}
                            className="flex-1"
                          >
                            <ThumbsUp size={14} className="mr-1" />
                            Yes ({proposal.yes_votes || 0})
                          </Button>
                            <Button
                              variant={proposal.user_vote === 'no' ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={(e) => { e.preventDefault(); handleVote(proposal.id, 'no'); }}
                              className="flex-1"
                            >
                              <ThumbsDown size={14} className="mr-1" />
                              No ({proposal.no_votes || 0})
                            </Button>
                          </div>
                        )}

                        {proposal.user_vote && proposal.status === 'active' && (
                          <div className="text-xs text-center text-text-secondary bg-background/50 py-2 rounded">
                            You voted: {proposal.user_vote} • Click any button to change your vote
                          </div>
                        )}
                      </div>
                    </TeRentaCard>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 text-text-secondary text-sm">No pending proposals</div>
              )}
            </div>

            {/* Answered - collapsed by default */}
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="yes">
                <AccordionTrigger>
                  <div className="flex items-center gap-2"><Check size={16} /> Yes ({accepted.length})</div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {accepted.map((proposal) => (
                      <Link key={proposal.id} to={`/groups/${groupId}/proposals/${proposal.id}`} className="block">
                        <TeRentaCard variant="interactive">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 flex items-start gap-3">
                                <Avatar className="w-10 h-10 mt-0.5">
                                  <AvatarImage src={proposal.image_url || undefined} alt={`Proposal image for ${proposal.title}`} />
                                  <AvatarFallback>{proposal.title.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-card-foreground mb-1">{proposal.title}</h3>
                                  <p className="text-xs text-text-secondary">by {getDisplayName(proposal.created_by)}</p>
                                  {proposal.description && (
                                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">{proposal.description}</p>
                                  )}
                                </div>
                              </div>
                              <Check size={16} className="text-green-600" />
                            </div>
                          </div>
                        </TeRentaCard>
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="no">
                <AccordionTrigger>
                  <div className="flex items-center gap-2"><X size={16} /> No ({notAccepted.length})</div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {notAccepted.map((proposal) => (
                      <Link key={proposal.id} to={`/groups/${groupId}/proposals/${proposal.id}`} className="block">
                        <TeRentaCard variant="interactive">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 flex items-start gap-3">
                                <Avatar className="w-10 h-10 mt-0.5">
                                  <AvatarImage src={proposal.image_url || undefined} alt={`Proposal image for ${proposal.title}`} />
                                  <AvatarFallback>{proposal.title.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-card-foreground mb-1">{proposal.title}</h3>
                                  <p className="text-xs text-text-secondary">by {getDisplayName(proposal.created_by)}</p>
                                  {proposal.description && (
                                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">{proposal.description}</p>
                                  )}
                                </div>
                              </div>
                              <X size={16} className="text-red-600" />
                            </div>
                          </div>
                        </TeRentaCard>
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {proposals.length === 0 && (
              <div className="text-center py-8">
                <Vote className="w-12 h-12 mx-auto text-text-secondary mb-2" />
                <p className="text-text-secondary">No proposals yet. Create the first one!</p>
              </div>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            {(() => {
              // Show only original proposals with an event date to avoid duplicates
              const proposalsWithDate = proposals
                .filter(p => p.event_date)
                .sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime());

              if (proposalsWithDate.length === 0) {
                return (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-text-secondary mb-2" />
                    <p className="text-text-secondary">No upcoming proposals scheduled.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {proposalsWithDate.map((p) => (
                    <Link key={`proposal-${p.id}`} to={`/groups/${groupId}/proposals/${p.id}`} className="block">
                      <TeRentaCard variant="interactive">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10 mt-0.5">
                            <AvatarImage src={p.image_url || undefined} alt={`Proposal image for ${p.title}`} />
                            <AvatarFallback>{p.title.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1 w-full">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-card-foreground">{p.title}</h4>
                              {p.user_vote === 'yes' ? (
                                <span className="text-green-600"><Check size={16} /></span>
                              ) : (
                                <span className="text-red-600"><X size={16} /></span>
                              )}
                            </div>
                            <div className="text-sm text-text-secondary">
                              🗓️ {new Date(p.event_date!).toLocaleString()}
                            </div>
                            {p.location && (
                              <div className="text-sm text-text-secondary">📍 {p.location}</div>
                            )}
                            <p className="text-xs text-text-secondary">by {getDisplayName(p.created_by)}</p>
                          </div>
                        </div>
                      </TeRentaCard>
                    </Link>
                  ))}
                </div>
              );
            })()}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
}