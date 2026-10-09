import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  Animated,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Fonts } from '../theme/fonts';

export type ButtonVariant = 'number' | 'action' | 'operator' | 'scientific';

interface CalcButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  isDouble?: boolean;
  isSmall?: boolean;
  customStyle?: ViewStyle;
}

export const CalcButton: React.FC<CalcButtonProps> = ({
  label,
  onPress,
  variant = 'number',
  isDouble = false,
  isSmall = false,
  customStyle,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const getBackgroundColor = (pressed: boolean) => {
    switch (variant) {
      case 'operator':
        return pressed ? theme.btnOperatorPressed : theme.btnOperatorBg;
      case 'action':
        return pressed ? theme.surfaceHighlight : theme.btnActionBg;
      case 'scientific':
        return pressed ? theme.surfaceHighlight : theme.btnScientificBg;
      case 'number':
      default:
        return pressed ? theme.surfaceHighlight : theme.btnNumberBg;
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'operator':
        return theme.btnOperatorText;
      case 'action':
        return theme.btnActionText;
      case 'scientific':
        return theme.btnScientificText;
      case 'number':
      default:
        return theme.btnNumberText;
    }
  };

  const getFontFamily = () => {
    if (variant === 'number' || label === '.' || label === '±') {
      return Fonts.monoMedium;
    }
    return Fonts.bold;
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        isDouble && styles.wrapperDouble,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.button,
          isSmall && styles.buttonSmall,
          isDouble && styles.buttonDouble,
          {
            backgroundColor: getBackgroundColor(pressed),
            borderColor:
              variant === 'scientific'
                ? theme.btnScientificBorder
                : variant === 'operator'
                ? 'rgba(255, 255, 255, 0.2)'
                : theme.btnNumberBorder,
          },
          customStyle,
        ]}
      >
        <Text
          style={[
            styles.text,
            isSmall && styles.textSmall,
            { color: getTextColor(), fontFamily: getFontFamily() },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    margin: 5,
  },
  wrapperDouble: {
    flex: 2.15,
  },
  button: {
    height: 66,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSmall: {
    height: 46,
    borderRadius: 14,
  },
  buttonDouble: {
    width: '100%',
  },
  text: {
    fontSize: 25,
    letterSpacing: 0.5,
  },
  textSmall: {
    fontSize: 15,
  },
});
