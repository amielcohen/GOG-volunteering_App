const express = require('express');
const router = express.Router();
const Volunteering = require('../../models/Volunteering');
const User = require('../../models/Users');
const City = require('../../models/City');
const OrganizationMonthlyStats = require('../../models/OrganizationMonthlyStats');

router.get('/', async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: 'Missing month or year' });
  }

  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  const now = new Date();
  const isCurrentMonth =
    now.getMonth() + 1 === monthNum && now.getFullYear() === yearNum;

  try {
    let totalVolunteerings = 0;
    let totalVolunteers = 0;
    let uniqueVolunteersSet = new Set();
    let cityVolunteeringMap = {};
    let cityUserMap = {};

    if (!isCurrentMonth) {
      const stats = await OrganizationMonthlyStats.find({
        month: monthNum,
        year: yearNum,
      });

      for (const entry of stats) {
        totalVolunteerings += entry.totalVolunteerings;
        totalVolunteers += entry.totalVolunteers;
        if (Array.isArray(entry.uniqueVolunteerIds)) {
          entry.uniqueVolunteerIds.forEach((id) => uniqueVolunteersSet.add(id));
        }

        const cityId = entry.city.toString();
        cityVolunteeringMap[cityId] =
          (cityVolunteeringMap[cityId] || 0) + entry.totalVolunteerings;
        cityUserMap[cityId] =
          (cityUserMap[cityId] || 0) + entry.totalVolunteers;
      }
    } else {
      const start = new Date(yearNum, monthNum - 1, 1);
      const end = new Date(yearNum, monthNum, 0, 23, 59, 59);

      const volunteerings = await Volunteering.find({
        isClosed: true,
        date: { $gte: start, $lte: end },
      });

      for (const vol of volunteerings) {
        totalVolunteerings++;

        for (const reg of vol.registeredVolunteers || []) {
          if (reg.attended) {
            const user = await User.findById(reg.userId);
            if (user?.city) {
              totalVolunteers++;
              uniqueVolunteersSet.add(user._id.toString());

              const cityId = user.city.toString();
              cityVolunteeringMap[cityId] =
                (cityVolunteeringMap[cityId] || 0) + 1;
              cityUserMap[cityId] = (cityUserMap[cityId] || 0) + 1;
            }
          }
        }
      }

      // אם מדובר בחודש נוכחי – נחשב את כמות המשתמשים בעיר לפי aggregation
      const cityUserCounts = await User.aggregate([
        { $match: { role: 'user' } },
        {
          $group: {
            _id: '$city',
            count: { $sum: 1 },
          },
        },
      ]);

      for (const entry of cityUserCounts) {
        const cityId = entry._id?.toString();
        if (cityId) {
          cityUserMap[cityId] = entry.count;
        }
      }
    }

    // מביאים את כל הערים מראש כדי למפות שמות
    const allCities = await City.find({});
    const getCityName = (id) => {
      return allCities.find((c) => c._id.toString() === id)?.name || 'לא ידוע';
    };

    const topCitiesByVolunteerings = Object.entries(cityVolunteeringMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([cityId, count]) => ({
        cityId,
        name: getCityName(cityId),
        totalVolunteerings: count,
      }));

    const topCitiesByUsers = Object.entries(cityUserMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([cityId, count]) => ({
        cityId,
        name: getCityName(cityId),
        totalUsers: count,
      }));

    return res.json({
      month: monthNum,
      year: yearNum,
      totalVolunteerings,
      totalVolunteers,
      uniqueVolunteers: uniqueVolunteersSet.size,
      topCitiesByVolunteerings,
      topCitiesByUsers,
    });
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
