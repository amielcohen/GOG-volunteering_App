const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const OrganizationMonthlyStats = require('../../models/OrganizationMonthlyStats');
const Volunteering = require('../../models/Volunteering');
const CityOrganization = require('../../models/CityOrganization');
const User = require('../../models/Users');
const { calculateRewardCoins } = require('../../../utils/rewardUtils');

router.get('/:cityId', async (req, res) => {
  const { cityId } = req.params;
  const { month, year } = req.query;

  if (!cityId || !month || !year) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  const monthNum = parseInt(month);
  const yearNum = parseInt(year);
  const now = new Date();
  const isCurrentMonth =
    now.getMonth() + 1 === monthNum && now.getFullYear() === yearNum;

  try {
    const cityVolunteersCount = await User.countDocuments({ city: cityId });

    let totalCoins = 0;
    let totalVolunteerings = 0;
    let totalVolunteers = 0;
    let uniqueVolunteersSet = new Set();
    let totalMinutes = 0;
    let timestamps = [];
    let organizationVolunteerMap = {};
    let organizationCoinMap = {};
    let topVolunteeringsByParticipants = [];
    let topVolunteeringsByCoins = [];

    if (!isCurrentMonth) {
      const stats = await OrganizationMonthlyStats.find({
        city: new mongoose.Types.ObjectId(cityId),
        month: monthNum,
        year: yearNum,
      });

      if (!stats || stats.length === 0) {
        return res
          .status(404)
          .json({ message: 'No data found for this month/year' });
      }

      for (const entry of stats) {
        totalCoins += entry.totalCoins;
        totalVolunteerings += entry.totalVolunteerings;
        totalVolunteers += entry.totalVolunteers;
        totalMinutes += entry.totalMinutes;
        timestamps.push(...entry.volunteeringTimestamps);

        const orgId = entry.organizationId.toString();
        organizationVolunteerMap[orgId] =
          (organizationVolunteerMap[orgId] || 0) + entry.totalVolunteers;
        organizationCoinMap[orgId] =
          (organizationCoinMap[orgId] || 0) + entry.totalCoins;

        if (entry.uniqueVolunteers) {
          for (let i = 0; i < entry.uniqueVolunteers; i++) {
            uniqueVolunteersSet.add(orgId + '_u' + i);
          }
        }
      }
    } else {
      const start = new Date(yearNum, monthNum - 1, 1);
      const end = new Date(yearNum, monthNum, 0, 23, 59, 59);

      const volunteerings = await Volunteering.find({
        isClosed: true,
        date: { $gte: start, $lte: end },
      });

      const cityOrgs = await CityOrganization.find({ city: cityId });
      const orgMap = new Map(
        cityOrgs.map((org) => [org.organizationId.toString(), org])
      );

      for (const vol of volunteerings) {
        const cityOrg = orgMap.get(vol.organizationId.toString());
        if (!cityOrg) continue;

        const reward = calculateRewardCoins(vol, cityOrg);
        let hasVolunteerFromCity = false;

        for (const reg of vol.registeredVolunteers || []) {
          if (reg.attended) {
            const user = await User.findById(reg.userId);
            if (user?.city?.toString() === cityId) {
              totalCoins += reward;
              totalMinutes += vol.durationMinutes;
              totalVolunteers++;
              uniqueVolunteersSet.add(String(reg.userId));
              timestamps.push(vol.date);
              hasVolunteerFromCity = true;
            }
          }
        }

        if (hasVolunteerFromCity) {
          const orgId = vol.organizationId.toString();
          organizationVolunteerMap[orgId] =
            (organizationVolunteerMap[orgId] || 0) + 1;
          organizationCoinMap[orgId] =
            (organizationCoinMap[orgId] || 0) + reward;
        }
      }

      topVolunteeringsByParticipants = [...volunteerings]
        .sort(
          (a, b) =>
            (b.registeredVolunteers?.length || 0) -
            (a.registeredVolunteers?.length || 0)
        )
        .slice(0, 10);

      topVolunteeringsByCoins = [...volunteerings]
        .sort((a, b) => (b.coinsDistributed || 0) - (a.coinsDistributed || 0))
        .slice(0, 10);
    }

    // 🔄 שליפת שמות עמותות מה-CityOrganization
    const allOrgIds = new Set([
      ...Object.keys(organizationVolunteerMap),
      ...Object.keys(organizationCoinMap),
    ]);

    const orgDocs = await CityOrganization.find({
      organizationId: { $in: Array.from(allOrgIds) },
      city: cityId,
    }).populate('organizationId', 'name');

    const orgNamesMap = {};
    orgDocs.forEach((doc) => {
      if (doc.organizationId && doc.organizationId.name) {
        orgNamesMap[doc.organizationId._id.toString()] =
          doc.organizationId.name;
      }
    });

    return res.json({
      cityId,
      month: monthNum,
      year: yearNum,
      cityVolunteersCount,
      totalCoins,
      totalVolunteerings,
      totalVolunteers,
      uniqueVolunteers: uniqueVolunteersSet.size,
      totalMinutes,
      activeDays: [
        ...new Set(timestamps.map((d) => new Date(d).toDateString())),
      ].length,
      topOrganizationsByVolunteers: Object.entries(organizationVolunteerMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([organizationId, count]) => ({
          organizationId,
          name: orgNamesMap[organizationId] || 'לא ידוע',
          uniqueVolunteers: count,
        })),
      topOrganizationsByCoins: Object.entries(organizationCoinMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([organizationId, coins]) => ({
          organizationId,
          name: orgNamesMap[organizationId] || 'לא ידוע',
          totalCoins: coins,
        })),
      topVolunteeringsByParticipants,
      topVolunteeringsByCoins,
    });
  } catch (error) {
    console.error('❌ Error fetching city stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
