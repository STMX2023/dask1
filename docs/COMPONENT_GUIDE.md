# Component Building Guide

## Component Template

```typescript
import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import tw from '../utils/tw';

interface ComponentNameProps {
  // Props
}

// Pre-compute ALL styles at module level
const styles = {
  container: tw`flex-1 bg-white dark:bg-gray-900`,
  text: tw`text-lg font-bold text-gray-900 dark:text-white`,
};

export const ComponentName = memo<ComponentNameProps>(({ 
  prop1,
  prop2 
}) => {
  // Shared values for animations
  const animValue = useSharedValue(0);
  
  // Memoize calculations
  const computed = useMemo(() => {
    return heavyCalculation(prop1);
  }, [prop1]);
  
  // Memoize callbacks
  const handlePress = useCallback(() => {
    animValue.value = withTiming(1);
  }, [animValue]);
  
  // Animated styles
  const animStyle = useAnimatedStyle(() => ({
    opacity: animValue.value,
  }));
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animStyle]}>
        <Text style={styles.text}>Content</Text>
      </Animated.View>
    </View>
  );
}, (prev, next) => {
  // Custom comparison
  return prev.prop1 === next.prop1 && 
         prev.prop2 === next.prop2;
});

ComponentName.displayName = 'ComponentName';
```

## Style Rules

### ✅ DO
```typescript
// Module level
const styles = {
  container: tw`flex-1 p-4`,
  active: tw`bg-blue-500`,
  inactive: tw`bg-gray-200`,
};

// In component
<View style={styles.container} />
<View style={isActive ? styles.active : styles.inactive} />
```

### ❌ DON'T
```typescript
// In render
<View style={tw`flex-1 p-4 ${isDark ? 'bg-black' : 'bg-white'}`} />
<View style={[tw`flex-1`, tw`p-4`]} /> // Multiple tw calls
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

## Animation Rules

### ✅ DO
```typescript
// Reanimated 3 worklets - accessing .value in useAnimatedStyle is safe
const animStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: x.value }],
}));

// Timing for predictable animations
withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) })

// Spring for interactive
withSpring(1, { damping: 20, stiffness: 300 })

// Shared value mutations on UI thread
const handlePress = useCallback(() => {
  runOnUI(() => {
    'worklet';
    translateX.value = withTiming(100);
  })();
}, [translateX]);

// Layout callbacks with runOnUI
const handleLayout = useCallback((event) => {
  const { width } = event.nativeEvent.layout;
  runOnUI(() => {
    'worklet';
    containerWidth.value = width;
  })();
}, [containerWidth]);
```

### ❌ DON'T
```typescript
// React Native Animated API
Animated.timing(animValue, { ... })

// Long animations
withTiming(1, { duration: 1000 }) // Too slow

// ❌ CRITICAL: Never access .value during component render
const handlePress = () => {
  translateX.value = withTiming(100); // Causes render warning
};

// ❌ Direct mutation in layout callbacks
const handleLayout = (event) => {
  containerWidth.value = event.nativeEvent.layout.width; // Render warning
};

// ❌ Mutation in state setters during render
setExpanded(prev => {
  height.value = prev ? 100 : 200; // Causes render warning
  return !prev;
});
```

### 🚨 Critical Reanimated Rule
**Never access or modify shared values with `.value` during React's render phase!**

Always wrap shared value mutations in `runOnUI()`:
```typescript
// ✅ Correct
runOnUI(() => {
  'worklet';
  sharedValue.value = newValue;
})();

// ❌ Wrong - triggers "[Reanimated] Writing to `value` during component render"
sharedValue.value = newValue;
```

## Memoization Rules

### Always Memoize
1. Components with props: `memo(Component)`
2. Expensive calculations: `useMemo`
3. Event handlers: `useCallback`
4. Child components: Extract and memoize

### Skip Memoization
1. Primitives and strings
2. Empty dependencies
3. Single-use calculations

## Performance Patterns

### 1. Progressive Rendering
```typescript
const showContent = useDelayedMount(100);
return showContent ? <HeavyComponent /> : null;
```

### 2. List Optimization
```typescript
<FlatList
  data={items}
  keyExtractor={item => item.id}
  getItemLayout={(_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

### 3. Image Optimization
```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri }}
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

## State Management

### Component State
```typescript
// For UI state only
const [isOpen, setIsOpen] = useState(false);
```

### Global State (Zustand)
```typescript
// For shared data
const items = useAppStore(state => state.items);
const updateItem = useAppStore(state => state.updateItem);
```

### Animation State
```typescript
// For animations only
const translateX = useSharedValue(0);
```

## Common Optimizations

### 1. Static Extraction
```typescript
// Outside component
const CONSTANTS = { MAX_WIDTH: 300, PADDING: 16 };
const staticStyles = { wrapper: tw`flex-1` };
```

### 2. Early Returns
```typescript
if (!data) return null;
if (loading) return <LoadingFallback />;
```

### 3. Conditional Rendering
```typescript
{isVisible && <ExpensiveComponent />}  // Unmounts when hidden
```

### 4. Lazy Loading
```typescript
const LazyComponent = lazy(() => import('./HeavyComponent'));
```

## Gesture Handling

### Touch Feedback
```typescript
<Pressable
  onPressIn={() => haptics.selection()}
  style={({ pressed }) => [
    styles.button,
    pressed && { opacity: 0.7 }
  ]}
>
```

### Swipe Gestures
```typescript
// Use PanResponder for simple swipes
// Avoid react-native-gesture-handler unless necessary
```

## Testing Checklist

- [ ] Component wrapped with `memo`
- [ ] Display name set
- [ ] Styles pre-computed
- [ ] Callbacks memoized
- [ ] No inline styles
- [ ] No arrow functions in props
- [ ] Custom comparison function if needed
- [ ] TypeScript interfaces defined
- [ ] Dark mode supported
- [ ] Animations < 300ms
- [ ] **All shared value mutations wrapped in `runOnUI()`**
- [ ] No `.value` access during component render

## Quick Reference

```typescript
// Imports order
import React, { ... } from 'react';
import { View, Text, ... } from 'react-native';
import Animated, { ... } from 'react-native-reanimated';
import tw from '../utils/tw';
import { ComponentA, ComponentB } from '../components';
import { useCustomHook } from '../hooks';
import { utilityFunction } from '../utils';

// Module-level declarations
const CONSTANTS = { ... };
const styles = { ... };

// Component
export const Component = memo<Props>(({ ... }) => {
  // Hooks
  // Memoizations
  // Callbacks
  // Effects
  // Render
});

Component.displayName = 'Component';
```

## Anti-Patterns to Avoid

1. **Style Arrays**: `style={[style1, style2, style3]}`
2. **Inline Objects**: `style={{ flex: 1, padding: 16 }}`
3. **Anonymous Functions**: `onPress={() => doSomething()}`
4. **Nested Ternaries**: `style={a ? (b ? x : y) : z}`
5. **Large useEffects**: Split into focused effects
6. **Deep Props**: Pass only needed data
7. **Index as Key**: Use stable IDs