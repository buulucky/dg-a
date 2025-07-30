CREATE OR REPLACE VIEW view_po_relationship AS
SELECT
  po.po_id,
  po.po_number,
  po.company_id,
  po.function_id,
  po.job_position_id,
  po.employee_count,
  po.start_date,
  po.end_date,
  po.created_at,
  po.updated_at,
  c.company_name,
  f.function_code,
  jp.job_position_name,
  po.po_type
FROM po
LEFT JOIN companies c ON po.company_id = c.company_id
LEFT JOIN functions f ON po.function_id = f.function_id
LEFT JOIN job_positions jp ON po.job_position_id = jp.job_position_id;