# React Native New Architecture: BEST PRACTICES Guide

---

## Architecture Overview

## This guide provides the foundational knowledge for implementing high-performance React Native applications using the New Architecture. Focus on architectural decisions that leverage the core pillars while maintaining strict adherence to performance-oriented development practices.

The New Architecture replaces the bridge-based system with a C++-centric foundation comprising four pillars:

### Core Components
- **JSI (JavaScript Interface):** Direct C++ communication eliminating serialization overhead
- **TurboModules:** Lazy-loaded native modules with synchronous/asynchronous call flexibility
- **Fabric:** Concurrent rendering system with thread separation and prioritized updates
- **Codegen:** Automated type-safe glue code generation from TypeScript/Flow specifications

---

## Performance Gains

- Synchronous native calls via shared memory references
- Lazy module loading reduces startup time by **500-1000ms**
- Concurrent rendering prevents UI jank through thread prioritization
- Compile-time type safety eliminates runtime bridge errors

---

## Project Initialization

### Setup Requirements
- React Native `0.77+` (New Architecture default since `0.76`)
- Expo SDK `53+` (auto-enabled since SDK 52)
- TypeScript for type safety and Codegen compatibility

### Configuration Steps
1. Enable `newArchEnabled: true` in `react-native.config.js`
2. Configure `codegenConfig` in `package.json` for custom modules
3. Validate dependencies with `npx expo-doctor`
4. Use `RCT_NEW_ARCH_ENABLED=1 pod install` for iOS

---

## TurboModules Implementation

### Spec File Structure
- **Prefix:** `Native*` for modules (e.g., `NativeStorage.ts`)
- **Suffix:** `*NativeComponent` for UI components
- TypeScript/Flow typing mandatory for Codegen

### Native Module Patterns
- Implement C++ core layer for cross-platform logic
- Use `TurboModuleRegistry.get()` for module access
- Leverage lazy loading for on-demand initialization

### Call Type Selection
- **Synchronous:** Only for instantaneous, non-blocking operations
- **Asynchronous:** All I/O, computation, or potentially blocking operations
- _Improper synchronous usage blocks JavaScript thread causing UI jank_

---

## Fabric UI Optimization

### Concurrent Rendering
- High-priority interactions run on main thread
- Background tasks offloaded to separate threads
- Automatic batching of state updates into single re-renders

### Component Design
- Functional components with Hooks preferred
- Separate presentational and container logic
- Implement `getItemLayout` for `VirtualizedList` optimization

### Layout System
- Yoga engine handles Flexbox calculations
- Synchronous layout reading for smooth animations
- Immutable UI tree prevents rendering glitches

---

## State Management Strategy

### Principles
- Localize state to smallest possible component scope
- Use immutable data structures for predictable updates
- Minimize state duplication through derived state patterns
- Implement memoization (`useMemo`, `useCallback`, `React.memo`)

### Global State Selection
- Context API for simple requirements
- Redux/MobX/Recoil for complex state management
- Selectors for derived state to prevent unnecessary re-renders

---

## Performance Optimization

### JavaScript Thread Management
- Remove `console.log` in production builds
- Offload heavy computations to background workers
- Test performance in release builds only
- Minimize string concatenation in JSX

### List Rendering
- Implement `getItemLayout` for `FlatList` optimization
- Consider FlashList or Legend List for large datasets
- Use `VirtualizedList` for complex list scenarios

### Native Integration
- Leverage direct host component access via JSI
- Design for GPU utilization where possible
- Prefer native components over JavaScript alternatives

---

## Dependency Management

### Compatibility Validation
- Use [React Native Directory](https://reactnative.directory/) for compatibility status
- Run `npx expo-doctor` for dependency validation
- Enable Interop Layers for legacy library support

### Migration Strategies
- Update libraries to latest versions first
- Replace incompatible libraries with alternatives
- Fork and modify libraries when necessary
- Temporarily remove problematic dependencies during development

---

## Code Quality Standards

### TypeScript Implementation
- Compile-time error detection
- Enhanced IDE support and autocomplete
- Self-documenting code through type annotations
- Seamless Codegen integration

### Component Architecture
- Modular design with clear separation of concerns
- Consistent import organization and aliasing
- Separate style definitions from component logic
- Future-proof design for React 18+ features

---

## Advanced Patterns

### Custom Native Modules
- Define clear TypeScript specifications
- Implement error handling with JavaScript propagation
- Use C++ core for shared logic across platforms
- Follow Codegen naming conventions strictly

### UI Component Optimization
- Leverage Fabric's concurrent features
- Implement proper memoization strategies
- Design for prioritized update scenarios
- Ensure deterministic rendering patterns

### Memory Management
- Utilize lazy loading for all non-critical modules
- Implement proper cleanup in component unmounting
- Monitor memory usage patterns in production
- Optimize asset loading and caching strategies

---


### Initial Setup
- [ ] Latest React Native version (`0.77+`)
- [ ] New Architecture enabled by default
- [ ] TypeScript configuration complete
- [ ] Codegen configuration in `package.json`
- [ ] Dependency compatibility validated

### Development Practices
- [ ] Synchronous calls only for immediate operations
- [ ] Proper memoization implementation
- [ ] Efficient state management patterns
- [ ] Optimized list rendering strategies
- [ ] Production build performance testing

### Quality Assurance
- [ ] Type safety enforced through Codegen
- [ ] Runtime error elimination
- [ ] Cross-platform consistency verification
- [ ] Performance benchmarking completed
- [ ] Future React feature compatibility

---

## Key Performance Metrics

### Benchmarks
- Startup time reduction: **500-1000ms average**
- Memory usage decrease through lazy loading
- UI responsiveness improvement via concurrent rendering
- Native call latency elimination through JSI

### Monitoring Points
- JavaScript thread utilization
- Native module loading patterns
- UI rendering frame rates
- Memory allocation patterns
- Bridge call elimination verification

---

> This guide provides the foundational knowledge for implementing high-performance React Native applications using the New Architecture. Focus on architectural decisions that leverage the core pillars while maintaining strict adherence to performance-oriented development practices.