import pool from "../db/db-connection.js";

export const createJob = async (
  companyName,
  role,
  location,
  description,
  amount,
  timeScale,
  dateApplied,
  stage,
  cv,
  accepted,
  rejected,
  url,
  candidateId // Link the current user
) => {
  const result = await pool.query(
    "INSERT INTO jobs (companyName, role, location, description, amount, timeScale, dateApplied, stage, cv, accepted, rejected, url, candidateId) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
    [
      companyName,
      role,
      location,
      description,
      amount,
      timeScale,
      dateApplied,
      stage,
      cv,
      accepted,
      rejected,
      url,
      candidateId,
    ]
  );
  return result.rows[0];
};

export const getJobById = async (id) => {
  const result = await pool.query("SELECT * FROM jobs where id = $1", [id]);
  return result.rows[0];
};

export const getUserSpecificJobs = async (id) => {
  const result = await pool.query("SELECT * FROM jobs where candidateId = $1", [
    id,
  ]);
  return result.rows;
};
