import pool from "./db-connection.js";

export default async function createTables() {
  try {
    // 1️⃣ Create ENUM type for TimeScale if not exists
    await pool.query(`
        DO $$ BEGIN
          CREATE TYPE timescale AS ENUM ('Yearly', 'Monthly', 'Forthnightly', 'Weekly', 'Hourly');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

    console.log("✅ Enum 'TimeScale' created (if not exists)");

    // 2️⃣ Create ENUM type for Job Stage if not exists
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE job_stage AS ENUM ('Applied', 'Phone Screen', 'Test/Challenge', 'Pending', 'Interview', 'Offer', 'Hired', 'Rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log("✅ Enum 'job_stage' created (if not exists)");

    // 3️⃣ Create Users Table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(100) UNIQUE NOT NULL,
          username VARCHAR(100) UNIQUE NOT NULL,
          firstName VARCHAR(100) NOT NULL,
          lastName VARCHAR(100),
          password VARCHAR(400) NOT NULL,
          image VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NULL
        );
      `);

    console.log("✅ Users table created (if not exists)");

    // 4️⃣ Create Jobs Table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS jobs (
          id SERIAL PRIMARY KEY,
          companyName VARCHAR(100) NOT NULL,
          role VARCHAR(100) NOT NULL,
          location VARCHAR(200),
          description TEXT NOT NULL,
          amount VARCHAR(50),
          timeScale timescale DEFAULT 'Yearly',
          currency VARCHAR(50),
          dateApplied TIMESTAMP NOT NULL DEFAULT NOW(),
          stage job_stage DEFAULT 'Applied',
          cv VARCHAR(255),
          accepted BOOLEAN DEFAULT FALSE,
          rejected BOOLEAN DEFAULT FALSE,
          url VARCHAR(255),
          slug VARCHAR(400),
          candidateId INT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NULL,
          CONSTRAINT fk_candidate FOREIGN KEY (candidateId) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

    console.log("✅ Jobs table created (if not exists)");

    // 5️⃣ Update existing data to have a default stage
    // I'm doing this because I initially created the table
    // before changing the stage colums to an Enum
    await pool.query(`
      ALTER TABLE jobs ALTER COLUMN stage SET DEFAULT 'Applied';
  `);

    await pool.query(`
      UPDATE jobs SET stage = 'Applied' WHERE stage IS NULL;
  `);

    console.log("✅ Existing job records updated with default stage 'Applied'");
  } catch (error) {
    console.error("🚨 Error creating tables: ", error);
  }
}
