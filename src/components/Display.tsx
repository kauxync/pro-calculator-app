import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useCalculator } from '../context/CalculatorContext';
import { useTheme } from '../theme/ThemeContext';
import { Fonts } from '../theme/fonts';
import { formatDisplayExpression } from '../utils/format';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '../utils/haptics';
import { ParticleBurst } from './ParticleBurst';
import { Delete, Sparkles, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react-native';

export const Display: React.FC = () => {
  const {
    state,
    backspace,
    clearAll,
    setHistoryOpen,
    toggleCalculatorMode,
    setCursorPosition,
    moveCursorLeft,
    moveCursorRight,
    equals,
  } = useCalculator();
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textScaleAnim = useRef(new Animated.Value(1)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  const [copiedToast, setCopiedToast] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const prevDisplayRef = useRef(state.displayValue);

  // Blinking cursor animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Trigger text bounce on input change
  useEffect(() => {
    if (state.displayValue !== prevDisplayRef.current) {
      prevDisplayRef.current = state.displayValue;
      textScaleAnim.setValue(1.04);
      Animated.spring(textScaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [state.displayValue]);

  // Trigger error shake animation
  useEffect(() => {
    if (state.error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [state.error]);

  // Auto-scroll expression
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [state.expression]);

  // Neon breathing pulse on live preview
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.98,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Trigger particle burst on new completed history item
  useEffect(() => {
    if (state.history.length > 0 && !state.error) {
      setBurstKey((prev) => prev + 1);
    }
  }, [state.history.length]);

  // Copy to Clipboard with Animated Toast
  const handleCopy = async () => {
    const textToCopy = state.displayValue || state.expression;
    if (!textToCopy || textToCopy === '0') return;

    await Clipboard.setStringAsync(textToCopy);
    triggerSuccessHaptic();
    setCopiedToast(true);

    Animated.sequence([
      Animated.spring(toastAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.delay(1600),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setCopiedToast(false));
  };

  // Gesture PanResponder for Swipe Gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 25 || Math.abs(gestureState.dy) > 25
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;

        // Horizontal Swipes
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx < -40) {
            // Swipe Left -> Backspace at cursor
            triggerLightHaptic();
            backspace();
          } else if (dx > 40) {
            // Swipe Right -> Clear All
            triggerMediumHaptic();
            clearAll();
          }
        } else {
          // Vertical Swipes
          if (dy > 40) {
            // Swipe Down -> Open History
            triggerLightHaptic();
            setHistoryOpen(true);
          } else if (dy < -40) {
            // Swipe Up -> Toggle Scientific Mode
            triggerLightHaptic();
            toggleCalculatorMode();
          }
        }
      },
    })
  ).current;

  const rawExpr = state.expression || '';
  const hasExpression = Boolean(rawExpr && rawExpr !== '0');

  const getFontSize = () => {
    const len = rawExpr.length;
    if (len > 24) return 26;
    if (len > 16) return 34;
    if (len > 10) return 44;
    return 52;
  };

  const fontSize = getFontSize();
  const cursorPos = Math.max(0, Math.min(state.cursorPosition, rawExpr.length));

  // Render individual touchable characters so user can tap anywhere
  const renderInteractiveExpression = () => {
    if (!rawExpr || rawExpr === '0') {
      return (
        <TouchableOpacity
          style={styles.interactiveExprRow}
          onPress={() => setCursorPosition(0)}
          activeOpacity={0.7}
        >
          <Text style={[styles.charText, { fontSize, color: theme.textSecondary }]}>0</Text>
          <Animated.View
            style={[
              styles.cursorBar,
              {
                height: fontSize * 0.85,
                backgroundColor: theme.accent,
                opacity: cursorOpacity,
              },
            ]}
          />
        </TouchableOpacity>
      );
    }

    const chars = rawExpr.split('');

    return (
      <View style={styles.interactiveExprRow}>
        {/* Leading insertion point before first char */}
        <TouchableOpacity
          style={styles.charTouchLeading}
          onPress={() => setCursorPosition(0)}
          activeOpacity={0.6}
        >
          {cursorPos === 0 && (
            <Animated.View
              style={[
                styles.cursorBar,
                {
                  height: fontSize * 0.85,
                  backgroundColor: theme.accent,
                  opacity: cursorOpacity,
                },
              ]}
            />
          )}
        </TouchableOpacity>

        {chars.map((char, index) => {
          const isCursorHere = cursorPos === index + 1;
          const displayChar =
            char === '*'
              ? '×'
              : char === '/'
              ? '÷'
              : char === '-'
              ? '−'
              : char;

          return (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.charTouch}
                onPress={() => setCursorPosition(index + 1)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.charText,
                    {
                      fontSize,
                      color: state.error
                        ? theme.danger
                        : /[0-9.]/.test(char)
                        ? theme.text
                        : theme.accent,
                    },
                  ]}
                >
                  {displayChar}
                </Text>
              </TouchableOpacity>

              {/* Blinking Cursor Bar */}
              {isCursorHere && (
                <Animated.View
                  style={[
                    styles.cursorBar,
                    {
                      height: fontSize * 0.85,
                      backgroundColor: theme.accent,
                      opacity: cursorOpacity,
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Particle Burst FX */}
      <ParticleBurst triggerKey={burstKey} color={theme.accent} />

      {/* Floating Copied Toast Pill */}
      {copiedToast && (
        <Animated.View
          style={[
            styles.copiedToast,
            {
              backgroundColor: theme.surfaceHighlight,
              borderColor: theme.accent,
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
                { scale: toastAnim },
              ],
            },
          ]}
        >
          <Check size={14} color={theme.success} />
          <Text style={[styles.copiedText, { color: theme.text }]}>
            Copied to Clipboard!
          </Text>
        </Animated.View>
      )}

      {/* Top Error Alert (if present) */}
      {state.error && (
        <View style={styles.topErrorRow}>
          <View
            style={[
              styles.errorBadge,
              {
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderColor: theme.danger,
              },
            ]}
          >
            <Text style={[styles.errorText, { color: theme.danger }]}>{state.error}</Text>
          </View>
        </View>
      )}

      {/* 1. Main Animated Expression Display with Interactive Cursor */}
      <Animated.View
        style={[
          styles.displayWrapper,
          {
            transform: [{ translateX: shakeAnim }, { scale: textScaleAnim }],
          },
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          {renderInteractiveExpression()}
        </ScrollView>
      </Animated.View>

      {/* 2. Live Preview Result Pill with Breathing Glow & Tap to Commit */}
      <View style={styles.previewContainer}>
        {state.previewResult && !state.error && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerSuccessHaptic();
              equals();
            }}
          >
            <Animated.View
              style={[
                styles.previewPill,
                {
                  backgroundColor: theme.accentGlow,
                  borderColor: theme.accent,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Sparkles size={14} color={theme.accent} />
              <Text style={[styles.previewText, { color: theme.accent }]}>
                = {state.previewResult}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. Bottom Control Bar: Below Display & Result */}
      <View style={styles.bottomControlBar}>
        {/* Left: Tap to Copy Button */}
        <TouchableOpacity
          style={[
            styles.copyHintBtn,
            { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder },
          ]}
          onPress={handleCopy}
          activeOpacity={0.7}
        >
          <Copy size={13} color={theme.textSecondary} />
          <Text style={[styles.copyHintText, { color: theme.textSecondary }]}>Tap to copy</Text>
        </TouchableOpacity>

        {/* Right: Cursor Navigation Nudge Box & Backspace */}
        <View style={styles.cursorControlsGroup}>
          {hasExpression && (
            <View
              style={[
                styles.cursorNudgeBox,
                { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder },
              ]}
            >
              <TouchableOpacity
                style={styles.nudgeBtn}
                onPress={moveCursorLeft}
                activeOpacity={0.6}
              >
                <ChevronLeft size={16} color={theme.textSecondary} />
              </TouchableOpacity>

              <View style={[styles.nudgeDivider, { backgroundColor: theme.surfaceBorder }]} />

              <TouchableOpacity
                style={styles.nudgeBtn}
                onPress={moveCursorRight}
                activeOpacity={0.6}
              >
                <ChevronRight size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {hasExpression && (
            <TouchableOpacity
              style={[
                styles.backspaceBtn,
                {
                  backgroundColor: theme.surfaceLight,
                  borderColor: theme.surfaceBorder,
                },
              ]}
              onPress={backspace}
              activeOpacity={0.6}
            >
              <Delete size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 4,
    position: 'relative',
  },
  copiedToast: {
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  copiedText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
  },
  topErrorRow: {
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  errorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    letterSpacing: 0.5,
  },
  displayWrapper: {
    width: '100%',
  },
  scrollView: {
    maxHeight: 90,
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
  interactiveExprRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  charTouchLeading: {
    paddingVertical: 6,
    paddingHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 10,
  },
  charTouch: {
    paddingVertical: 6,
    paddingHorizontal: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  charText: {
    fontFamily: Fonts.monoMedium,
    letterSpacing: 0.5,
  },
  cursorBar: {
    width: 2.5,
    borderRadius: 1.5,
    marginHorizontal: 1.5,
  },
  previewContainer: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 6,
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewText: {
    fontSize: 18,
    fontFamily: Fonts.monoBold,
  },
  bottomControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 34,
    marginTop: 2,
    marginBottom: 4,
  },
  copyHintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  copyHintText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
  },
  cursorControlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cursorNudgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  nudgeBtn: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nudgeDivider: {
    width: 1,
    height: 16,
  },
  backspaceBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
