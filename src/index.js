import './styles.css';
import _ from 'lodash';

const formEl = document.getElementById('search-form');
let formattedData;

formEl.addEventListener('submit', (event) => {
  event.preventDefault();
  const inputEl = document.getElementById('search-input');

  fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=a81041fdab664dca902173917231406&q=${inputEl.value}&days=7&aqi=no&alerts=no`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        throw new Error('No matching location found!');
      }
      const weekData = getWeekData(data);
      formattedData = getAllFormattedData(weekData, data);
      renderData(formattedData);
    })
    .catch((error) => {
      alert(error);
    });
}); // Missing parenthesis was added here

function renderData(data) {
  const tableBody = document.getElementById('weather-detail-table');

  updateTable(data);
  updateWeekdayContainer(data);

  console.log(data);
  // weekdaysContainer.appendChild()
}

function updateTable(data) {}

function updateWeekdayContainer(data) {
  const weekdaysContainer = document.querySelector('.weekdays-container');

  weekdaysContainer.innerHTML = '';

  data.weekData.forEach((dayData) => {
    const { min_temp, max_temp, icon_url } = dayData;
    const weekdayContainer = document.createElement('button');
    weekdayContainer.classList.add('weekday-container');
    if (dayData.active) {
      weekdayContainer.classList.add('active');
    } else {
      weekdayContainer.classList.remove('active');
    }

    const h2 = document.createElement('h2');
    h2.textContent = min_temp;

    const p = document.createElement('p');
    p.textContent = max_temp;

    weekdayContainer.append(h2, p);
    weekdayContainer.style.backgroundImage = `url(${icon_url})`;

    weekdaysContainer.append(weekdayContainer);
  });
}

function getWeekData(data) {
  const weekDataArray = data.forecast.forecastday;
  console.log('array', weekDataArray);
  return weekDataArray.map((dayData, index) => {
    const dayName = getDayName(dayData.date, 'en-US');
    return {
      day_name: dayName,
      icon_url: dayData.day.condition.icon,
      description: dayData.day.condition.text,
      min_temp: dayData.day.mintemp_f,
      max_temp: dayData.day.maxtemp_f,
      avg_temp: (dayData.day.maxtemp_f + dayData.day.mintemp_f) / 2,
      date: dayData.date,
      active: index === 0,
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

function formatPropertyKey(key) {
  return key
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function convertTemp(temp, targetUnit = 'Celsius') {
  if (targetUnit === 'Celsius') {
    return (temp - 32) * (5 / 9);
  }
  if (targetUnit === 'Fahrenheit') {
    return temp * (9 / 5) + 32;
  }
}

function setActiveTab(tabId) {
  const id = +tabId.split('-')[1];
  formattedData.weekData.forEach((dayData, index) => {
    dayData.active = index === id;
  });
}

function bindEventListeners() {
  const weekdaysContainer = document.querySelector('.weekdays-container');
  weekdaysContainer.addEventListener('click', (event) => {
    setActiveTab(event.target.closest('button').id);
    updateWeekdayContainer(formattedData);
  });
}

bindEventListeners();

console.log(getDayName('2023-06-16', 'en-US'));
