// Layout Grid Templates
// Similar to color tokens, these provide consistent layout patterns across the app

import { ViewStyle } from 'react-native';

// Base grid containers
export const gridContainers = {
  // Full container that spans the entire available space
  fullContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row' as const,
  },
  
  // Two-column equal flex container
  twoColumnContainer: {
    position: 'absolute' as const,
    top: 16,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row' as const,
    paddingHorizontal: 24,
  },
} as const;

// Column definitions
export const gridColumns = {
  // Left column for grid layouts
  leftColumn: {
    flex: 1,
    flexDirection: 'column' as const,
    justifyContent: 'space-between' as const,
  },
  
  // Right column aligned to end
  rightColumn: {
    flex: 1,
    flexDirection: 'column' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-end' as const,
  },
  
  // Center column
  centerColumn: {
    flex: 1,
    flexDirection: 'column' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
} as const;

// Row definitions within columns
export const gridRows = {
  // Horizontal row with standard spacing
  horizontalRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  
  // Top row with bottom padding
  topRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
    paddingBottom: 8,
  },
  
  // Bottom row with top padding
  bottomRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
    paddingTop: 8,
  },
  
  // Single item container
  singleItem: {
    paddingBottom: 8,
  },
  
  // Empty spacer
  spacer: {},
} as const;

// Common spacing patterns
export const spacing = {
  standard: 16,
  compact: 8,
  wide: 24,
  narrow: 4,
} as const;

// Icon container templates
export const iconContainers = {
  // Circular icon container
  circularIcon: (size: number = 40): ViewStyle => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 1,
    backgroundColor: 'transparent' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }),
  
  // Square icon container
  squareIcon: (size: number = 48): ViewStyle => ({
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: size,
    height: size,
  }),
} as const;

// Pre-defined grid templates for common layouts
export const gridTemplates = {
  // 2x3 Navigation Grid (like home page nav bar)
  navigationGrid2x3: {
    container: gridContainers.twoColumnContainer,
    leftColumn: gridColumns.leftColumn,
    rightColumn: gridColumns.rightColumn,
    topRow: gridRows.topRow,
    bottomRow: gridRows.bottomRow,
    singleItem: gridRows.singleItem,
    spacer: gridRows.spacer,
  },
  
  // Three-row compact home layout with separate bordered sections
  navigationCompactHome: {
    container: {
      position: 'absolute' as const,
      top: 16,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'column' as const,
      paddingHorizontal: 24,
      gap: 12,
    },
    // First row: Camera + Mic + Timer
    topRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: 'transparent' as const,
    },
    topRowLeft: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 16,
    },
    topRowRight: {
      flex: 1,
      alignItems: 'flex-end' as const,
      justifyContent: 'center' as const,
    },
    // Second row: Empty section with arrows (optional)
    middleRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: 'transparent' as const,
      minHeight: 48,
    },
    // Third row: Home + Schedule + Settings + Start/Stop
    bottomRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      borderWidth: 1,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: 'transparent' as const,
    },
    bottomRowLeft: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 16,
    },
    bottomRowRight: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 16,
    },
    iconItem: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      width: 48,
      height: 48,
    },
  },
  
  // 1x3 Standard Navigation (like settings page)
  navigationGrid1x3: {
    container: {
      height: '100%' as const,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 24,
    },
    row: gridRows.horizontalRow,
  },
} as const;

// Utility function to get layout styles with proper typing
export const getLayoutStyles = <T extends keyof typeof gridTemplates>(templateName: T): typeof gridTemplates[T] => {
  return gridTemplates[templateName];
};

// Utility function to create custom grid
export const createCustomGrid = (columns: number, rows: number) => {
  return {
    container: {
      flexDirection: 'row' as const,
      flex: 1,
    },
    column: {
      flex: 1 / columns,
      flexDirection: 'column' as const,
      justifyContent: 'space-between' as const,
    },
    row: {
      flex: 1 / rows,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
  };
};