const express = require('express');
const app = express();
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
app.use(express.static('public')); 
const cors = require('cors');
app.use(cors());

// Configurazione del database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


db.connect((err) => {
  if (err) {
    console.error('Errore di connessione: ' + err.stack);
    return;
  }
  console.log('Connesso al database MySQL con ID ' + db.threadId);
});

app.use(express.json());

// Endpoint per registrare un nuovo utente
app.post('/users', async (req, res) => {
  const { name, password, display_name } = req.body;

  if (!name || !password || !display_name) {
    return res.status(400).send('Tutti i campi (name, password, display_name) sono obbligatori.');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (name, password, display_name) VALUES (?, ?, ?)';
    db.query(query, [name, hashedPassword, display_name], (err, result) => {
      if (err) {
        console.error('Errore durante l\'inserimento: ', err);
        return res.status(500).send('Errore durante la registrazione dell\'utente.');
      }
      const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { id: result.insertId, name: name, display_name: display_name },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
res.status(201).json({ token });

    });

  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    res.status(500).send('Errore durante la registrazione dell\'utente.');
  }
});

// Endpoint per il login dell'utente
app.post('/users/login', async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).send('Nome e password sono obbligatori.');
  }

  const query = 'SELECT * FROM users WHERE name = ?';
  db.query(query, [name], async (err, results) => {
    if (err) {
      console.error('Errore durante la ricerca dell\'utente:', err);
      return res.status(500).send('Errore durante la ricerca dell\'utente.');
    }

    const user = results[0];
    if (!user) {
      return res.status(400).send('Utente non trovato.');
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        // GENERA IL TOKEN
        const token = jwt.sign(
          { id: user.id, name: user.name, display_name: user.display_name },
          process.env.JWT_SECRET,
          { expiresIn: '1h' } // validità token
        );

        // INVIA IL TOKEN AL CLIENT
        res.json({ message: `Login effettuato!`, token });
      } else {
        res.status(401).send('Password errata.');
      }
    } catch (error) {
      console.error('Errore durante la verifica della password:', error);
      res.status(500).send('Errore durante la verifica della password.');
    }
  });
});


// Avvio del server
app.listen(3000, () => {
  console.log('Server in esecuzione sulla porta 3000');
});
