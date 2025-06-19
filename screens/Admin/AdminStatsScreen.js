import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import config from '../../config';
import axios from 'axios';
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

// רכיב עזר לטקסט סטטיסטיקה
const StatRow = ({ label, value }) => (
  <View style={styles.statRow}>
    <Text style={styles.statItemLabel}>{label}:</Text>
    <Text style={styles.statItemValue}>{value}</Text>
  </View>
);

export default function AdminStatsScreen() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  // הוספת סטייטים למספר משתמשים ועמותות גלובליים
  const [registeredUsers, setRegisteredUsers] = useState(null);
  const [totalOrganizations, setTotalOrganizations] = useState(null);

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
      writingDirection: 'rtl',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
    },
  };

  // פונקציה לבניית נתוני גרף עבור 5 הערים המובילות בהתנדבויות
  const getTopCitiesByVolunteeringsChartData = () => {
    if (
      !stats ||
      !stats.topCitiesByVolunteerings ||
      stats.topCitiesByVolunteerings.length === 0
    )
      return null;
    const labels = stats.topCitiesByVolunteerings.map((c) => c.name);
    const data = stats.topCitiesByVolunteerings.map(
      (c) => c.totalVolunteerings
    );
    return {
      labels: labels.slice(0, 5),
      datasets: [{ data: data.slice(0, 5) }],
    };
  };

  // **חדש**: פונקציה לבניית נתוני גרף עבור 5 הערים המובילות במשתמשים
  const getTopCitiesByUsersChartData = () => {
    if (
      !stats ||
      !stats.topCitiesByUsers ||
      stats.topCitiesByUsers.length === 0
    )
      return null;
    const labels = stats.topCitiesByUsers.map((c) => c.name);
    const data = stats.topCitiesByUsers.map((c) => c.totalUsers);
    return {
      labels: labels.slice(0, 5),
      datasets: [{ data: data.slice(0, 5) }],
    };
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await axios.get(
          `${config.SERVER_URL}/stats/admin?month=${selectedMonth}&year=${selectedYear}`
        );
        setStats(res.data);
      } catch (err) {
        console.warn('שגיאה בשליפת נתונים כלליים:', err);
        setStats(null);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedMonth, selectedYear]);

  // **החזרת הקריאה לנתונים גלובליים**
  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        const res = await axios.get(`${config.SERVER_URL}/auth/count-users`);
        setRegisteredUsers(res.data.count);
      } catch (err) {
        console.error('שגיאה בשליפת מספר משתמשים רשומים:', err);
        setRegisteredUsers(null);
      }
    };
    fetchRegisteredUsers();

    const fetchTotalOrganizations = async () => {
      try {
        const res = await axios.get(
          `${config.SERVER_URL}/organizations/count-global`
        );
        setTotalOrganizations(res.data.count);
      } catch (err) {
        console.error('שגיאה בשליפת מספר עמותות:', err);
        setTotalOrganizations(null);
      }
    };
    fetchTotalOrganizations();
  }, []); // ריצה פעם אחת בטעינת הקומפוננטה

  const years = Array.from(
    { length: 5 },
    (_, i) => currentDate.getFullYear() - i
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fbff" />

      <View style={styles.header}>
        <Text style={styles.title}>סטטיסטיקה מערכתית</Text>
        <Text style={styles.monthYearText}>
          עבור: {months[selectedMonth - 1]} {selectedYear}
        </Text>
      </View>

      {/* מידע גלובלי: מספר משתמשים ועמותות - ממוקם מתחת לכותרת, מעל הבוררים */}
      <View style={styles.registeredUsersBox}>
        {registeredUsers !== null ? (
          <Text style={styles.registeredUsersText}>
            מספר משתמשים רשומים:{' '}
            <Text style={styles.registeredUsersValue}>{registeredUsers}</Text>
          </Text>
        ) : (
          <ActivityIndicator size="small" color="#4A90E2" />
        )}
        {totalOrganizations !== null ? (
          <Text style={styles.registeredUsersText}>
            מספר עמותות רשומות:{' '}
            <Text style={styles.registeredUsersValue}>
              {totalOrganizations}
            </Text>
          </Text>
        ) : (
          <ActivityIndicator size="small" color="#4A90E2" />
        )}
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
            {months.map((m, i) => (
              <Picker.Item key={i} label={m} value={i + 1} />
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
            {years.map((y) => (
              <Picker.Item key={y} label={y.toString()} value={y} />
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
      ) : (
        stats && (
          <>
            {/* סיכום כללי */}
            <View style={styles.statsBox}>
              <Text style={styles.sectionTitle}>סיכום כללי</Text>
              <StatRow
                label={"סה'כ התנדבויות"}
                value={stats.totalVolunteerings || 0}
              />
              <StatRow
                label={"סה'כ נוכחויות"}
                value={stats.totalVolunteers || 0}
              />
              <StatRow
                label={"סה'כ מתנדבים שונים"}
                value={stats.uniqueVolunteers || 0}
              />
            </View>

            {/* 10 הערים עם הכי הרבה התנדבויות + הגרף הרלוונטי */}
            {stats.topCitiesByVolunteerings &&
              stats.topCitiesByVolunteerings.length > 0 && (
                <>
                  <View style={styles.statsBox}>
                    <Text style={styles.sectionTitle}>
                      10 הערים עם הכי הרבה התנדבויות
                    </Text>
                    {stats.topCitiesByVolunteerings.map((c, idx) => (
                      <StatRow
                        key={idx}
                        label={c.name}
                        value={`${c.totalVolunteerings} התנדבויות`}
                      />
                    ))}
                  </View>
                  {getTopCitiesByVolunteeringsChartData() && (
                    <View style={styles.chartContainer}>
                      <Text style={styles.chartTitle}>
                        גרף - ערים מובילות בהתנדבויות
                      </Text>
                      <BarChart
                        data={getTopCitiesByVolunteeringsChartData()}
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
              )}

            {/* 10 הערים עם הכי הרבה משתמשים + הגרף הרלוונטי (חדש!) */}
            {stats.topCitiesByUsers && stats.topCitiesByUsers.length > 0 && (
              <>
                <View style={styles.statsBox}>
                  <Text style={styles.sectionTitle}>
                    10 הערים עם הכי הרבה משתמשים
                  </Text>
                  {stats.topCitiesByUsers.map((c, idx) => (
                    <StatRow
                      key={idx}
                      label={c.name}
                      value={`${c.totalUsers} משתמשים`}
                    />
                  ))}
                </View>
                {getTopCitiesByUsersChartData() && (
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>
                      גרף - ערים מובילות במשתמשים
                    </Text>
                    <BarChart
                      data={getTopCitiesByUsersChartData()}
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
            )}
          </>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9fbff',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 0, // מרווח אפס, כי המידע הנוסף יבוא מיד אחרי התאריך
    backgroundColor: '#e3f2fd',
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
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  monthYearText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 10, // מרווח מהכותרת
  },
  registeredUsersBox: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    marginTop: 20, // מרווח מה-header
    marginBottom: 20, // מרווח לפני הבוררים
    flexDirection: 'row', // כדי שיהיו אחד ליד השני
    justifyContent: 'space-around', // לפזר אותם באופן שווה
    alignItems: 'center',
  },
  registeredUsersText: {
    fontSize: 18,
    color: '#34495e',
    fontWeight: '600',
    textAlign: 'center', // כדי שהטקסט יהיה ממורכז
    flex: 1, // כדי שיתפסו רוחב שווה
  },
  registeredUsersValue: {
    fontSize: 20,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    textAlign: 'right',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    textAlign: 'right',
    paddingRight: 10,
    paddingTop: 8,
  },
  noDataBox: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#ffe0b2',
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
    color: '#e65100',
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
    marginTop: 20,
    marginBottom: 20,
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
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 10,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
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
    color: '#4A90E2',
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
    alignItems: 'center',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
