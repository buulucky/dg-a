CREATE TABLE function_positions (
  function_id BIGINT,
  job_position_id BIGINT,
  PRIMARY KEY (function_id, job_position_id),
  FOREIGN KEY (function_id) REFERENCES functions(function_id),
  FOREIGN KEY (job_position_id) REFERENCES job_positions(job_position_id)
);
