# Layout System Guidelines

## Responsive Layout Best Practices

This document outlines the most reliable and professional approach to building flexible UI layouts that work consistently across all device types and sizes.

## Core Principles

### 1. **Fixed Navigation + Dynamic Safe Areas**

For navigation elements (tab bars, headers), use **fixed semantic heights** combined with **dynamic safe area handling**:

```javascript
// ✅ Professional approach
const styles = useMemo(() => ({
  scrollContainer: {
    marginBottom: NAV_HEIGHT + insets.bottom + GAP
  }
}), [insets.bottom]);

// ❌ Avoid percentage-based navigation
marginBottom: '15%' // Breaks on different screen ratios
```

**Why this works:**
- Navigation bars have standardized heights (iOS: 49-83px, Material: 56-80px)
- `useSafeAreaInsets()` provides exact device measurements
- Consistent user experience across all devices
- Follows platform design guidelines

### 2. **Semantic Layout Constants**

Define layout constants based on their semantic purpose:

```javascript
// Navigation constants
const NAV_HEIGHT = 72;        // Fixed nav bar height
const GAP = 16;               // Standard spacing unit
const BORDER_RADIUS = 24;     // Consistent border radius

// Dynamic calculations
marginBottom: NAV_HEIGHT + insets.bottom + GAP
```

### 3. **Safe Area Integration Pattern**

Always wrap your app with SafeAreaProvider and use insets strategically:

```javascript
// Root layout
<SafeAreaProvider>
  <ThemeProvider>
    <Stack />
  </ThemeProvider>
</SafeAreaProvider>

// Component usage
const insets = useSafeAreaInsets();
const dynamicStyle = {
  paddingBottom: insets.bottom,
  paddingTop: insets.top
};
```

### 4. **Container Hierarchy**

Structure your layout containers with clear responsibilities:

```javascript
// Layout structure
<View style={styles.container}>          {/* Full screen container */}
  <View style={styles.header}>           {/* Fixed header */}
    <Text>Title</Text>
  </View>
  
  <View style={styles.scrollContainer}>  {/* Bounded scroll area */}
    <ScrollView>                         {/* Content scroll */}
      {/* Content */}
    </ScrollView>
  </View>
</View>
```

### 5. **Bounded Scroll Containers**

For scrollable content, create bounded containers with rounded edges:

```javascript
const styles = {
  scrollContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: NAV_HEIGHT + insets.bottom + GAP,
    borderRadius: 24,
    overflow: 'hidden'
  }
};
```

**Benefits:**
- Prevents content overflow behind navigation
- Clean visual boundaries when scrolling
- Consistent spacing across devices

## When NOT to Use Percentages

❌ **Avoid percentages for:**
- Navigation bar heights
- Safe area spacing
- Touch target sizes
- Border radius values

✅ **Use percentages for:**
- Width-based responsive layouts
- Aspect ratio containers
- Proportional content sizing

## Device Testing Strategy

Test your layouts on:
- iPhone SE (small screen)
- iPhone 14 Pro (notch + dynamic island)
- iPhone 14 Pro Max (large screen)
- Android devices with gesture navigation
- Tablets (different aspect ratios)

## Example Implementation

```javascript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NAV_HEIGHT = 72;
const CONTENT_GAP = 16;

export default function Screen() {
  const insets = useSafeAreaInsets();
  
  const styles = useMemo(() => ({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    scrollContainer: {
      flex: 1,
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: NAV_HEIGHT + insets.bottom + CONTENT_GAP,
      borderRadius: 24,
      overflow: 'hidden'
    }
  }), [insets.bottom]);
  
  return (
    <View style={styles.container}>
      <View style={styles.scrollContainer}>
        <ScrollView>
          {/* Content */}
        </ScrollView>
      </View>
    </View>
  );
}
```

## Animation Strategy

### ✅ **Moti**: For simple, declarative animations
```typescript
<MotiView animate={{ opacity: 1 }} />
```

### ✅ **Reanimated**: For complex, performance-critical animations
```typescript
// Worklets, shared values, gesture handling
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: x.value }],
}));
```

## Summary

The most reliable flex system combines:
1. **Fixed semantic heights** for navigation elements
2. **Dynamic safe area calculations** for device adaptation
3. **Bounded containers** with overflow hidden
4. **Consistent spacing units** throughout the app

This approach ensures professional, platform-compliant layouts that work reliably across all device types and sizes.