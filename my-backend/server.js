const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// חיבור ל-MongoDB
mongoose.connect('mongodb+srv://amiel551999:h8LXXowGC9lKmO7d@users.5ce21.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// הגדרת מסלול לדוגמה
app.post('/users', async (req, res) => {
  const { name, password } = req.body;
  // כאן ניתן להוסיף לוגיקה לשמירה או לאימות משתמשים במסד הנתונים
  res.send(`User ${name} added!`);
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
