-- Debug RLS issue - check policy conditions and auth context
-- Run this in Supabase SQL Editor

-- 1. Check current auth context
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  auth.jwt() as jwt_claims;

-- 2. Check if current user has a profile
SELECT 
  user_id,
  full_name,
  role,
  team_id,
  status
FROM public.profiles 
WHERE user_id = auth.uid();

-- 3. Check the exact policy conditions for tasks
SELECT 
  policyname,
  cmd,
  qual as policy_condition,
  with_check as insert_condition
FROM pg_policies 
WHERE tablename = 'tasks' 
AND cmd = 'INSERT';

-- 4. Check the exact policy conditions for projects  
SELECT 
  policyname,
  cmd,
  qual as policy_condition,
  with_check as insert_condition
FROM pg_policies 
WHERE tablename = 'projects' 
AND cmd = 'INSERT';

