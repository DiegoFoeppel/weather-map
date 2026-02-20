export type WeatherData = {
  coord: Coord;
  weather: [{ description: string; icon: string; main: string }];
  sys: { country: string };
  main: { temp: number };
  name: string;
};

export type Coord = {
  lat: number;
  lon: number;
};
