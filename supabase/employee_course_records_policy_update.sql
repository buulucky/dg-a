-- Update employee_course_records policies to allow both admin and user roles to insert records

-- Drop existing insert policy
DROP POLICY IF EXISTS "Allow insert for admin only" ON employee_course_records;

-- Create new insert policy allowing both admin and user roles
CREATE POLICY "Allow insert for admin and user"
ON employee_course_records
FOR insert
WITH CHECK (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE id = auth.uid() AND role IN ('admin', 'user')
));

-- Drop existing update policy  
DROP POLICY IF EXISTS "Allow update for admin only" ON employee_course_records;

-- Create new update policy allowing both admin and user roles
CREATE POLICY "Allow update for admin and user"
ON employee_course_records  
FOR update
USING (EXISTS (
  SELECT 1 FROM user_profiles
  WHERE id = auth.uid() AND role IN ('admin', 'user')
));
