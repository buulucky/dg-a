CREATE OR REPLACE VIEW view_employees_missing_courses AS
WITH active_contracts AS (
  SELECT 
    ec.employee_id,
    ec.employee_code,
    ec.po_id,
    ec.status_id,
    po.job_position_id,
    po.company_id,
    ec.start_date,
    ec.end_date
  FROM employee_contracts ec
  JOIN po ON ec.po_id = po.po_id
  WHERE ec.status_id = 1 -- ปรับตามจริง ถ้า status 1 = “กำลังทำงาน”
),
required_courses AS (
  SELECT 
    ac.employee_id,
    ac.employee_code,
    ac.po_id,
    ac.company_id,
    ac.job_position_id,
    pc.course_id,
    ac.start_date,
    ac.end_date
  FROM active_contracts ac
  JOIN position_courses pc ON ac.job_position_id = pc.job_position_id
),
course_validity AS (
  SELECT 
    ecr.employee_id,
    ecr.course_id,
    ecr.date_completed,
    tc.validity_period_days,
    ecr.date_completed + (tc.validity_period_days * interval '1 day') AS valid_until
  FROM employee_course_records ecr
  JOIN training_courses tc ON ecr.course_id = tc.course_id
),
still_valid_courses AS (
  SELECT *
  FROM course_validity
  WHERE valid_until >= CURRENT_DATE
),
missing_courses AS (
  SELECT 
    rc.employee_id,
    rc.employee_code,
    rc.po_id,
    rc.company_id,
    rc.job_position_id,
    rc.course_id
  FROM required_courses rc
  LEFT JOIN still_valid_courses svc 
    ON rc.employee_id = svc.employee_id AND rc.course_id = svc.course_id
  WHERE svc.course_id IS NULL
)
SELECT 
  mc.po_id,
  po.po_number,
  mc.company_id,
  c.company_name,
  mc.employee_id,
  mc.employee_code,
  e.first_name_th,
  e.last_name_th,
  jp.job_position_name,
  tc.course_name
FROM missing_courses mc
JOIN employees e ON mc.employee_id = e.employee_id
JOIN po ON mc.po_id = po.po_id
JOIN job_positions jp ON mc.job_position_id = jp.job_position_id
JOIN training_courses tc ON mc.course_id = tc.course_id
JOIN companies c ON mc.company_id = c.company_id
ORDER BY c.company_name, po.po_number, mc.employee_id, tc.course_name;
