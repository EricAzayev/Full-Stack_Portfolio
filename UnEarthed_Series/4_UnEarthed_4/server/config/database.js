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



//Connect to postGres using a connection pool: cache of db connections to reuse connections when needed

// const config = {
//     user: process.env.PGUSER,
//     password: process.env.PGPASSWORD,
//     host: process.env.PGHOST,
//     port: process.env.PGPORT,
//     database: process.env.PGDATABASE,
//     ssl: {
//         rejectUnauthorized: false
//     }
// }
// export const pool = new pg.Pool(config)

//other ways to set up a connection:
// const connectionString = process.env.DATABASE_URL; // e.g., postgres://user:pass@host:port/db

// export const pool = new pg.Pool({
//   connectionString,
//   ssl: { rejectUnauthorized: false }
// });

