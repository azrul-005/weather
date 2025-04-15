const weatherApiKey = '0e1ea73e59f90f117b9a52368ba5b9e9'; // Replace with your Weatherstack API key
const chartCtx = document.getElementById('temperatureChart').getContext('2d');
let darkMode = false;

// Function to fetch weather by city
function getWeatherByCity() {
  const city = document.getElementById('cityInput').value;
  if (!city) return alert("Please enter a city name");

  fetch(`http://api.weatherstack.com/current?access_key=${weatherApiKey}&query=${city}`)
    .then(res => res.json())
    .then(data => {
      if (!data.location) return alert("Location not found.");
      showWeather(data);
      saveLocation(city);
      renderSaved(); // Re-render saved locations
    })
    .catch(err => console.error('Error fetching weather data: ', err));
}

// Function to fetch weather by location (using geolocation)
function getWeatherByLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    fetch(`http://api.weatherstack.com/current?access_key=${weatherApiKey}&query=${latitude},${longitude}`)
      .then(res => res.json())
      .then(data => {
        if (!data.location) return alert("Error getting weather.");
        showWeather(data);
      })
      .catch(err => console.error('Error fetching weather data: ', err));
  }, (err) => alert('Unable to retrieve your location.'));
}

// Function to display weather data on the page
function showWeather(data) {
  const weatherDiv = document.getElementById('weatherData');
  weatherDiv.innerHTML = `
    <h2>${data.location.name}, ${data.location.country}</h2>
    <p><strong>Temperature:</strong> ${data.current.temperature}°C</p>
    <p><strong>Condition:</strong> ${data.current.weather_descriptions[0]}</p>
    <p><strong>Humidity:</strong> ${data.current.humidity}%</p>
    <p><strong>Wind Speed:</strong> ${data.current.wind_speed} km/h</p>
    <img src="${data.current.weather_icons[0]}" alt="Weather Icon" />
    <p><strong>Sunrise:</strong> ${data.current.sunrise}</p>
    <p><strong>Sunset:</strong> ${data.current.sunset}</p>
  `;

  const forecastDiv = document.getElementById('forecast');
  forecastDiv.innerHTML = `<h3>5-Day Forecast</h3>`;
  for (let i = 1; i <= 5; i++) {
    forecastDiv.innerHTML += `
      <div>
        <strong>Day ${i}:</strong> ${data.current.temperature + i}°C | ${data.current.weather_descriptions[0]}
      </div>
    `;
  }

  // Hourly Weather Forecast (simulated for demonstration)
  const hourlyData = Array.from({ length: 12 }, (_, i) => {
    return {
      time: `${i + 1}:00`,
      temp: data.current.temperature + (i % 2 === 0 ? 2 : -2), // Alternating temperatures for demo
    };
  });

  renderChart(hourlyData);
}

// Function to render hourly temperature chart
function renderChart(hourlyData) {
  const labels = hourlyData.map(item => item.time);
  const temperatures = hourlyData.map(item => item.temp);

  new Chart(chartCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temperatures,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false,
      }]
    }
  });
}

// Function to save locations to localStorage
function saveLocation(city) {
  let saved = JSON.parse(localStorage.getItem('locations')) || [];
  if (!saved.includes(city)) {
    saved.push(city);
    localStorage.setItem('locations', JSON.stringify(saved));
  }
}

// Function to render saved locations on the page
function renderSaved() {
  const saved = JSON.parse(localStorage.getItem('locations')) || [];
  const list = document.getElementById('savedList');
  list.innerHTML = ''; // Clear the list before rendering again
  saved.forEach(city => {
    const li = document.createElement('li');
    li.textContent = city;
    li.onclick = () => {
      document.getElementById('cityInput').value = city;
      getWeatherByCity();
    };
    list.appendChild(li);
  });
}

// Function to clear all saved locations
function clearSaved() {
  if (confirm("Are you sure you want to delete all saved locations?")) {
    localStorage.removeItem('locations');
    renderSaved(); // Re-render the list after clearing
  }
}

// Dark Mode toggle
document.getElementById('toggleTheme').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  darkMode = !darkMode;
});

// Render saved locations when the page loads
window.onload = renderSaved;

// Real-Time Updates (Every 5 minutes)
setInterval(() => {
  const city = document.getElementById('cityInput').value;
  if (city) {
    getWeatherByCity();
  }
}, 300000); // 300000ms = 5 minutes
