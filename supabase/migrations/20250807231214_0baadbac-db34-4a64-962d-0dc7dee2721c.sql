-- Create proposal comments table
CREATE TABLE public.proposal_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on proposal comments
ALTER TABLE public.proposal_comments ENABLE ROW LEVEL SECURITY;

-- Users can view comments on accessible proposals
CREATE POLICY "Users can view comments on accessible proposals" 
ON public.proposal_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM proposals p 
    WHERE p.id = proposal_comments.proposal_id 
    AND is_group_member(auth.uid(), p.group_id)
  )
);

-- Users can create comments on accessible proposals
CREATE POLICY "Users can create comments on accessible proposals" 
ON public.proposal_comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 
    FROM proposals p 
    WHERE p.id = proposal_comments.proposal_id 
    AND is_group_member(auth.uid(), p.group_id)
  )
);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" 
ON public.proposal_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_proposal_comments_updated_at
  BEFORE UPDATE ON public.proposal_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable real-time for proposal comments
ALTER TABLE proposal_comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE proposal_comments;