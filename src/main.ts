import "./style.css";
import * as L from "leaflet";
import { apiKey } from "./api";
import { type WeatherData, type Coord } from "./types";

const cityForm = document.querySelector(".city-form") as HTMLFormElement;
const coordsForm = document.querySelector(".location-form") as HTMLFormElement;
const selectedOption =
  document.querySelector<HTMLSelectElement>(".search-option");
const citiesList = document.querySelector(".cities") as HTMLUListElement;

const cityInput = document.querySelector(
  ".search-input",
) as HTMLInputElement | null;

const weatherCard = document.querySelector<HTMLDivElement>(".weather-card");
const latInput = document.querySelector(
  ".lat-input",
) as HTMLInputElement | null;
const lngInput = document.querySelector(
  ".lng-input",
) as HTMLInputElement | null;

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

const onMapClick = async (e: { latlng: { lat: any; lng: any } }) => {
  console.log("e", e.latlng);
  const { lat, lng } = e.latlng;

  if (lat == null || lng == null) return;
  if (!latInput || !lngInput) return;

  const newLat = lat.toFixed(4);
  const newLng = lng.toFixed(4);

  // latInput.removeAttribute("disabled");
  // lngInput.removeAttribute("disabled");

  latInput.value = String(newLat);
  lngInput.value = String(newLng);
};

map.on("click", onMapClick);

const moveMapView = (coord: Coord) => {
  map.setView([coord.lat, coord.lon], 12);
};

type Weather = {
  city?: string;
  lat?: number;
  lng?: number;
};

function getLocalStorageData() {
  const items = localStorage.getItem("history");

  if (!items) return [];

  return JSON.parse(items);
}

function saveToLocalStorage(city: string) {
  const items = getLocalStorageData();

  console.log("item", items, city);

  const newItem = [...items, city];

  localStorage.setItem("history", JSON.stringify(newItem));

  loadCities();
}

function loadCities() {
  const cities = getLocalStorageData();
  console.log("cities", cities);

  if (!cities) {
    localStorage.setItem("history", JSON.stringify([]));
    return;
  }

  for (const city of cities) {
    console.log("city", city);
    const item = document.createElement("li");

    item.innerText = city;

    citiesList.appendChild(item);
  }
}

loadCities();

const baseWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?";

const loadWeatherInfo = async ({ city, lat, lng }: Weather) => {
  console.log("ssa", city, lat, lng);
  try {
    let fullUrl = `${baseWeatherUrl}q=${city}&appid=${apiKey}&units=metric`;
    console.log("full", fullUrl);

    if (!city && lat && lng) {
      fullUrl = `${baseWeatherUrl}lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
    }

    console.log("full", fullUrl);

    //funciona
    // https://api.openweathermap.org/data/2.5/weather?lat=-3.7393&lon=-38.5245&appid=5726125e920eaaf1a591f6276c65db8b

    const response = await fetch(fullUrl);

    const data = await response.json();

    if (!response.ok) {
      throw new Error("City not found");
    }

    saveToLocalStorage(data.name);

    console.log("data", data);
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
      <p>${temperature}°C</p>
      <p>${weatherInfo.main}</p>
    </div>
    `;
  }

  moveMapView(coord);
};

async function processCityData(event: Event) {
  event.preventDefault();

  if (!cityForm) return;

  let data = new FormData(cityForm);

  const city = String(data.get("city"));

  if (!city) return;

  await loadWeatherInfo({ city });

  cityForm.reset();
}

async function processCoordsData(event: Event) {
  event.preventDefault();

  if (!coordsForm) return;

  let data = new FormData(coordsForm);

  const latValue = data.get("lat");
  const lngValue = data.get("lng");

  console.log("teste", latValue, lngValue);

  const lat = latValue ? Number(latValue) : undefined;
  const lng = lngValue ? Number(lngValue) : undefined;

  console.log("teste", lat, lng);

  if (lat && lng) {
    await loadWeatherInfo({ lat, lng });
    return;
  }

  coordsForm.reset();
}

cityForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  await processCityData(event);
});

coordsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  console.log("uou");

  await processCoordsData(event);
});

function showForm() {
  const mode = selectedOption?.value;

  console.log("option", mode);

  if (mode === "city") {
    cityForm.hidden = false;
    coordsForm.hidden = true;
  } else if (mode === "latlng") {
    cityForm.hidden = true;
    coordsForm.hidden = false;
  } else {
    cityForm.hidden = true;
    coordsForm.hidden = true;
  }
}

selectedOption?.addEventListener("change", showForm);

function showError(message: string) {
  if (weatherCard) {
    weatherCard.innerHTML = `
    <p class="error">${message}
    </p>`;
  }
}
