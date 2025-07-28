-- ตาราง functions สำหรับเก็บข้อมูลแผนก
CREATE TABLE functions (
  function_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  function_code VARCHAR(100) NOT NULL
);