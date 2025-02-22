import slugify from "slugify";
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
  const slug = slugify(`${companyName} ${role} ${location}`, {
    lower: true,
    strict: true,
    trim: true,
  });

  const result = await pool.query(
    "INSERT INTO jobs (companyName, role, location, description, amount, timeScale, dateApplied, stage, cv, accepted, rejected, url, slug, candidateId) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *",
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
      slug,
      candidateId,
    ]
  );
  return result.rows[0];
};

export const getJobById = async (id) => {
  const result = await pool.query("SELECT * FROM jobs where id = $1", [id]);
  return result.rows[0];
};

export const getJobBySlug = async (slug) => {
  const result = await pool.query("SELECT * FROM jobs where slug = $1", [slug]);
  return result.rows[0];
};

export const getUserSpecificJobs = async (id) => {
  const result = await pool.query("SELECT * FROM jobs where candidateId = $1", [
    id,
  ]);
  return result.rows;
};

export const updateJobById = async (
  id,
  amount,
  timescale,
  dateapplied,
  stage,
  accepted,
  rejected
) => {
  const result = await pool.query(
    "UPDATE jobs SET amount=$1, timescale=$2, stage=$3, accepted=$4, rejected=$5, updated_at=NOW() WHERE id=$6 RETURNING *",
    [amount, timescale, dateapplied, stage, accepted, rejected, id]
  );
  return result.rows[0];
};

export const updateJobBySlug = async (
  slug,
  amount,
  timescale,
  dateapplied,
  stage,
  accepted,
  rejected
) => {
  const result = await pool.query(
    "UPDATE jobs SET amount=$1, timescale=$2, dateapplied=$3, stage=$4, accepted=$5, rejected=$6, updated_at=NOW() WHERE slug=$7 RETURNING *",
    [amount, timescale, dateapplied, stage, accepted, rejected, slug]
  );
  return result.rows[0];
};
