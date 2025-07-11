import { lazy } from 'react';

// Lazy load heavy components
export const LazyActivityList = lazy(() => import('./ActivityList').then(module => ({ default: module.ActivityList })));

// Optimized components (not lazy loaded as they're already optimized)
export { OptimizedFloatingParticles } from './OptimizedFloatingParticles';
export { OptimizedMorphingGradient } from './OptimizedMorphingGradient';
export { OptimizedParallaxScroll } from './OptimizedParallaxScroll';