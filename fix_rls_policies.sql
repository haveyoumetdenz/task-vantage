-- Fix missing INSERT policies for tasks and projects
-- These policies were dropped in later migrations but never recreated

-- Create INSERT policy for tasks
CREATE POLICY "Users can create their own tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create INSERT policy for projects  
CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create INSERT policy for task_assignees
CREATE POLICY "Users can create task assignments" 
ON public.task_assignees 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create INSERT policy for subtasks
CREATE POLICY "Users can create subtasks for tasks they are assigned to"
ON public.subtasks
FOR INSERT
WITH CHECK (
  task_id IN (
    SELECT task_id FROM public.task_assignees WHERE user_id = auth.uid()
  ) AND
  created_by = auth.uid()
);

-- Create INSERT policy for meetings
CREATE POLICY "Users can create their own meetings" 
ON public.meetings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

