export type Season = "spring" | "summer" | "autumn" | "winter";

export type CurrentWeather = {
  temperature: number;
  code: number;
  label: string;
  season: Season;
};

const WMO_LABELS: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Freezing fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail",
};

export function weatherLabel(code: number) {
  return WMO_LABELS[code] ?? "Unsettled";
}

/**
 * Maps a temperature (and month) to the wardrobe season we should favour.
 * Deliberately simple: the goal is a useful filter, not meteorology.
 */
export function seasonForTemperature(celsius: number, month: number): Season {
  const spring = month >= 3 && month <= 5;
  const autumn = month >= 9 && month <= 11;

  if (celsius < 8) return "winter";
  if (celsius < 15) {
    if (spring) return "spring";
    if (autumn) return "autumn";
    return month >= 11 || month <= 2 ? "winter" : "autumn";
  }
  if (celsius < 23) {
    if (spring) return "spring";
    if (autumn) return "autumn";
    return "spring";
  }
  return "summer";
}

export const SEASON_COPY: Record<Season, string> = {
  spring: "light layers",
  summer: "breathable pieces",
  autumn: "warm layers",
  winter: "heavy layers",
};

/**
 * Open-Meteo needs no API key. Returns null on any failure so the dashboard
 * can fall back to the unfiltered suggestion.
 */
export async function getCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<CurrentWeather | null> {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${latitude.toFixed(3)}&longitude=${longitude.toFixed(3)}` +
    "&current=temperature_2m,weather_code&timezone=auto";

  try {
    const response = await fetch(url, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };

    const temperature = payload.current?.temperature_2m;
    if (typeof temperature !== "number") return null;

    const code = payload.current?.weather_code ?? 0;

    return {
      temperature: Math.round(temperature),
      code,
      label: weatherLabel(code),
      season: seasonForTemperature(temperature, new Date().getMonth() + 1),
    };
  } catch {
    return null;
  }
}
