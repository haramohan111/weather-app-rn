import React, { useEffect, useRef, useState } from 'react';
import './home.css';
import clear_icon from '../assets/clear.png';
import cloud_icon from '../assets/cloud.png';
import drizzle_icon from '../assets/drizzle.png';
import humidity_icon from '../assets/humidity.png';
import rain_icon from '../assets/rain.png';
import snow_icon from '../assets/snow.png';
import wind_icon from '../assets/wind.png';

const apiKey = process.env.REACT_APP_API_KEY;

function Home() {
  const [weatherData, setWeatherData] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [cityWeatherList, setCityWeatherList] = useState([]);
  const [globalCityWeatherList, setGlobalCityWeatherList] = useState([]);
  const [weeklyForecast, setWeeklyForecast] = useState([]);
  const [localAreas, setLocalAreas] = useState([]);
  const [, setLoading] = useState(false);
  const [showLocalAreas, setShowLocalAreas] = useState(false);
  const [currentCity, setCurrentCity] = useState("cuttack");

  const indianCities = [
    "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata",
    "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Cuttack"
  ];

  const globalCities = [
    "New York", "London", "Tokyo", "Paris", "Dubai",
    "Singapore", "Sydney", "Los Angeles", "Toronto", "Beijing"
  ];

  const inputRef = useRef();

  const themes = {
    day: {
      background: 'linear-gradient(120deg, #7bbacb, #0d7fa0, #0d7fa0)',
      textColor: '#333',
      logoFilter: 'none',
      searchInputBg: 'rgba(255,255,255,0.8)',
      searchInputColor: '#333',
      searchButtonBg: 'linear-gradient(135deg, #FFB7B7, #FF8E8E)',
      iconColor: 'currentColor',
      weatherIconFilter: 'none'
    },
    night: {
      background: 'linear-gradient(120deg, #1A1A2E, #16213E, #0F3460)',
      textColor: '#FFF',
      logoFilter: 'invert(1) brightness(1.5)',
      searchInputBg: 'rgba(255,255,255,0.1)',
      searchInputColor: '#FFF',
      searchButtonBg: 'linear-gradient(135deg, #4a5a7a, #3a4a6a)',
      iconColor: '#FFF',
      weatherIconFilter: 'invert(0.8)'
    }
  };

  const currentTheme = isNightMode ? themes.night : themes.day;

  const allIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": cloud_icon,
    "03n": cloud_icon,
    "04d": cloud_icon,
    "04n": cloud_icon,
    "09d": drizzle_icon,
    "09n": drizzle_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "11d": rain_icon,
    "11n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon
  };

  // Predefined list of towns/villages around major cities
  const getNearbyLocations = (cityName) => {
    const locations = {
      "Cuttack": ["Bhubaneswar", "Jagatpur", "Choudwar", "Athagarh", "Tangi", "Banki"],
      "Delhi": ["Noida", "Gurgaon", "Faridabad", "Ghaziabad", "Meerut", "Sonipat"],
      "Mumbai": ["Thane", "Navi Mumbai", "Kalyan", "Vasai", "Virar", "Bhiwandi"],
      "Bangalore": ["Whitefield", "Electronic City", "Yelahanka", "Kengeri", "Hosur", "Tumkur"],
      "Chennai": ["Chengalpattu", "Tiruvallur", "Kanchipuram", "Sriperumbudur", "Poonamallee", "Gummidipoondi"],
      "Kolkata": ["Howrah", "Salt Lake", "Barrackpore", "Kalyani", "Bardhaman", "Serampore"],
      "Hyderabad": ["Secunderabad", "Cyberabad", "Gachibowli", "Shamshabad", "Sangareddy", "Vikarabad"],
      "Pune": ["Pimpri-Chinchwad", "Hinjewadi", "Wagholi", "Talegaon", "Lonavala", "Chakan"],
      "Ahmedabad": ["Gandhinagar", "Naroda", "Vastral", "Sanand", "Kalol", "Mehsana"],
      "Jaipur": ["Sitapura", "Tonk", "Amer", "Bagru", "Chomu", "Kotputli"],
      "New York": ["Jersey City", "Newark", "Yonkers", "White Plains", "Stamford", "New Rochelle"],
      "London": ["Croydon", "Bromley", "Ealing", "Harrow", "Hounslow", "Romford"],
      "Tokyo": ["Yokohama", "Kawasaki", "Chiba", "Saitama", "Hachioji", "Machida"],
      "Paris": ["Versailles", "Boulogne-Billancourt", "Saint-Denis", "Argenteuil", "Montreuil", "Nanterre"],
      "Dubai": ["Sharjah", "Ajman", "Abu Dhabi", "Al Ain", "Ras Al Khaimah", "Fujairah"],
      "Singapore": ["Johor Bahru", "Batam", "Bintan", "Malacca", "Kuala Lumpur", "Penang"],
      "Sydney": ["Parramatta", "Newcastle", "Wollongong", "Penrith", "Campbelltown", "Liverpool"],
      "Los Angeles": ["Long Beach", "Anaheim", "Santa Ana", "Irvine", "Glendale", "Pasadena"],
      "Toronto": ["Mississauga", "Brampton", "Markham", "Vaughan", "Oakville", "Richmond Hill"],
      "Beijing": ["Tianjin", "Shijiazhuang", "Tangshan", "Baoding", "Langfang", "Zhangjiakou"]
    };

    return locations[cityName] || [];
  };

  const fetchMultipleCityWeather = async () => {
    try {
      const promises = indianCities.map(async (city) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        return {
          city: data.name,
          temp: Math.floor(data.main.temp),
          icon: allIcons[data.weather[0].icon] || clear_icon,
          condition: data.weather[0].main,
        };
      });

      const results = await Promise.all(promises);
      setCityWeatherList(results);
    } catch (err) {
      console.error("Failed to fetch multiple city weather", err);
    }
  };

  const fetchGlobalCityWeather = async () => {
    try {
      const promises = globalCities.map(async (city) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        return {
          city: data.name,
          temp: Math.floor(data.main.temp),
          icon: allIcons[data.weather[0].icon] || clear_icon,
          condition: data.weather[0].main,
        };
      });

      const results = await Promise.all(promises);
      setGlobalCityWeatherList(results);
    } catch (err) {
      console.error("Failed to fetch global city weather", err);
    }
  };

  const fetchWeeklyForecast = async (lat, lon) => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch weekly forecast");
        return;
      }

      // Process the forecast data to get one entry per day
      const dailyForecasts = {};
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toDateString();

        if (!dailyForecasts[day]) {
          dailyForecasts[day] = {
            date: date,
            temp_min: item.main.temp_min,
            temp_max: item.main.temp_max,
            icon: allIcons[item.weather[0].icon] || clear_icon,
            condition: item.weather[0].main,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed
          };
        } else {
          // Update min and max temperatures
          if (item.main.temp_min < dailyForecasts[day].temp_min) {
            dailyForecasts[day].temp_min = item.main.temp_min;
          }
          if (item.main.temp_max > dailyForecasts[day].temp_max) {
            dailyForecasts[day].temp_max = item.main.temp_max;
          }
        }
      });

      // Convert to array and remove today's forecast
      const forecastArray = Object.values(dailyForecasts);
      forecastArray.shift(); // Remove today
      setWeeklyForecast(forecastArray.slice(0, 7)); // Get next 7 days
    } catch (error) {
      console.error("Error fetching weekly forecast:", error);
    }
  };

  const fetchLocalAreaWeather = async (cityName) => {
    try {
      const nearbyLocations = getNearbyLocations(cityName);
      if (nearbyLocations.length === 0) return;

      const promises = nearbyLocations.map(async (location) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        return {
          city: data.name,
          temp: Math.floor(data.main.temp),
          icon: allIcons[data.weather[0].icon] || clear_icon,
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed
        };
      });

      const results = await Promise.all(promises);
      // Filter out any failed requests
      const validResults = results.filter(result => result !== null);
      setLocalAreas(validResults);
    } catch (error) {
      console.error("Error fetching local area weather:", error);
    }
  };

  const search = async (city) => {
    if (!city) return;
    setLoading(true);
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        setWeatherData(false);
        setWeeklyForecast([]);
        setLocalAreas([]);
        setErrorMessage('City not found. Please try again.');
        setLoading(false);
        return;
      }

      const icon = allIcons[data.weather[0].icon] || clear_icon;
      setWeatherData({
        city: data.name,
        country: data.sys.country,
        temp: Math.floor(data.main.temp),
        feelsLike: Math.floor(data.main.feels_like),
        weather: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        visibility: data.visibility / 1000,
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
        icon: icon,
        coord: data.coord
      });

      // Fetch weekly forecast after getting current weather
      await fetchWeeklyForecast(data.coord.lat, data.coord.lon);

      // Fetch local area weather
      await fetchLocalAreaWeather(data.name);

      setSuggestions([]);
      setErrorMessage('');
    } catch (error) {
      setWeatherData(false);
      setWeeklyForecast([]);
      setLocalAreas([]);
      setErrorMessage('Something went wrong. Please try again later.');
      console.error("Error fetching weather data:", error);
    }
    setLoading(false);
  };

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      search(inputRef.current.value);
    }
  };


useEffect(() => {
  search(currentCity);
  fetchMultipleCityWeather();
  fetchGlobalCityWeather();

  const interval = setInterval(() => {
    search(currentCity);
    fetchMultipleCityWeather();
    fetchGlobalCityWeather();
  }, 300000);

  return () => clearInterval(interval);
}, [currentCity]);

  return (
    <div
      className="app-container"
      style={{
        background: currentTheme.background,
        color: currentTheme.textColor,
        transition: 'all 0.5s ease',
        position: 'relative'
      }}
    >
      <div className="mode-toggle">
        <button
          onClick={() => setIsNightMode(!isNightMode)}
          className="toggle-button"
          style={{
            background: currentTheme.searchInputBg,
            color: currentTheme.textColor
          }}
        >
          {isNightMode ? '☀️ Day Mode' : '🌙 Night Mode'}
        </button>
      </div>

      <div id="logo" style={{ filter: currentTheme.logoFilter }}>
        <img
          src="https://ssl.gstatic.com/onebox/weather/64/partly_cloudy.png"
          alt="logo"
          width="50px"
          height="50px"
        />
      </div>

      <div id="search" style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          className="search-input"
          onChange={(e) => fetchSuggestions(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            backgroundColor: currentTheme.searchInputBg,
            color: currentTheme.searchInputColor
          }}
        />

        {suggestions.length > 0 && (
          <ul className="suggestion-list">
            {suggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  const fullCity = `${item.name},${item.country}`;
                  search(fullCity);
                  inputRef.current.value = fullCity;
                  setSuggestions([]);
                }}
              >
                {item.name}, {item.state ? `${item.state}, ` : ''}{item.country}
              </li>
            ))}
          </ul>
        )}
      </div>

      {errorMessage && (
        <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
          {errorMessage}
        </div>
      )}

      {weatherData && (
        <div id="weather-container">
          <div className="weather-image">
            <img
              src={weatherData.icon}
              alt="weather"
              className="weather-icon"
              style={{ filter: currentTheme.weatherIconFilter }}
            />
            <p className="weather-condition">{weatherData.weather}</p>
          </div>

          <div className="vertical-stack">
            <div className="top">
              <p className="cel">{weatherData.temp}°C</p>
              <p className="temp">{weatherData.city}, {weatherData.country}</p>
              <p className="description">Condition: {weatherData.description}</p>
              <p className="feels-like">Feels Like: {weatherData.feelsLike}°C</p>
              <p className="visibility">Visibility: {weatherData.visibility} km</p>
              <p className="sun-times">🌅 Sunrise: {weatherData.sunrise} | 🌇 Sunset: {weatherData.sunset}</p>
            </div>

            <div className="weather bottom">
              <div className="weather-col">
                <img src={humidity_icon} alt="Humidity" />
                <div>
                  <p>{weatherData.humidity}%</p>
                  <span>Humidity</span>
                </div>
              </div>
              <div className="weather-col">
                <img src={wind_icon} alt="Wind Speed" />
                <div>
                  <p>{weatherData.windSpeed} km/h</p>
                  <span>Wind speed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {weeklyForecast.length > 0 && (
        <div className="weekly-forecast">
          <h2>7-Day Forecast for {weatherData.city}</h2>
          <div className="forecast-grid">
            {weeklyForecast.map((day, index) => (
              <div key={index} className="forecast-card">
                <p className="forecast-day">{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                <p className="forecast-date">{day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                <img src={day.icon} alt="weather icon" className="forecast-icon" />
                <p className="forecast-temp">{Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°</p>
                <p className="forecast-condition">{day.condition}</p>
                <div className="forecast-details">
                  <span>💧 {day.humidity}%</span>
                  <span>💨 {day.windSpeed} m/s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {localAreas.length > 0 && (
        <div className="local-areas-section">
          <div className="section-header">
            <h2>Nearby Locations around {weatherData.city}</h2>
            <button
              className="toggle-local-btn"
              onClick={() => setShowLocalAreas(!showLocalAreas)}
            >
              {showLocalAreas ? 'Hide' : 'Show'} Local Areas
            </button>
          </div>

          {showLocalAreas && (
            <div className="local-grid">
              {localAreas.map((area, index) => (
                <div key={index} className="local-card">
                  <p className="local-name">{area.city}</p>
                  <img src={area.icon} alt="weather icon" className="local-icon" />
                  <p className="local-temp">{area.temp}°C</p>
                  <p className="local-condition">{area.condition}</p>
                  <div className="local-details">
                    <span>💧 {area.humidity}%</span>
                    <span>💨 {area.windSpeed} m/s</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



      {cityWeatherList.length > 0 && (
        <div className="city-weather-list">
          <h2 style={{ marginTop: '30px' }}>Major Indian Cities</h2>
          <div className="city-grid">
            {cityWeatherList.map((city, index) => (
              <div key={index} className="city-card">
                <p className="city-name">{city.city}</p>
                <img src={city.icon} alt="weather icon" className="city-icon" />
                <p>{city.temp}°C</p>
                <p>{city.condition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {globalCityWeatherList.length > 0 && (
        <div className="city-weather-list">
          <h2 style={{ marginTop: '30px' }}>Major World Cities</h2>
          <div className="city-grid">
            {globalCityWeatherList.map((city, index) => (
              <div key={index} className="city-card">
                <p className="city-name">{city.city}</p>
                <img src={city.icon} alt="weather icon" className="city-icon" />
                <p>{city.temp}°C</p>
                <p>{city.condition}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;