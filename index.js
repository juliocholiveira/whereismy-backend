const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const PORT = process.env.PORT || 5000;

const { Pool } = require("pg");

const pool =
  process.env.NODE_ENV === "development"
    ? new Pool({
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      })
    : new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      });

express()
  .use(cors())
  .use(express.json())
  .post("/location", async (req, res) => {
    try {
      const { user, latitude, longitude } = req.body;

      const date = new Date();

      const client = await pool.connect();
      const result = await client.query(
        `
        INSERT INTO public.users_locations
        ("user", latitude, longitude, "date")
        VALUES('${user}', ${latitude}, ${longitude}, $1);
      `,
        [date]
      );
      res.json({ status: "OK" });
      client.release();
    } catch (err) {
      res.send("Error " + err);
    }
  })
  .get("/location/:user", async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query(
        "select * from users_locations ul where id = (select max(id) from users_locations ul2);"
      );
      const results = { results: result ? result.rows : null };
      res.json(results);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
