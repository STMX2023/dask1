// Base color palette
const baseColors = {
  // Grays and neutrals
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  black: '#000000',

  // Accent colors
  orange: '#EA580C', // orange-600
  orangeLight: '#FB923C', // orange-400
  orangeDark: '#C2410C', // orange-700

  red: '#DC2626', // red-600
  redLight: '#F87171', // red-400
  redDark: '#B91C1C', // red-700

  blue: '#2563EB', // blue-600
  blueLight: '#60A5FA', // blue-400
  blueDark: '#1D4ED8', // blue-700
  blueBright: '#3B82F6', // blue-500 - brighter blue for light mode
};

// Light mode theme
const lightTheme = {
  // Backgrounds
  background: baseColors.white,
  backgroundSecondary: baseColors.gray50,
  backgroundTertiary: baseColors.gray100,

  // Surfaces (cards, modals, etc.)
  surface: baseColors.white,
  surfaceSecondary: baseColors.gray50,
  surfaceTertiary: baseColors.gray100, // For swipable tab bar
  surfaceElevated: baseColors.white,

  // Typography
  textPrimary: baseColors.gray900, // High contrast for main text
  textSecondary: baseColors.gray600, // Medium contrast for secondary text
  textTertiary: baseColors.gray500, // Lower contrast for hints/placeholders
  textInverse: baseColors.white, // For dark backgrounds

  // Borders and dividers
  border: baseColors.gray200,
  borderSecondary: baseColors.gray300,
  borderSubtle: baseColors.gray200, // Very light border for subtle separation
  divider: baseColors.gray200, // For tab bar

  // Interactive elements
  interactive: baseColors.blueBright, // Using brighter blue for light mode
  interactiveHover: baseColors.blue,
  interactivePressed: baseColors.blue,
  interactiveDisabled: baseColors.gray300,

  // Navigation/tabs
  tabBackground: baseColors.white,
  tabIconDefault: baseColors.gray400,
  tabIconSelected: baseColors.blueBright, // Using brighter blue for light mode
  tabIndicator: baseColors.blueBright, // Using brighter blue for light mode

  // Accent colors
  orange: baseColors.orange,
  orangeLight: baseColors.orangeLight,
  red: baseColors.red,
  redLight: baseColors.redLight,
  blue: baseColors.blueBright, // Using brighter blue for light mode
  blueLight: baseColors.blueLight,

  // Status colors with proper contrast
  success: '#15803D', // green-700 - darker green for better contrast against light gray nav bar
  successLight: '#34D399', // green-400
  warning: baseColors.orange,
  warningLight: baseColors.orangeLight,
  error: '#DC2626', // red-600 - brighter red for better contrast
  errorLight: baseColors.redLight,
  info: baseColors.blue,
  infoLight: baseColors.blueLight,
};

// Dark mode theme
const darkTheme = {
  // Backgrounds
  background: baseColors.black,
  backgroundSecondary: baseColors.gray900,
  backgroundTertiary: baseColors.gray800,

  // Surfaces (cards, modals, etc.)
  surface: '#1C1C1E', // Same as nav bar
  surfaceSecondary: '#2C2C2E', // Original color for swippable tab bar
  surfaceTertiary: '#2C2C2E', // For swipable tab bar (same as surfaceSecondary in dark mode)
  surfaceElevated: '#1C1C1E',

  // Typography
  textPrimary: baseColors.white, // High contrast for main text
  textSecondary: baseColors.gray300, // Medium contrast for secondary text
  textTertiary: baseColors.gray400, // Lower contrast for hints/placeholders
  textInverse: baseColors.gray900, // For light backgrounds

  // Borders and dividers
  border: baseColors.gray700,
  borderSecondary: baseColors.gray600,
  borderSubtle: baseColors.black, // Full black border in dark mode
  divider: baseColors.gray700,

  // Interactive elements
  interactive: baseColors.blueLight,
  interactiveHover: baseColors.blue,
  interactivePressed: baseColors.blue,
  interactiveDisabled: baseColors.gray600,

  // Navigation/tabs
  tabBackground: baseColors.black,
  tabIconDefault: baseColors.gray500,
  tabIconSelected: baseColors.white,
  tabIndicator: baseColors.white,

  // Accent colors (slightly lighter for dark mode)
  orange: baseColors.orangeLight,
  orangeLight: baseColors.orange,
  red: baseColors.redLight,
  redLight: baseColors.red,
  blue: baseColors.blueLight,
  blueLight: baseColors.blue,

  // Status colors with proper dark mode contrast
  success: '#4ADE80', // green-400 - much brighter green for dark mode
  successLight: '#059669', // green-600
  warning: baseColors.orangeLight,
  warningLight: baseColors.orange,
  error: '#DC2626', // red-600 - same red as light mode
  errorLight: baseColors.red,
  info: baseColors.blueLight,
  infoLight: baseColors.blue,
};

// Legacy support (keeping the original structure)
const tintColorLight = lightTheme.interactive;
const tintColorDark = darkTheme.interactive;

export default {
  light: {
    text: lightTheme.textPrimary,
    background: lightTheme.background,
    tint: tintColorLight,
    tabIconDefault: lightTheme.tabIconDefault,
    tabIconSelected: lightTheme.tabIconSelected,
  },
  dark: {
    text: darkTheme.textPrimary,
    background: darkTheme.background,
    tint: tintColorDark,
    tabIconDefault: darkTheme.tabIconDefault,
    tabIconSelected: darkTheme.tabIconSelected,
  },
};

// Export comprehensive theme objects
export { lightTheme, darkTheme, baseColors };

// Utility function to get theme based on color scheme
export const getTheme = (isDark: boolean) => (isDark ? darkTheme : lightTheme);

// Semantic color tokens for specific use cases
export const semanticColors = {
  // Tab bar specific colors
  tabBar: {
    light: {
      background: baseColors.black,
      activeIcon: baseColors.white,
      inactiveIcon: '#777777',
      indicator: baseColors.white,
    },
    dark: {
      background: baseColors.black,
      activeIcon: baseColors.white,
      inactiveIcon: '#777777',
      indicator: baseColors.white,
    },
  },

  // Gradient tokens
  gradients: {
    successGreen: {
      light: ['#10B981', '#059669'], // green-500 to green-600
      dark: ['#34D399', '#10B981'], // green-400 to green-500
    },
    primaryBlue: {
      light: ['#3B82F6', '#1D4ED8'], // blue-500 to blue-700
      dark: ['#60A5FA', '#3B82F6'], // blue-400 to blue-500
    },
  },

  // Button colors
  button: {
    light: {
      primary: baseColors.blue,
      primaryText: baseColors.white,
      secondary: baseColors.gray200,
      secondaryText: baseColors.gray900,
      danger: baseColors.red,
      dangerText: baseColors.white,
    },
    dark: {
      primary: baseColors.blueLight,
      primaryText: baseColors.gray900,
      secondary: baseColors.gray700,
      secondaryText: baseColors.white,
      danger: baseColors.redLight,
      dangerText: baseColors.gray900,
    },
  },
};
