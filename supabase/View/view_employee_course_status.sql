CREATE VIEW view_employee_course_statuses AS
WITH latest_training AS (
  SELECT DISTINCT ON (employee_id, course_id)
    employee_id,
    course_id,
    date_completed
  FROM employee_course_records
  ORDER BY employee_id, course_id, date_completed DESC
)
SELECT
  e.employee_id,
  tc.course_id,
  tc.course_name,
  lt.date_completed,
  tc.validity_period_days,
  lt.date_completed + (tc.validity_period_days || ' days')::interval AS expiry_date,
  CASE
    WHEN lt.date_completed IS NULL THEN 'ยังไม่อบรม'
    WHEN (lt.date_completed + (tc.validity_period_days || ' days')::interval) < now() THEN 'หมดอายุแล้ว'
    WHEN (lt.date_completed + (tc.validity_period_days || ' days')::interval) < now() + interval '30 days' THEN 'ใกล้หมดอายุ'
    ELSE 'ปกติ'
  END AS status
FROM employees e
JOIN employee_contracts ec ON e.employee_id = ec.employee_id
JOIN po ON ec.po_id = po.po_id
JOIN position_courses pc ON pc.job_position_id = po.job_position_id
JOIN training_courses tc ON tc.course_id = pc.course_id
LEFT JOIN latest_training lt ON lt.employee_id = e.employee_id AND lt.course_id = tc.course_id
JOIN employee_status_types est ON est.status_id = ec.status_id
WHERE est.status_id = '1';