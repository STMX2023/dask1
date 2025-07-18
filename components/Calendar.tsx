import React, { useState, memo, useCallback, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import tw from '../utils/tw';
import { getTheme } from '../constants/Colors';
import { useIsDarkMode } from '../store/useAppStore';

interface CalendarProps {
  animationKey?: number;
}

interface CalendarDayProps {
  day: number | string;
  isEmpty: boolean;
  isSelected: boolean;
  isToday: boolean;
  theme: ReturnType<typeof getTheme>;
  onPress: (day: number) => void;
}

const CalendarDay = memo(
  ({ day, isEmpty, isSelected, isToday, theme, onPress }: CalendarDayProps) => {
    const handlePress = useCallback(() => {
      if (!isEmpty && typeof day === 'number') {
        onPress(day);
      }
    }, [day, isEmpty, onPress]);

    const dayContainerStyle = useMemo(
      () => [
        tw`w-9 h-9 rounded-full items-center justify-center`,
        {
          backgroundColor: isSelected
            ? theme.textPrimary
            : isToday
              ? theme.surfaceSecondary
              : 'transparent',
        },
      ],
      [isSelected, isToday, theme],
    );

    const dayTextStyle = useMemo(
      () => [
        tw`text-xl`,
        {
          color: isSelected ? theme.background : isToday ? theme.textPrimary : theme.textSecondary,
          fontWeight: isToday || isSelected ? '600' : '400',
        },
      ],
      [isSelected, isToday, theme],
    );

    return (
      <Pressable
        onPress={isEmpty ? undefined : handlePress}
        disabled={isEmpty}
        style={tw`w-1/7 items-center py-4`}
      >
        {!isEmpty && (
          <View style={dayContainerStyle}>
            <Text style={dayTextStyle}>{day}</Text>
          </View>
        )}
      </Pressable>
    );
  },
);

CalendarDay.displayName = 'CalendarDay';

const Calendar = memo(({ animationKey = 0 }: CalendarProps) => {
  const isDark = useIsDarkMode();
  const theme = getTheme(isDark);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDatePress = useCallback((day: number) => {
    setSelectedDate(day);
  }, []);

  // Generate calendar days
  const calendarDays = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ day: '', isEmpty: true });
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isEmpty: false });
  }

  // Add empty cells to complete the grid
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push({ day: '', isEmpty: true });
  }

  return (
    <MotiView
      key={`calendar-${String(animationKey)}`}
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 150, type: 'timing', duration: 200 }}
      style={tw`mt-1`}
    >
      {/* Month and Year Header */}
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={[tw`text-3xl font-bold`, { color: theme.textPrimary }]}>
          {monthNames[currentMonth]}
        </Text>
        <Text style={[tw`text-xl`, { color: theme.textSecondary }]}>{currentYear}</Text>
      </View>

      {/* Week days header */}
      <View style={tw`flex-row mb-0`}>
        {weekDays.map((day) => (
          <View key={day} style={tw`flex-1 items-center py-2`}>
            <Text style={[tw`text-sm font-medium`, { color: theme.textTertiary }]}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={tw`flex-row flex-wrap`}>
        {calendarDays.map((item, index) => (
          <CalendarDay
            key={`calendar-day-${String(currentMonth)}-${String(currentYear)}-${item.isEmpty ? `empty-${String(index)}` : String(item.day)}`}
            day={item.day}
            isEmpty={item.isEmpty}
            isSelected={item.day === selectedDate}
            isToday={item.day === currentDate.getDate()}
            theme={theme}
            onPress={handleDatePress}
          />
        ))}
      </View>
    </MotiView>
  );
});

Calendar.displayName = 'Calendar';

export { Calendar };
