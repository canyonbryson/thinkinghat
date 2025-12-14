// theme.ts

export type ColorMode = "light" | "dark";
export type ThemeStyle = "arcade" | "paper" | "glass" | "modern";

export interface ThemeColors {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  primarySoft: string;
  primaryText: string;
  accent: string;
  accentSoft: string;
  text: string;
  textMuted: string;
  borderSubtle: string;
  borderStrong: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string; // e.g. for modals, glass, etc.
}

export interface ThemeRadii {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  pill: number;
  full: number;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  glow: string;
}

export interface ThemeTypography {
  fontFamilyHeading: string;
  fontFamilyBody: string;
  fontFamilyMono: string;
  fontSizeXs: number;
  fontSizeSm: number;
  fontSizeMd: number;
  fontSizeLg: number;
  fontSizeXl: number;
  fontSize2xl: number;
  lineHeightTight: number;
  lineHeightNormal: number;
  lineHeightLoose: number;
  letterSpacingTight: number;
  letterSpacingNormal: number;
  letterSpacingWide: number;
  weightRegular: string | number;
  weightMedium: string | number;
  weightBold: string | number;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
}

export interface ThemeMisc {
  blurAmount: number; // useful for Glass, can be 0 for others
  focusRingColor: string;
  focusRingWidth: number;
  focusRingOffset: number;
}

export interface ThemeTokens {
  id: string; // e.g. "light-arcade"
  mode: ColorMode;
  style: ThemeStyle;
  colors: ThemeColors;
  radii: ThemeRadii;
  shadows: ThemeShadows;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  misc: ThemeMisc;
}

// Shared base tokens ---------------------------------------------------------

const baseRadii: ThemeRadii = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
  full: 9999,
};

const baseSpacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
};

const baseTypography: ThemeTypography = {
  fontFamilyHeading: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontFamilyBody: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontFamilyMono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  fontSizeXs: 12,
  fontSizeSm: 14,
  fontSizeMd: 16,
  fontSizeLg: 18,
  fontSizeXl: 22,
  fontSize2xl: 26,
  lineHeightTight: 1.1,
  lineHeightNormal: 1.4,
  lineHeightLoose: 1.7,
  letterSpacingTight: -0.3,
  letterSpacingNormal: 0,
  letterSpacingWide: 0.4,
  weightRegular: 400,
  weightMedium: 500,
  weightBold: 700,
};

// Color helpers --------------------------------------------------------------

function arcadeColors(mode: ColorMode): ThemeColors {
  const isDark = mode === "dark";

  return {
    background: isDark ? "#05030A" : "#0F1020",
    backgroundAlt: isDark ? "#0D0420" : "#191935",
    surface: isDark ? "#161331" : "#222447",
    surfaceAlt: isDark ? "#241B47" : "#2F315A",
    primary: "#FF2EC4", // neon pink
    primarySoft: "rgba(255, 46, 196, 0.2)",
    primaryText: "#FFFFFF",
    accent: "#00F5FF", // neon cyan
    accentSoft: "rgba(0, 245, 255, 0.2)",
    text: isDark ? "#F5F5FF" : "#FFFFFF",
    textMuted: isDark ? "#AAA4D5" : "#C7C1F0",
    borderSubtle: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)",
    borderStrong: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.25)",
    success: "#35F27C",
    warning: "#FFC857",
    danger: "#FF3366",
    overlay: "rgba(6, 0, 32, 0.7)",
  };
}

function paperColors(mode: ColorMode): ThemeColors {
  const isDark = mode === "dark";

  return {
    background: isDark ? "#1D2228" : "#FDF7EC",
    backgroundAlt: isDark ? "#232931" : "#F6EAD2",
    surface: isDark ? "#2C333A" : "#FFFFFF",
    surfaceAlt: isDark ? "#343C45" : "#FDF5E7",
    primary: "#FF9F1C", // sticky-note orange
    primarySoft: "rgba(255, 159, 28, 0.18)",
    primaryText: isDark ? "#1D2228" : "#2B2720",
    accent: "#2EC4B6", // teal pen
    accentSoft: "rgba(46, 196, 182, 0.18)",
    text: isDark ? "#F7F6F2" : "#2B2720",
    textMuted: isDark ? "#B6BABE" : "#7D7565",
    borderSubtle: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    borderStrong: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
    success: "#6CC070",
    warning: "#FFB347",
    danger: "#D7263D",
    overlay: "rgba(11, 13, 15, 0.65)",
  };
}

function glassColors(mode: ColorMode): ThemeColors {
  const isDark = mode === "dark";

  return {
    background: isDark ? "#050712" : "#E4EDF8",
    backgroundAlt: isDark ? "#080A18" : "#D7E3F5",
    surface: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.55)",
    surfaceAlt: isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.8)",
    primary: "#4F46E5", // indigo
    primarySoft: "rgba(79, 70, 229, 0.18)",
    primaryText: "#FFFFFF",
    accent: "#22D3EE", // cyan glow
    accentSoft: "rgba(34, 211, 238, 0.18)",
    text: isDark ? "#F9FAFB" : "#0B1120",
    textMuted: isDark ? "#A5B4FC" : "#334155",
    borderSubtle: isDark ? "rgba(148,163,184,0.35)" : "rgba(148,163,184,0.35)",
    borderStrong: isDark ? "rgba(148,163,184,0.75)" : "rgba(15,23,42,0.25)",
    success: "#22C55E",
    warning: "#FACC15",
    danger: "#FB7185",
    overlay: "rgba(15,23,42,0.75)",
  };
}

function modernColors(mode: ColorMode): ThemeColors {
  const isDark = mode === "dark";

  return {
    background: isDark ? "#050608" : "#F3F4F6",
    backgroundAlt: isDark ? "#080A0F" : "#E5E7EB",
    surface: isDark ? "#101318" : "#FFFFFF",
    surfaceAlt: isDark ? "#151922" : "#F9FAFB",
    primary: "#6366F1", // modern indigo
    primarySoft: "rgba(99,102,241,0.14)",
    primaryText: "#FFFFFF",
    accent: "#EC4899", // pink accent
    accentSoft: "rgba(236,72,153,0.16)",
    text: isDark ? "#F9FAFB" : "#111827",
    textMuted: isDark ? "#9CA3AF" : "#4B5563",
    borderSubtle: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
    borderStrong: isDark ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.12)",
    success: "#16A34A",
    warning: "#EAB308",
    danger: "#DC2626",
    overlay: "rgba(15,23,42,0.7)",
  };
}

// Shadows --------------------------------------------------------------------

function arcadeShadows(): ThemeShadows {
  return {
    sm: "0 1px 0 rgba(0,0,0,0.4)",
    md: "0 4px 0 rgba(0,0,0,0.6)",
    lg: "0 8px 0 rgba(0,0,0,0.8)",
    glow: "0 0 18px rgba(255, 46, 196, 0.8)",
  };
}

function paperShadows(): ThemeShadows {
  return {
    sm: "0 1px 3px rgba(15, 23, 42, 0.12)",
    md: "0 4px 8px rgba(15, 23, 42, 0.16)",
    lg: "0 10px 20px rgba(15, 23, 42, 0.18)",
    glow: "0 0 0 rgba(0,0,0,0)", // mostly no glow for paper
  };
}

function glassShadows(): ThemeShadows {
  return {
    sm: "0 1px 4px rgba(15, 23, 42, 0.35)",
    md: "0 6px 18px rgba(15, 23, 42, 0.45)",
    lg: "0 18px 40px rgba(15, 23, 42, 0.55)",
    glow: "0 0 32px rgba(34, 211, 238, 0.7)",
  };
}

function modernShadows(): ThemeShadows {
  return {
    sm: "0 1px 3px rgba(15, 23, 42, 0.12)",
    md: "0 4px 10px rgba(15, 23, 42, 0.16)",
    lg: "0 12px 28px rgba(15, 23, 42, 0.22)",
    glow: "0 0 22px rgba(99,102,241,0.6)",
  };
}

// Misc -----------------------------------------------------------------------

function arcadeMisc(mode: ColorMode): ThemeMisc {
  return {
    blurAmount: 0,
    focusRingColor: "#00F5FF",
    focusRingWidth: 2,
    focusRingOffset: 2,
  };
}

function paperMisc(mode: ColorMode): ThemeMisc {
  return {
    blurAmount: 0,
    focusRingColor: "#2EC4B6",
    focusRingWidth: 2,
    focusRingOffset: 2,
  };
}

function glassMisc(mode: ColorMode): ThemeMisc {
  return {
    blurAmount: 18,
    focusRingColor: "#22D3EE",
    focusRingWidth: 2,
    focusRingOffset: 2,
  };
}

function modernMisc(mode: ColorMode): ThemeMisc {
  return {
    blurAmount: 6,
    focusRingColor: "#6366F1",
    focusRingWidth: 2,
    focusRingOffset: 2,
  };
}

// Theme factory --------------------------------------------------------------

export function createTheme(
  mode: ColorMode,
  style: ThemeStyle
): ThemeTokens {
  switch (style) {
    case "arcade":
      return {
        id: `${mode}-arcade`,
        mode,
        style,
        colors: arcadeColors(mode),
        radii: baseRadii,
        shadows: arcadeShadows(),
        typography: {
          ...baseTypography,
          // slightly more playful / arcade-like text
          letterSpacingWide: 0.6,
        },
        spacing: baseSpacing,
        misc: arcadeMisc(mode),
      };

    case "paper":
      return {
        id: `${mode}-paper`,
        mode,
        style,
        colors: paperColors(mode),
        radii: {
          ...baseRadii,
          md: 8,
          lg: 12,
        },
        shadows: paperShadows(),
        typography: {
          ...baseTypography,
          lineHeightNormal: 1.5,
          lineHeightLoose: 1.8,
        },
        spacing: baseSpacing,
        misc: paperMisc(mode),
      };

    case "glass":
      return {
        id: `${mode}-glass`,
        mode,
        style,
        colors: glassColors(mode),
        radii: {
          ...baseRadii,
          lg: 20,
          xl: 28,
        },
        shadows: glassShadows(),
        typography: {
          ...baseTypography,
          letterSpacingNormal: 0.05,
        },
        spacing: baseSpacing,
        misc: glassMisc(mode),
      };

    case "modern":
    default:
      return {
        id: `${mode}-modern`,
        mode,
        style: "modern",
        colors: modernColors(mode),
        radii: baseRadii,
        shadows: modernShadows(),
        typography: baseTypography,
        spacing: baseSpacing,
        misc: modernMisc(mode),
      };
  }
}

// Optional: prebuilt themes for convenience ----------------------------------

export const themes: Record<ColorMode, Record<ThemeStyle, ThemeTokens>> = {
  light: {
    arcade: createTheme("light", "arcade"),
    paper: createTheme("light", "paper"),
    glass: createTheme("light", "glass"),
    modern: createTheme("light", "modern"),
  },
  dark: {
    arcade: createTheme("dark", "arcade"),
    paper: createTheme("dark", "paper"),
    glass: createTheme("dark", "glass"),
    modern: createTheme("dark", "modern"),
  },
};
