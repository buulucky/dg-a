CREATE OR REPLACE VIEW view_position_required_courses AS
SELECT 
  jp.job_position_name AS position_name,
  STRING_AGG(tc.course_name, ', ' ORDER BY tc.course_name) AS required_courses
FROM position_courses pc
JOIN job_positions jp ON pc.job_position_id = jp.job_position_id
JOIN training_courses tc ON pc.course_id = tc.course_id
GROUP BY jp.job_position_name
ORDER BY jp.job_position_name;