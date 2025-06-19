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
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// שימוש בראוטים - לדוגמה, ראוט התחברות
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const shopRoutes = require('./routes/ShopItem');
app.use('/shop', shopRoutes);

const cityShopRoutes = require('./routes/cityShops');
app.use('/shops', cityShopRoutes);

const categoryRoutes = require('./routes/categories');
app.use('/categories', categoryRoutes);

const organizationsRoutes = require('./routes/organization');
app.use('/organizations', organizationsRoutes);

const cityOrganizationsRoutes = require('./routes/cityOrganizations');
app.use('/cityOrganizations', cityOrganizationsRoutes);

const cityRoutes = require('./routes/city');
app.use('/cities', cityRoutes);

const organizationRepsRoutes = require('./routes/organizationReps');
app.use('/organizationReps', organizationRepsRoutes);

const volunteeringsRouter = require('./routes/volunteerings');
app.use('/volunteerings', volunteeringsRouter);

const redeemCodesRoutes = require('./routes/redeemCode');
app.use('/redeem-codes', redeemCodesRoutes);

const businessPartnersRoutes = require('./routes/businessPartners');
app.use('/business-partners', businessPartnersRoutes);

const donationOrganizationsRoutes = require('./routes/donationOrganizations');
app.use('/donation-organizations', donationOrganizationsRoutes);

const userMessagesRoutes = require('./routes/userMessages');
app.use('/user-messages', userMessagesRoutes);

const monthlyStatsRoutes = require('./routes/monthlyStats');
app.use('/monthly-stats', monthlyStatsRoutes);

const monthlyPrizeRoutes = require('./routes/monthlyPrize');
app.use('/monthly-prizes', monthlyPrizeRoutes);

const organizationStatsRoutes = require('./routes/organizationStats');
app.use('/stats', organizationStatsRoutes);

// ראוט בדיקה בסיסי
app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port: ${port}`);
});
