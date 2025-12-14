export type Locale = "en" | string;

export interface Translations {
  [key: string]: string | Translations;
}

// Translation data
const translations: Record<Locale, Translations> = {
  en: {
    mainTitle: "ThinkingHat",
    theme: "Theme",
    style: "Style",
    light: "Light",
    dark: "Dark",

    gamesTitle: "Games",
    createRoom: "Create room",
    joinRoom: "Join room",
    roomCode: "Room code",
    startGame: "Start game",
    ready: "Ready",
    notReady: "Not ready",
    players: "Players",
    player: "Player",
    host: "Host",
    spectator: "Spectator",
    disconnected: "Disconnected",
    comingSoon: "Coming soon",

    game: {
      mumbled: {
        name: "Mumbled",
        description: "Mad Gab-style sound-alike phrases.",
      },
      rebus: {
        name: "Rebus",
        description: "Visual/layout word puzzles.",
      },
      riddles: {
        name: "Riddles",
        description: "Short cryptic clues.",
      },
    },

    mumbled: {
      title: "Mumbled",
      promptLabel: "Say this out loud:",
      yourAnswer: "Your answer",
      submit: "Submit",
      nextRound: "Next round",
      skip: "Skip",
      correct: "Correct!",
      incorrect: "Try again",
      revealedAnswer: "Answer",
      round: "Round",
      score: "Score",
    },
  },
};

// Default locale
let currentLocale: Locale = "en";

/**
 * Set the current locale for translations
 */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

/**
 * Get the current locale
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Get a nested value from an object using a dot-notation key
 */
function getNestedValue(obj: Translations, key: string): string | undefined {
  const keys = key.split(".");
  let value: any = obj;
  
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }
  
  return typeof value === "string" ? value : undefined;
}

/**
 * Translation function
 * @param key - Translation key (supports dot notation for nested keys)
 * @param locale - Optional locale override
 * @returns Translated string or the key if translation not found
 */
export function t(key: string, locale?: Locale): string {
  const localeToUse = locale || currentLocale;
  const localeTranslations = translations[localeToUse] || translations.en;
  
  const translation = getNestedValue(localeTranslations, key);
  
  if (translation) {
    return translation;
  }
  
  // Fallback to English if translation not found
  if (localeToUse !== "en") {
    const enTranslation = getNestedValue(translations.en, key);
    if (enTranslation) {
      return enTranslation;
    }
  }
  
  // Return the key itself if no translation found
  return key;
}

// Default export
export default t;

