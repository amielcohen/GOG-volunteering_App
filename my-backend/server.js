require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// חיבור ל-MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// שימוש בראוטים - לדוגמה, ראוט התחברות
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// ראוט בדיקה בסיסי
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port: ${port}`);
});
