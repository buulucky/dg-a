-- Function สำหรับดึงข้อมูลปฏิทินหมดอายุคอร์ส
CREATE OR REPLACE FUNCTION get_course_expiry_calendar(selected_course_id INTEGER)
RETURNS TABLE (
  course_expiry_date DATE,
  employee_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (ecr.date_completed + INTERVAL '1 day' * tc.validity_period_days)::DATE AS course_expiry_date,
    COUNT(*) AS employee_count
  FROM employee_course_records ecr
  JOIN training_courses tc ON ecr.course_id = tc.course_id
  JOIN employees e ON ecr.employee_id = e.employee_id
  JOIN employee_contracts ec ON e.employee_id = ec.employee_id
  WHERE
    ecr.date_completed IS NOT NULL
    AND ecr.course_id = selected_course_id
    AND ec.status_id = 1
    AND (ec.end_date IS NULL OR ec.end_date >= CURRENT_DATE)
  GROUP BY course_expiry_date
  ORDER BY course_expiry_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_course_expiry_calendar(INTEGER) TO authenticated;
