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

// אם יש לך ראוטים נוספים, למשל ליצירת משתמש
// app.use('/users', require('./routes/users'));

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
