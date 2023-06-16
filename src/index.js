import './styles.css';
import _ from 'lodash';

fetch(
  'https://api.weatherapi.com/v1/forecast.json?key=a81041fdab664dca902173917231406&q=London&days=7&aqi=no&alerts=no'
)
  .then((res) => res.json())
  .then((data) => {
    const weekData = getWeekData(data);
    console.log(getAllFormattedData(weekData, data));
  });

function getWeekData(data) {
  console.log(data);
  const weekDataArray = data.forecast.forecastday;
  console.log('array', weekDataArray);
  return weekDataArray.map((dayData) => {
    const dayName = getDayName(dayData.date, 'en-US');
    return {
      day_name: dayName,
      icon_url: dayData.day.condition.icon,
      description: dayData.day.condition.text,
      min_temp: dayData.day.mintemp_f,
      max_temp: dayData.day.maxtemp_f,
      avg_temp: (dayData.day.maxtemp_f + dayData.day.mintemp_f) / 2,
      date: dayData.date,
    };
  });
}

function getAllFormattedData(weekData, data) {
  const location = `${data.location.name}, ${data.location.country}`;

  return {
    today_only: {
      temp: data.current.feelslike_f,
      time: data.current.last_updated,
    },
    weekData,
    location,
  };
}

function getDayName(dateStr, locale) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, { weekday: 'short' });
}

function convertTemp(temp, targetUnit = 'Celsius') {
  if (targetUnit === 'Celsius') {
    return (temp - 32) * (5 / 9);
  }
  if (targetUnit === 'Fahrenheit') {
    return temp * (9 / 5) + 32;
  }
}

console.log(getDayName('2023-06-16', 'en-US'));
