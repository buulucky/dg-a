CREATE TABLE function_position_companies (
  function_id BIGINT,
  job_position_id BIGINT,
  company_id BIGINT,
  PRIMARY KEY (function_id, job_position_id, company_id),
  FOREIGN KEY (function_id, job_position_id)
    REFERENCES function_positions(function_id, job_position_id)
    ON DELETE CASCADE,
  FOREIGN KEY (company_id)
    REFERENCES companies(company_id)
    ON DELETE CASCADE
);
