import { Recipe } from "@prisma/client";

export interface Duration {
  years: number | null | undefined;
  months: number | null | undefined;
  days: number | null | undefined;
  hours: number | null | undefined;
  minutes: number | null | undefined;
  seconds: number | null | undefined;
}

export function parseISO8601Duration(duration?: string | null): Duration {
  if (duration == null || duration == "null" || duration == "") {
    return {
      years: null,
      months: null,
      days: null,
      hours: null,
      minutes: null,
      seconds: null,
    };
  }
  const regex =
    /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  const matches = duration?.match(regex);
  if (matches == null || matches?.length === 0) {
    throw new Error("Invalid ISO8601 Duration");
  }
  return {
    years: matches[1] === undefined ? 0 : parseInt(matches[1]),
    months: matches[2] === undefined ? 0 : parseInt(matches[2]),
    days: matches[3] === undefined ? 0 : parseInt(matches[3]),
    hours: matches[4] === undefined ? 0 : parseInt(matches[4]),
    minutes: matches[5] === undefined ? 0 : parseInt(matches[5]),
    seconds: matches[6] === undefined ? 0 : parseInt(matches[6]),
  };
}

export const prettyPrintDuration = (time: Duration): string => {
  const parts: string[] = [];

  if (time.years)
    parts.push(time.years + " year" + (time.years > 1 ? "s" : ""));
  if (time.months)
    parts.push(time.months + " month" + (time.months > 1 ? "s" : ""));
  if (time.days) parts.push(time.days + " day" + (time.days > 1 ? "s" : ""));
  if (time.hours)
    parts.push(time.hours + " hour" + (time.hours > 1 ? "s" : ""));
  if (time.minutes)
    parts.push(time.minutes + " minute" + (time.minutes > 1 ? "s" : ""));
  if (time.seconds)
    parts.push(time.seconds + " second" + (time.seconds > 1 ? "s" : ""));

  return parts.join(', ');
};

export const parseCookTimes = (
  recipe: Pick<Recipe, "cookTime" | "prepTime" | "totalTime">,
): { cookTime: Duration; prepTime: Duration; totalTime: Duration } => {
  const times = {
    cookTime: parseISO8601Duration(recipe.cookTime),
    prepTime: parseISO8601Duration(recipe.prepTime),
    totalTime: parseISO8601Duration(recipe.totalTime),
  };
  return times;
};

export const _testing = {
  parseISO8601Duration
}