import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { randomUUID } from 'crypto';
// import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const app = express();

// Allow your frontend to access the backend
app.use(cors({
  origin: [
    "https://contact-manager-frontend-phi.vercel.app",
    "https://contact-manager-frontend-git-main-paulrdaniel1-beeps-projects.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

// REMOVE Clerk auth for now — frontend is not sending tokens yet
// app.use("/contacts", ClerkExpressRequireAuth());

// GET all contacts
app.get('/contacts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contacts ORDER BY family_name, first_name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// CREATE a contact
app.post('/contacts', async (req, res) => {
  const { first_name, family_name, email, phone } = req.body;
  const id = randomUUID();

  try {
    const result = await pool.query(
      'INSERT INTO contacts (id, first_name, family_name, email, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, first_name, family_name, email, phone]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// UPDATE a contact
app.put('/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, family_name, email, phone } = req.body;

  try {
    const result = await pool.query(
      'UPDATE contacts SET first_name=$1, family_name=$2, email=$3, phone=$4 WHERE id=$5 RETURNING *',
      [first_name, family_name, email, phone, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// DELETE a contact
app.delete('/contacts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM contacts WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// GET user stats
app.get('/user-stats', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, first_name, last_name, login_count, last_login FROM user_stats'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Render uses PORT env var
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
