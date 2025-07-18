import { create } from 'twrnc';

// Create custom tw instance with aggressive caching
const tw = create();

// Enable aggressive memoization
tw.memoBuster = Date.now().toString();

// Create style cache for commonly used styles
const styleCache = new Map<string, unknown>();

// Helper function for cached styles
export const twc = (strings: TemplateStringsArray, ...values: unknown[]) => {
  const key = strings.reduce((result, str, i) => {
    const value = values[i];
    let valueStr = '';
    if (value !== null && value !== undefined) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        valueStr = String(value);
      } else {
        valueStr = JSON.stringify(value);
      }
    }
    return result + str + valueStr;
  }, '');

  if (styleCache.has(key)) {
    return styleCache.get(key);
  }

  const style = tw(strings, ...(values as (string | number)[]));
  styleCache.set(key, style);

  // Limit cache size to prevent memory issues
  if (styleCache.size > 1000) {
    const firstKey = styleCache.keys().next().value;
    if (firstKey !== undefined) {
      styleCache.delete(firstKey);
    }
  }

  return style;
};

// Pre-cache common styles
export const commonStyles = {
  // Containers
  flexOne: tw`flex-1`,
  flexRow: tw`flex-row`,
  flexCol: tw`flex-col`,
  itemsCenter: tw`items-center`,
  justifyCenter: tw`justify-center`,
  justifyBetween: tw`justify-between`,

  // Spacing
  p4: tw`p-4`,
  p6: tw`p-6`,
  px6: tw`px-6`,
  pb8: tw`pb-8`,
  mb4: tw`mb-4`,
  mb6: tw`mb-6`,
  mb8: tw`mb-8`,

  // Typography
  textSm: tw`text-sm`,
  textLg: tw`text-lg`,
  text2xl: tw`text-2xl`,
  text3xl: tw`text-3xl`,
  text5xl: tw`text-5xl`,
  fontBold: tw`font-bold`,
  fontSemibold: tw`font-semibold`,
  fontMedium: tw`font-medium`,

  // Colors - Light mode
  bgWhite: tw`bg-white`,
  bgGray50: tw`bg-gray-50`,
  bgGray100: tw`bg-gray-100`,
  textGray600: tw`text-gray-600`,
  textGray700: tw`text-gray-700`,
  textGray900: tw`text-gray-900`,

  // Colors - Dark mode
  bgBlack: tw`bg-black`,
  bgGray900: tw`bg-gray-900`,
  bgGray800: tw`bg-gray-800`,
  textGray200: tw`text-gray-200`,
  textGray300: tw`text-gray-300`,
  textGray400: tw`text-gray-400`,
  textWhite: tw`text-white`,

  // Common components
  roundedLg: tw`rounded-lg`,
  rounded2xl: tw`rounded-2xl`,
  rounded3xl: tw`rounded-3xl`,
  shadowLg: tw`shadow-lg`,
  shadow2xl: tw`shadow-2xl`,
  borderWhite20: tw`border border-white/20`,
};

// Theme-based style helpers
export const getThemedStyles = (isDark: boolean) => {
  const themeKey = `theme-${String(isDark)}`;
  if (styleCache.has(themeKey)) {
    return styleCache.get(themeKey);
  }

  const styles = {
    container: tw`flex-1 ${isDark ? 'bg-black' : 'bg-gray-50'}`,
    heading: tw`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`,
    subheading: tw`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`,
    text: tw`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`,
    smallText: tw`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`,
    card: tw`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4`,
    cardBorder: tw`${isDark ? 'border-gray-700' : 'border-gray-200'} border`,
  };

  styleCache.set(themeKey, styles);
  return styles;
};

// Export the optimized tw instance as default
export default tw;
