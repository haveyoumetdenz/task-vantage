-- Check which RLS policies already exist
-- Run this in Supabase SQL Editor to see current policies

-- Check for tasks policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('tasks', 'projects', 'task_assignees', 'subtasks', 'meetings')
AND cmd = 'INSERT'
ORDER BY tablename, policyname;

