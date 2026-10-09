import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useCalculator } from '../context/CalculatorContext';
import { useTheme } from '../theme/ThemeContext';
import { Fonts } from '../theme/fonts';
import { History, Sparkles, Settings } from 'lucide-react-native';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { state, toggleAngleMode, toggleCalculatorMode, setHistoryOpen } = useCalculator();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.surfaceBorder }]}>
      <View style={styles.leftGroup}>
        {/* DEG / RAD Switch */}
        <TouchableOpacity
          style={[
            styles.badge,
            { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder },
            state.angleMode === 'RAD' && { backgroundColor: theme.accentGlow, borderColor: theme.accent },
          ]}
          onPress={toggleAngleMode}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.badgeText,
              { color: theme.textMuted },
              state.angleMode === 'RAD' && { color: theme.accent },
            ]}
          >
            {state.angleMode}
          </Text>
        </TouchableOpacity>

        {/* Memory Indicator */}
        {state.memory !== '0' && (
          <View
            style={[
              styles.memoryBadge,
              {
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderColor: theme.btnOperatorBg,
              },
            ]}
          >
            <Text style={[styles.memoryText, { color: theme.btnOperatorBg }]}>M</Text>
          </View>
        )}
      </View>

      <View style={styles.rightGroup}>
        {/* Scientific Mode Toggle */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
            state.mode === 'scientific' && {
              backgroundColor: theme.accentGlow,
              borderColor: theme.accent,
            },
          ]}
          onPress={toggleCalculatorMode}
          activeOpacity={0.7}
        >
          <Sparkles
            size={18}
            color={state.mode === 'scientific' ? theme.accent : theme.textSecondary}
          />
        </TouchableOpacity>

        {/* History Drawer Toggle */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
          ]}
          onPress={() => setHistoryOpen(true)}
          activeOpacity={0.7}
        >
          <History size={18} color={theme.textSecondary} />
          {state.history.length > 0 && (
            <View style={[styles.historyDot, { backgroundColor: theme.accent }]} />
          )}
        </TouchableOpacity>

        {/* Settings / App Info Toggle */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
          ]}
          onPress={onOpenSettings}
          activeOpacity={0.7}
        >
          <Settings size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: Fonts.monoBold,
    letterSpacing: 0.5,
  },
  memoryBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9,
    borderWidth: 1,
  },
  memoryText: {
    fontSize: 12,
    fontFamily: Fonts.monoBold,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  historyDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
