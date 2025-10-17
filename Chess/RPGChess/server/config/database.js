import pg from 'pg'; //postgress must be installed


const config = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT), // <-- important
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false
  }
};

export const pool = new pg.Pool(config);

pool.on("error", (err) => {
  console.error("PG Pool Error:", err);
});