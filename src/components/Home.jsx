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
        "13n": snow_icon,
    };

    const search = async (city) => {
        if (!city) return;
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            if (!response.ok) {
                alert(data.message);
                return;
            }
            const icon = allIcons[data.weather[0].icon] || clear_icon;
            setWeatherData({
                city: data.name,
                temp: Math.floor(data.main.temp),
                weather: data.weather[0].main,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                icon: icon,
            });
            setSuggestions([]);
        } catch (error) {
            setWeatherData(false);
            console.error("Error fetching weather data:", error);
        }
    };

    const fetchSuggestions = async (query) => {
        if (!query) {
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

    useEffect(() => {
        search('New York');
    }, []);

    return (
        <div
            className="app-container"
            style={{
                background: currentTheme.background,
                color: currentTheme.textColor,
                transition: 'all 0.5s ease'
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

            <div id="search">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search..."
                    className="search-input"
                    onChange={(e) => fetchSuggestions(e.target.value)}
                    style={{
                        backgroundColor: currentTheme.searchInputBg,
                        color: currentTheme.searchInputColor
                    }}
                />
                <button
                    className="search-button"
                    style={{ background: currentTheme.searchButtonBg }}
                    onClick={() => search(inputRef.current.value)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={currentTheme.iconColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    Search
                </button>
            </div>

            {/* Suggestion List */}
            <ul className="suggestion-list">
                {suggestions.map((item, index) => (
                    <li key={index} onClick={() => search(item.name)}>
                        {item.name}, {item.state ? `${item.state}, ` : ''}{item.country}
                    </li>
                ))}
            </ul>

            {/* Weather Display */}
            {weatherData && (
                <div id="weather-container">
                    <div className="weather-image">
                        <img
                            src={weatherData.icon}
                            alt="weather"
                            className="weather-icon"
                        />
                    </div>

                    <div className="vertical-stack">
                        <div className="top">
                            <p className="cel">{weatherData.temp}&#8451;</p>
                            <p className="temp">{weatherData.city}</p>
                        </div>

                        <div className="weather bottom">
                            <div className="weather-col">
                                <img src={humidity_icon} alt="Humidity" />
                                <div>
                                    <p>{weatherData.humidity}</p>
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
        </div>
    );
}

export default Home;
