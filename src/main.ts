import "./style.css";
import * as L from "leaflet";
import { apiKey } from "./api";

type WeatherData = {
  coord: Coord;
  weather: [{ description: string; icon: string; main: string }];
  sys: { country: string };
  main: { temp: number };
  name: string;
};

type Coord = {
  lat: number;
  lon: number;
};

const form = document.querySelector<HTMLFormElement>(".form");
const weatherCard = document.querySelector<HTMLDivElement>(".weather-card");

var map = L.map("map", {
  zoom: 12,
  minZoom: 3,
  maxZoom: 19,
}).setView([51.505, -0.09], 13);

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: "&copy; OpenStreetMap &copy; CARTO",
  subdomains: "abcd",
  maxZoom: 19,
}).addTo(map);

const moveMapView = (coord: Coord) => {
  map.setView([coord.lat, coord.lon], 12);
};

const loadWeatherInfo = async (cityName: string) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`,
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error("City not found");
    }

    showData(data);
  } catch (error) {
    showError(error instanceof Error ? error.message : "An error occurred");
  }
};

const showData = (apiData: WeatherData) => {
  const { coord, weather, sys, main, name } = apiData;
  const baseUrlIcon = "https://openweathermap.org/payload/api/media/file/";

  const weatherInfo = weather[0];

  const temperature = main.temp;
  const country = sys.country;
  const description = weatherInfo.description;
  const iconUrl = `${baseUrlIcon}${weatherInfo.icon}.png`;

  if (weatherCard) {
    weatherCard.innerHTML = `
    <div class="icon-img">
      <img src=${iconUrl} alt="Icon image">
    </div>
    <div class="info">
      <h2>${name} - ${country}</h2>
      <p>${description}</p>
      <p>${temperature}</p>
      <p>${weatherInfo.main}</p>
    </div>
    `;
  }

  moveMapView(coord);
};

function showError(message: string) {
  if (weatherCard) {
    weatherCard.innerHTML = `
    <p class="error">${message}
    </p>`;
  }
}

async function processData(event: Event) {
  event.preventDefault();

  if (!form) return;

  if (form) {
    let data = new FormData(form);

    const cityName = data.get("city");

    if (!cityName || typeof cityName !== "string") return;

    console.log("cityName", cityName);

    //dados do tempo
    await loadWeatherInfo(cityName);

    form.reset();
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await processData(event);
});
