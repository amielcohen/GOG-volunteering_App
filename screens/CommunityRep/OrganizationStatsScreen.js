// screens/CommunityRep/OrganizationStatsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import config from '../../config';
import { Picker } from '@react-native-picker/picker';
// הערה: I18nManager.forceRTL(true) בדרך כלל צריך להיות מוגדר בקובץ הכניסה הראשי של האפליקציה (כמו App.js)
// ולא כאן בכל קומפוננטה, כדי למנוע בעיות.
// import { I18nManager } from 'react-native';
// I18nManager.forceRTL(true);

import { BarChart } from 'react-native-chart-kit';

const months = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
];

const OrganizationStatsScreen = ({ route }) => {
  const organization = route?.params?.organization;
  const user = route?.params?.user;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [monthItems] = useState(
    // אין צורך ב-setMonthItems אם לא משנים
    months.map((label, index) => ({ label, value: index + 1 }))
  );
  const [yearItems] = useState(
    // אין צורך ב-setYearItems אם לא משנים
    Array.from({ length: 5 }, (_, i) => {
      const y = currentYear - i;
      return { label: y.toString(), value: y };
    })
  );

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchStats = async () => {
    if (!organization?.organizationId || !user?.city?._id) {
      console.warn('⛔ פרמטרים חסרים – לא מבוצעת קריאה');
      return;
    }

    setLoading(true);
    setStats(null);
    setNotFound(false);

    try {
      const response = await fetch(
        `${config.SERVER_URL}/stats/organization/${organization.organizationId}?city=${user.city._id}&month=${selectedMonth}&year=${selectedYear}`
      );

      if (response.status === 404) {
        setNotFound(true);
      } else {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('שגיאה בשליפת נתונים:', err);
      setStats(null); // ודא שסטטיסטיקות מתאפסות במקרה של שגיאה
      setNotFound(true); // הצג "אין נתונים" במקרה של שגיאה בשרת
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organization?.organizationId && user?.city?._id) {
      fetchStats();
    }
  }, [selectedMonth, selectedYear, organization, user]);

  // הגדרת chartConfig כקבוע מחוץ לקומפוננטה
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    barPercentage: 0.8,
    propsForLabels: {
      fontSize: 10,
      // כיווניות RTL לתוויות הגרף - חשוב לוודא שהפונטים תומכים בזה
      writingDirection: 'rtl',
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // הסרת קו המקף לניקוי אסתטי
    },
  };

  // נתוני הגרף: קבוצה 1 - התנדבויות ומשתתפים
  const chartDataGroup1 = stats && {
    labels: ['סה"כ התנדבויות', 'מהעיר', 'נוכחויות', 'מתנדבים שונים'],
    datasets: [
      {
        data: [
          stats.totalVolunteerings || 0,
          stats.relevantVolunteerings || 0, // זהו השדה החדש שביקשתם
          stats.totalVolunteers || 0,
          stats.uniqueVolunteers || 0,
        ],
      },
    ],
  };

  // נתוני הגרף: קבוצה 2 - מטבעות ודקות
  const chartDataGroup2 = stats && {
    labels: ['מטבעות שחולקו', 'סה"כ דקות'],
    datasets: [
      {
        data: [stats.totalCoins || 0, stats.totalMinutes || 0],
      },
    ],
  };

  if (!organization || !user) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.noData}>⚠️ לא נשלחו פרטי עמותה או משתמש</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fbff" />

      <View style={styles.header}>
        <Text style={styles.title}>סטטיסטיקת עמותה</Text>
        <Text style={styles.subtitle}>{organization.name}</Text>
        <Text style={styles.monthYearText}>
          עבור: {months[selectedMonth - 1]} {selectedYear}
        </Text>
      </View>

      <View style={styles.pickerContainer}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>בחר חודש:</Text>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {monthItems.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>בחר שנה:</Text>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {yearItems.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4A90E2"
          style={{ marginTop: 40 }}
        />
      ) : notFound ? (
        <View style={styles.noDataBox}>
          <Text style={styles.noData}>אין נתונים לחודש ולשנה שנבחרו.</Text>
          <Text style={styles.noDataSmall}>נסה תקופה אחרת.</Text>
        </View>
      ) : stats ? (
        <>
          <View style={styles.statsBox}>
            <Text style={styles.sectionTitle}>סיכום נתונים</Text>
            <View style={styles.statRow}>
              <Text style={styles.statItemLabel}>מטבעות שחולקו:</Text>
              <Text style={styles.statItemValue}>{stats.totalCoins || 0}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statItemLabel}>סה"כ התנדבויות:</Text>
              <Text style={styles.statItemValue}>
                {stats.totalVolunteerings || 0}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statItemLabel}>התנדבויות עם משתתפי עיר:</Text>
              <Text style={styles.statItemValue}>
                {stats.relevantVolunteerings || 0}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statItemLabel}>נוכחויות (סה"כ):</Text>
              <Text style={styles.statItemValue}>
                {stats.totalVolunteers || 0}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statItemLabel}>מתנדבים שונים:</Text>
              <Text style={styles.statItemValue}>
                {stats.uniqueVolunteers || 0}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statItemLabel}>סה"כ דקות התנדבות:</Text>
              <Text style={styles.statItemValue}>
                {stats.totalMinutes || 0}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statItemLabel}>ימים פעילים :</Text>
              <Text style={styles.statItemValue}>
                {stats.volunteeringTimestamps?.length || 0}
              </Text>
            </View>
          </View>

          {chartDataGroup1 && (
            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>התנדבויות ומשתתפים</Text>
              <BarChart
                data={chartDataGroup1}
                width={Dimensions.get('window').width - 40}
                height={220}
                yAxisLabel=""
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero={true}
                showValuesOnTopOfBars={true}
              />
            </View>
          )}

          {chartDataGroup2 && (
            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>מטבעות וזמן התנדבות</Text>
              <BarChart
                data={chartDataGroup2}
                width={Dimensions.get('window').width - 40}
                height={220}
                yAxisLabel=""
                chartConfig={chartConfig}
                style={styles.chart}
                fromZero={true}
                showValuesOnTopOfBars={true}
              />
            </View>
          )}
        </>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9fbff', // רקע בהיר
    alignItems: 'center',
  },
  centeredContainer: {
    // לשימוש במקרה של שגיאה גלובלית
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fbff',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#e3f2fd', // צבע רקע עדין לכותרת
    paddingVertical: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50', // כהה יותר
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#34495e',
    marginBottom: 10,
    textAlign: 'center',
  },
  monthYearText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row', // סידור אופקי
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  pickerWrapper: {
    flex: 1, // תופס חצי מהרוחב
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden', // כדי שה-picker לא יגלוש מחוץ לפינות המעוגלות
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    textAlign: 'right', // יישור לימין עבור פריטי הפיקר
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    textAlign: 'right', // יישור לימין
    paddingRight: 10, // ריווח קל
    paddingTop: 8,
  },
  noDataBox: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#ffe0b2', // צהוב-כתום עדין
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffcc80',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  noData: {
    fontSize: 18,
    color: '#e65100', // כתום כהה
    textAlign: 'center',
    fontWeight: 'bold',
  },
  noDataSmall: {
    fontSize: 14,
    color: '#e65100',
    textAlign: 'center',
    marginTop: 5,
  },
  statsBox: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    marginTop: 20, // מרווח מהבוררים
    marginBottom: 20, // מרווח לפני הגרף
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  statRow: {
    flexDirection: 'row-reverse', // סדר מימין לשמאל
    justifyContent: 'space-between', // פריטים בקצוות
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItemLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  statItemValue: {
    fontSize: 17,
    color: '#4A90E2', // כחול בהיר
    fontWeight: 'bold',
  },
  chartContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center', // ממקם את הגרף במרכז
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default OrganizationStatsScreen;
