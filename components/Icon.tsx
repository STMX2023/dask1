import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

type IconFamily = 'FontAwesome' | 'Ionicons';

interface IconProps {
  family: IconFamily;
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

// Icon component that allows selective icon family imports
export const Icon: React.FC<IconProps> = ({
  family,
  name,
  size = 24,
  color = '#000000',
  style,
}) => {
  const props = { name, size, color, style };

  switch (family) {
    case 'FontAwesome':
      return <FontAwesome {...props} name={name as keyof typeof FontAwesome.glyphMap} />;
    case 'Ionicons':
      return <Ionicons {...props} name={name as keyof typeof Ionicons.glyphMap} />;
    default:
      return null;
  }
};

// Pre-configured icon components for common use cases
const tabIconStyle = { marginBottom: -3 };

export const TabIcon = ({ name, color }: { name: string; color: string }) => (
  <Icon family="FontAwesome" name={name} size={28} color={color} style={tabIconStyle} />
);

export const HeaderIcon = ({ name, color }: { name: string; color: string }) => (
  <Icon family="FontAwesome" name={name} size={25} color={color} />
);
