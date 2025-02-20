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

    // 2️⃣ Create Users Table
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

    // 3️⃣ Create Jobs Table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS jobs (
          id SERIAL PRIMARY KEY,
          companyName VARCHAR(100) NOT NULL,
          role VARCHAR(100) NOT NULL,
          location VARCHAR(200),
          description TEXT NOT NULL,
          amount VARCHAR(50),
          timeScale timescale DEFAULT 'Yearly',
          dateApplied TIMESTAMP NOT NULL DEFAULT NOW(),
          stage VARCHAR(100) NOT NULL,
          cv VARCHAR(255),
          accepted BOOLEAN DEFAULT FALSE,
          rejected BOOLEAN DEFAULT FALSE,
          url VARCHAR(255),
          candidateId INT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NULL,
          CONSTRAINT fk_candidate FOREIGN KEY (candidateId) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

    console.log("✅ Jobs table created (if not exists)");
  } catch (error) {
    console.error("🚨 Error creating tables: ", error);
  }
}
