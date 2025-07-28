CREATE OR REPLACE VIEW view_employee_contracts_relationship AS
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
  -- คำนวณอายุงานเป็น json: { years, months, days }
  json_build_object(
    'years', EXTRACT(YEAR FROM age(current_date, ec.start_date)),
    'months', EXTRACT(MONTH FROM age(current_date, ec.start_date)),
    'days', EXTRACT(DAY FROM age(current_date, ec.start_date))
  ) AS work_years,
  po.po_number,
  jp.job_position_name,
  est.status_code
FROM employee_contracts ec
LEFT JOIN po p ON ec.po_id = p.po_id
LEFT JOIN companies c ON p.company_id = c.company_id
LEFT JOIN employees e ON ec.employee_id = e.employee_id
LEFT JOIN po ON ec.po_id = po.po_id
LEFT JOIN job_positions jp ON po.job_position_id = jp.job_position_id
LEFT JOIN employee_status_types est ON ec.status_id = est.status_id;