CREATE OR REPLACE VIEW v_employee_profiles_with_contracts AS
SELECT
  ep.employee_id,
  ep.employee_code,
  ep.company_id,
  e.personal_id,
  e.prefix_th,
  e.first_name_th,
  e.last_name_th,
  e.prefix_en,
  e.first_name_en,
  e.last_name_en,
  ec.start_date,
  po.po_number,
  jp.job_position_name
FROM employee_profiles ep
LEFT JOIN employees e ON ep.employee_id = e.employee_id
LEFT JOIN employee_contracts ec ON ep.employee_id = ec.employee_id
LEFT JOIN po ON ec.po_id = po.po_id
LEFT JOIN job_positions jp ON po.job_position_id = jp.job_position_id;