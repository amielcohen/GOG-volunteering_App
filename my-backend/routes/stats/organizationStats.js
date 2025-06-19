const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const OrganizationMonthlyStats = require('../../models/OrganizationMonthlyStats');
const Volunteering = require('../../models/Volunteering');
const CityOrganization = require('../../models/CityOrganization');
const User = require('../../models/Users');
const { calculateRewardCoins } = require('../../../utils/rewardUtils');

router.get('/organization/:organizationId', async (req, res) => {
  const { organizationId } = req.params;
  const { city, month, year } = req.query;

  if (!organizationId || !city || !month || !year) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  const now = new Date();
  const isCurrentMonth =
    now.getMonth() + 1 === monthNum && now.getFullYear() === yearNum;

  try {
    if (!isCurrentMonth) {
      const filter = {
        organizationId: new mongoose.Types.ObjectId(organizationId),
        city: new mongoose.Types.ObjectId(city),
        month: monthNum,
        year: yearNum,
      };

      console.log('🔍 פילטר לחיפוש:', filter);

      const stats = await OrganizationMonthlyStats.findOne(filter);

      if (!stats) {
        console.warn('❌ לא נמצאו נתונים במסד בהתאם לפילטר');
        return res.status(404).json({ message: 'No stats found' });
      }

      return res.json(stats);
    } else {
      const startOfMonth = new Date(yearNum, monthNum - 1, 1);
      const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59);

      const volunteerings = await Volunteering.find({
        organizationId,
        isClosed: true,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const cityOrg = await CityOrganization.findOne({
        organizationId,
        city,
      });

      if (!cityOrg) {
        return res.status(404).json({ message: 'CityOrganization not found' });
      }

      let totalCoins = 0;
      let totalMinutes = 0;
      let totalVolunteers = 0;
      let uniqueVolunteersSet = new Set();
      let timestamps = [];
      let relevantVolunteerings = 0;

      for (const vol of volunteerings) {
        const reward = calculateRewardCoins(vol, cityOrg);
        let hasVolunteerFromCity = false;

        for (const reg of vol.registeredVolunteers || []) {
          if (reg.attended) {
            const user = await User.findById(reg.userId);
            if (user?.city?.toString() === city.toString()) {
              totalCoins += reward;
              totalMinutes += vol.durationMinutes;
              totalVolunteers++;
              uniqueVolunteersSet.add(String(reg.userId));
              timestamps.push(vol.date);
              hasVolunteerFromCity = true;
            }
          }
        }

        if (hasVolunteerFromCity) relevantVolunteerings++;
      }

      const response = {
        organizationId,
        city,
        month: monthNum,
        year: yearNum,
        totalCoins,
        totalVolunteerings: volunteerings.length,
        relevantVolunteerings,
        totalVolunteers,
        uniqueVolunteers: uniqueVolunteersSet.size,
        totalMinutes,
        volunteeringTimestamps: timestamps,
      };

      return res.json(response);
    }
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
