CREATE OR REPLACE VIEW view_employee_contracts_relationship AS
WITH required_courses AS (
  SELECT
    ec.employee_id,
    pc.course_id
  FROM employee_contracts ec
  JOIN po ON ec.po_id = po.po_id
  JOIN position_courses pc ON po.job_position_id = pc.job_position_id
),

course_taken AS (
  SELECT DISTINCT
    employee_id,
    course_id
  FROM employee_course_records
),

course_progress AS (
  SELECT
    rc.employee_id,
    COUNT(DISTINCT rc.course_id) AS total_required,
    COUNT(DISTINCT ct.course_id) AS completed_courses
  FROM required_courses rc
  LEFT JOIN course_taken ct 
    ON rc.employee_id = ct.employee_id AND rc.course_id = ct.course_id
  GROUP BY rc.employee_id
),

course_status_summary AS (
  SELECT
    cp.employee_id,
    CASE 
      WHEN cp.total_required = cp.completed_courses THEN 'All completed'
      ELSE CONCAT(cp.total_required, '/', cp.completed_courses)
    END AS course_progress_summary
  FROM course_progress cp
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
  COALESCE(css.course_progress_summary, '0/0') AS course_progress_summary
FROM employee_contracts ec
LEFT JOIN po p ON ec.po_id = p.po_id
LEFT JOIN companies c ON p.company_id = c.company_id
LEFT JOIN employees e ON ec.employee_id = e.employee_id
LEFT JOIN po ON ec.po_id = po.po_id
LEFT JOIN job_positions jp ON po.job_position_id = jp.job_position_id
LEFT JOIN employee_status_types est ON ec.status_id = est.status_id
LEFT JOIN course_status_summary css ON ec.employee_id = css.employee_id
ORDER BY ec.employee_id;
