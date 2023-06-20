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
});

function renderData(data) {
  updateTable(data);
  updateWeekdayContainer(data);

  console.log(data);
  // weekdaysContainer.appendChild()
}

function updateTable() {
  let activeIndex;
  formattedData.weekData.forEach((dateData, index) => {
    if (dateData.active) {
      activeIndex = index;
    }
  });

  const activeDay = formattedData.weekData[activeIndex];

  // Insert values into the table...
  const tableBody = document.querySelector('#weather-detail-table tbody');
  tableBody.innerHTML = '';
  for (const [key, value] of Object.entries(activeDay)) {
    const row = document.createElement('tr');
    const td1 = document.createElement('td');
    td1.textContent = key;
    const td2 = document.createElement('td');
    td2.textContent = value;

    row.append(td1, td2);
    tableBody.append(row);
  }
}

function updateWeekdayContainer(data) {
  const weekdaysContainer = document.querySelector('.weekdays-container');

  weekdaysContainer.innerHTML = '';

  data.weekData.forEach((dayData, index) => {
    const { min_temp, max_temp, icon_url } = dayData;
    const weekdayContainer = document.createElement('button');
    weekdayContainer.classList.add('weekday-container');
    weekdayContainer.id = `tab-${index}`;
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
    temp_unit: 'Fahrenheit',
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
    return ((temp - 32) * (5 / 9)).toFixed(2);
  }
  if (targetUnit === 'Fahrenheit') {
    return (temp * (9 / 5) + 32).toFixed(2);
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
    updateTable();
  });

  const toggleBtn = document.querySelector('.toggle-units');
  toggleBtn.addEventListener('click', () => {
    const currentMode = formattedData.temp_unit;
    formattedData.weekData.forEach((dayData) => {
      for (const key of Object.keys(dayData)) {
        if (key.match(/temp/)) {
          if (currentMode === 'Fahrenheit') {
            dayData[key] = convertTemp(dayData[key], 'Celsius');
            formattedData.temp_unit = 'Celsius';
          } else {
            dayData[key] = convertTemp(dayData[key], 'Fahrenheit');
            formattedData.temp_unit = 'Fahrenheit';
          }
        }
      }
    });
    updateWeekdayContainer(formattedData);
    updateTable();
  });
}

bindEventListeners();

console.log(getDayName('2023-06-16', 'en-US'));
