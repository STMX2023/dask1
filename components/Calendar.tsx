import React, { useState, memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MotiView } from 'moti';
import tw from '../utils/tw';
import { getTheme } from '../constants/Colors';
import { useIsDarkMode } from '../store/useAppStore';

interface CalendarProps {
  animationKey?: number;
}

const Calendar = memo(({ animationKey = 0 }: CalendarProps) => {
  const isDark = useIsDarkMode();
  const theme = getTheme(isDark);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
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
      key={`calendar-${animationKey}`}
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: 150, type: 'timing', duration: 200 }}
      style={tw`mt-1`}
    >
      {/* Month and Year Header */}
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={tw.style('text-3xl font-bold', { color: theme.textPrimary })}>
          {monthNames[currentMonth]}
        </Text>
        <Text style={tw.style('text-xl', { color: theme.textSecondary })}>
          {currentYear}
        </Text>
      </View>
      
      {/* Week days header */}
      <View style={tw`flex-row mb-0`}>
        {weekDays.map((day) => (
          <View key={day} style={tw`flex-1 items-center py-2`}>
            <Text style={tw.style('text-sm font-medium', { color: theme.textTertiary })}>
              {day}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Calendar Grid */}
      <View style={tw`flex-row flex-wrap`}>
        {calendarDays.map((item, index) => (
          <Pressable
            key={index}
            onPress={() => !item.isEmpty && setSelectedDate(item.day as number)}
            disabled={item.isEmpty}
            style={tw`w-1/7 items-center py-4`}
          >
            {!item.isEmpty && (
              <View
                style={[
                  tw`w-9 h-9 rounded-full items-center justify-center`,
                  {
                    backgroundColor: 
                      item.day === selectedDate 
                        ? theme.textPrimary 
                        : item.day === currentDate.getDate() 
                          ? theme.surfaceSecondary 
                          : 'transparent',
                  }
                ]}
              >
                <Text
                  style={[
                    tw`text-xl`,
                    {
                      color: 
                        item.day === selectedDate 
                          ? theme.background 
                          : item.day === currentDate.getDate()
                            ? theme.textPrimary
                            : theme.textSecondary,
                      fontWeight: 
                        item.day === currentDate.getDate() || item.day === selectedDate
                          ? '600' 
                          : '400',
                    }
                  ]}
                >
                  {item.day}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
      
    </MotiView>
  );
});

Calendar.displayName = 'Calendar';

export { Calendar };