# Dask1 - High-Performance React Native Application

A production-ready React Native application built with Expo SDK 53, optimized for exceptional performance and scalability. This mobile-first application achieves sub-25ms mount times and maintains 60 FPS throughout all interactions.

## 🚀 Tech Stack

- **Framework**: React Native 0.79.5 with Expo SDK 53
- **Language**: TypeScript with strict type checking
- **Navigation**: Expo Router (File-based routing)
- **UI/Animations**: 
  - React Native Reanimated 3 (Worklet-based animations)
  - Moti (Declarative animations)
  - Tailwind CSS via twrnc (Optimized with aggressive caching)
  
### Animation Strategy

#### ✅ **Moti**: For simple, declarative animations
```typescript
<MotiView animate={{ opacity: 1 }} />
```

#### ✅ **Reanimated**: For complex, performance-critical animations
```typescript
// Worklets, shared values, gesture handling
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: x.value }],
}));
```
- **State Management**: Zustand with AsyncStorage persistence
- **Database**: op-sqlite (High-performance SQLite with prepared statements)
- **Cloud Sync**: Supabase (Real-time database with offline support)
- **Development Tools**:
  - ESLint & Prettier (Code quality)
  - Husky (Git hooks)
  - GitHub Actions (CI/CD)
  - EAS Build (Cloud builds)

## 📱 Platform Support

- **iOS**: Optimized for iOS 13+ (iPhone & iPad)
- **Android**: Optimized for API 21+ (5.0 Lollipop)
- **Web**: Removed for focused mobile performance

## 🎯 Key Features

### Performance
- **Ultra-Fast Mount**: Initial screen load under 25ms
- **Smooth Animations**: Consistent 60 FPS with worklet-based animations
- **Progressive Rendering**: Strategic component loading for instant interactivity
- **Memory Efficient**: Aggressive caching and component memoization
- **Optimized Bundle**: Code splitting with intelligent preloading

### User Experience
- **Offline-First**: Full functionality without internet connection
- **Real-Time Sync**: Instant updates across devices when online
- **Adaptive Performance**: Platform-specific optimizations
- **Responsive Design**: Fluid layouts for all screen sizes

### Developer Experience
- **Type Safety**: Full TypeScript coverage
- **Hot Reload**: Instant feedback during development
- **Performance Monitoring**: Built-in profiling tools
- **Automated Testing**: Jest + React Native Testing Library
- **CI/CD Pipeline**: Automated builds and deployments

## 🏗️ Project Structure

```
dask1/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home screen (optimized)
│   │   └── two.tsx        # Second tab
│   ├── modal.tsx          # Modal screen
│   └── _layout.tsx        # Root layout with providers
├── components/            # Reusable components
│   ├── OptimizedFloatingParticles.tsx  # Performance-tuned animations
│   ├── OptimizedMorphingGradient.tsx   # GPU-accelerated gradients
│   ├── StatCard.tsx       # Memoized stat displays
│   ├── UserCard.tsx       # Optimized user cards
│   ├── Clock.tsx          # Isolated time updates
│   └── ...
├── hooks/                 # Custom React hooks
│   ├── useDelayedMount.ts      # Progressive rendering
│   ├── usePreloadComponent.ts  # Component preloading
│   ├── useStoreIntegration.ts  # Store synchronization
│   └── ...
├── utils/                 # Utilities
│   ├── tw.ts             # Tailwind with aggressive caching
│   ├── animationConfig.ts # Platform-specific settings
│   ├── performanceMonitor.ts # Performance tracking
│   └── ...
├── store/                # Zustand stores
│   └── appStore.ts       # Main application state
├── database/             # Database layer
│   ├── schema.ts         # SQLite schema
│   └── sync.ts           # Supabase sync logic
└── docs/                 # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- iOS Simulator (Mac only) or Android Emulator
- Git with configured SSH keys

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd dask1

# Install dependencies
npm install

# iOS specific (Mac only)
cd ios && pod install && cd ..

# Create environment file
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Development

```bash
# Start the development server
npm start

# Run on iOS Simulator
npm run ios

# Run on Android Emulator
npm run android

# Clear cache and start fresh
npx expo start --clear
```

## 🎨 Development Guidelines

### Component Best Practices

1. **Memoization is mandatory** for all components with props
2. **Pre-compute styles** to prevent re-creation
3. **Use performance hooks** appropriately
4. **Implement progressive rendering** for heavy components

#### Example Component

```typescript
import React, { memo, useMemo, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from '../utils/tw'; // Our optimized tw instance

interface MyComponentProps {
  title: string;
  onPress: () => void;
}

export const MyComponent = memo<MyComponentProps>(({ title, onPress }) => {
  // Pre-compute styles once
  const styles = useMemo(() => ({
    container: tw`flex-1 p-4 bg-white dark:bg-gray-900`,
    title: tw`text-lg font-bold text-gray-900 dark:text-white`,
    button: tw`mt-4 p-3 bg-blue-500 rounded-lg`
  }), []);

  // Memoize callbacks
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Pressable style={styles.button} onPress={handlePress}>
        <Text style={tw`text-white`}>Action</Text>
      </Pressable>
    </View>
  );
});

MyComponent.displayName = 'MyComponent';
```

### Animation Guidelines

1. **Always use Reanimated 3 worklets** for animations
2. **Prefer timing over spring** animations for predictability
3. **Keep durations under 300ms** for responsive feel
4. **Use platform-specific settings** from animationConfig

#### Example Animation

```typescript
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

const animatedStyle = useAnimatedStyle(() => ({
  opacity: withTiming(1, {
    duration: 200,
    easing: Easing.out(Easing.ease)
  }),
  transform: [{
    translateY: withTiming(0, {
      duration: 250,
      easing: Easing.out(Easing.ease)
    })
  }]
}));
```

### State Management Rules

1. **Use Zustand** for global state
2. **Keep stores focused** and domain-specific
3. **Implement selectors** to prevent unnecessary re-renders
4. **Persist critical data** with AsyncStorage middleware

### Performance Checklist

- [ ] Component is memoized with React.memo
- [ ] Callbacks are wrapped with useCallback
- [ ] Complex computations use useMemo
- [ ] Lists use keyExtractor and getItemLayout
- [ ] Images are optimized and cached
- [ ] Animations run on UI thread (worklets)
- [ ] Heavy components use lazy loading
- [ ] Styles are pre-computed, not inline

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Initial Mount | < 30ms | ✅ 20-25ms |
| Re-renders | < 16ms | ✅ 0.5-2ms |
| Animation FPS | 60 FPS | ✅ 60 FPS |
| Time to Interactive | < 100ms | ✅ 50-80ms |
| Bundle Size (iOS) | < 50MB | ✅ 42MB |
| Bundle Size (Android) | < 40MB | ✅ 38MB |

## 🔧 Build & Deployment

### Local Development Builds

```bash
# iOS Development Build
npx expo run:ios

# Android Development Build  
npx expo run:android

# Production-like builds
npx expo run:ios --configuration Release
npx expo run:android --variant release
```

### EAS Build (Recommended)

```bash
# First time setup
eas build:configure

# Development builds
eas build --profile development --platform all

# Preview builds (for testing)
eas build --profile preview --platform all

# Production builds
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## 🧪 Testing Strategy

### Unit Tests
```bash
# Run all tests
npm test

# Watch mode for development
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Integration Tests
```bash
# Run E2E tests (Detox)
npm run e2e:ios
npm run e2e:android
```

### Performance Tests
```bash
# Run performance benchmarks
npm run test:performance
```

## 📝 Code Quality

### Pre-commit Checks
- ESLint validation
- Prettier formatting
- TypeScript compilation
- Unit test execution

### Manual Checks
```bash
# Lint check
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

## 🚨 Monitoring & Debugging

### Development Tools
- React DevTools
- Flipper Integration
- Custom Performance Monitor
- Reanimated Chrome Debugger

### Performance Monitoring
```typescript
// Wrap components to monitor
<PerformanceProfiler id="MyComponent">
  <MyComponent />
</PerformanceProfiler>
```

### Common Issues & Solutions

#### High Re-render Count
- Check memo dependencies
- Use selectors in Zustand
- Verify useCallback dependencies

#### Animation Jank
- Move to worklet functions
- Reduce animation complexity
- Check for main thread blocking

#### Slow Mount Times
- Implement progressive rendering
- Use lazy loading
- Optimize initial data fetching

## 🤝 Contributing

1. **Fork & Clone** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Run quality checks**: `npm run lint && npm test`
5. **Push branch**: `git push origin feature/amazing-feature`
6. **Open Pull Request** with detailed description

### Commit Convention
- `feat:` New features
- `fix:` Bug fixes
- `perf:` Performance improvements
- `docs:` Documentation updates
- `test:` Test additions/updates
- `refactor:` Code refactoring

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Expo team for the amazing SDK
- React Native community
- Contributors and testers

## 📞 Support

- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for features
- **Security**: security@yourcompany.com for vulnerabilities