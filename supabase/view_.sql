CREATE OR REPLACE VIEW view_employee_contracts_relationship AS
WITH required_courses AS (
  SELECT
    po.po_id,
    pc.course_id
  FROM po
  JOIN position_courses pc ON po.job_position_id = pc.job_position_id
),

employee_courses_count AS (
  SELECT
    employee_id,
    course_id
  FROM employee_course_records
),

employee_required_courses AS (
  SELECT
    ec.employee_id,
    rc.course_id
  FROM employee_contracts ec
  JOIN required_courses rc ON ec.po_id = rc.po_id
),

employee_missing_courses AS (
  SELECT
    erc.employee_id,
    erc.course_id
  FROM employee_required_courses erc
  LEFT JOIN employee_courses_count ecc
    ON erc.employee_id = ecc.employee_id AND erc.course_id = ecc.course_id
  WHERE ecc.course_id IS NULL
),

employee_course_completion AS (
  SELECT
    ec.employee_id,
    CASE WHEN COUNT(emc.course_id) = 0 THEN 'ครบ' ELSE 'ยังไม่ครบ' END AS course_completion_status
  FROM employee_contracts ec
  LEFT JOIN employee_missing_courses emc ON ec.employee_id = emc.employee_id
  GROUP BY ec.employee_id
)

SELECT
  ec.employee_id,
  ec.employee_code,
  p.company_id,
  c.company_name,
  e.personal_id,
  e.prefix_th,
  e.first_name_th,
  e.last_name_th,
  e.prefix_en,
  e.first_name_en,
  e.last_name_en,
  e.birth_date,
  EXTRACT(YEAR FROM age(e.birth_date)) AS age,
  ec.start_date,
  json_build_object(
    'years', EXTRACT(YEAR FROM age(current_date, ec.start_date)),
    'months', EXTRACT(MONTH FROM age(current_date, ec.start_date)),
    'days', EXTRACT(DAY FROM age(current_date, ec.start_date))
  ) AS work_years,
  po.po_number,
  jp.job_position_name,
  est.status_code,
  COALESCE(ecc.course_completion_status, 'ยังไม่ครบ') AS course_completion_status
FROM employee_contracts ec
LEFT JOIN po p ON ec.po_id = p.po_id
LEFT JOIN companies c ON p.company_id = c.company_id
LEFT JOIN employees e ON ec.employee_id = e.employee_id
LEFT JOIN po ON ec.po_id = po.po_id
LEFT JOIN job_positions jp ON po.job_position_id = jp.job_position_id
LEFT JOIN employee_status_types est ON ec.status_id = est.status_id
LEFT JOIN employee_course_completion ecc ON ec.employee_id = ecc.employee_id;
