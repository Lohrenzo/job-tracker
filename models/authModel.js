import pool from "../db/db-connection.js";

// Function to check if a user exists by email or username
export const userExistsUsername = async (username) => {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  // return result.rows.length > 0; // Returns true if a user exists, false otherwise
  return result.rows; // Returns the users found
};

export const userExistsEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows.length > 0; // Returns true if a user exists, false otherwise
};

export const createUser = async (
  username,
  email,
  firstName,
  lastName,
  image,
  password
) => {
  const result = await pool.query(
    "INSERT INTO users (username, email, firstName, lastName, image, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [username, email, firstName, lastName, image, password]
  );
  return result.rows[0];
};

export const getUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users where id = $1", [id]);
  return result.rows[0];
};

export const updateUserById = async (
  id,
  username,
  email,
  firstName,
  lastName,
  image
) => {
  const result = await pool.query(
    "UPDATE users SET username=$1, email=$2, firstName=$3, lastName=$4, image=$5 WHERE id=$6 RETURNING *",
    [username, email, firstName, lastName, image, id]
  );
  return result.rows[0];
};

export const updatePasswordById = async (id, password) => {
  const result = await pool.query(
    "UPDATE users SET password=$1 WHERE id=$2 RETURNING *",
    [password, id]
  );
  return result.rows[0];
};

export const deleteUserById = async (id) => {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};
