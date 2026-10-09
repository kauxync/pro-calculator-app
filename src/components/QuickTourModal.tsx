import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Fonts } from '../theme/fonts';
import { triggerLightHaptic, triggerSuccessHaptic } from '../utils/haptics';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  MousePointerClick,
  Sliders,
  History,
  Compass,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: 'top' | 'middle' | 'bottom';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'display',
    title: 'Tap Cursor & Gesture Display',
    description:
      'Tap between any numbers to place the cursor. Swipe left to backspace, swipe right to clear (AC), or long-press to copy.',
    icon: <MousePointerClick size={22} color="#38BDF8" />,
    position: 'top',
  },
  {
    id: 'toolbar',
    title: 'Cursor Nudge & Fast Copy',
    description:
      'Use the ◀ and ▶ arrow buttons below the screen to step the cursor precisely anywhere inside your equation or result.',
    icon: <Sliders size={22} color="#F59E0B" />,
    position: 'middle',
  },
  {
    id: 'scientific',
    title: 'Full Scientific Suite',
    description:
      'Tap the ✨ icon in the top right to replace the keypad with a 5-column scientific console featuring DEG/RAD, trig, logs, roots, and memory.',
    icon: <Compass size={22} color="#A855F7" />,
    position: 'top',
  },
  {
    id: 'history',
    title: 'Persistent Offline History',
    description:
      'Tap the 🕒 clock icon to view past calculations. Tap any record to immediately reload the equation or result into your display.',
    icon: <History size={22} color="#10B981" />,
    position: 'top',
  },
  {
    id: 'themes',
    title: 'Color Themes & App Info',
    description:
      'Tap the ⚙️ settings icon to customize color themes across 8 curated OLED Dark and Minimalist Light palettes.',
    icon: <Sparkles size={22} color="#EC4899" />,
    position: 'top',
  },
];

interface QuickTourModalProps {
  visible: boolean;
  onClose: () => void;
}

export const QuickTourModal: React.FC<QuickTourModalProps> = ({ visible, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseRingAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setStepIndex(0);
      fadeAnim.setValue(0);
      cardScaleAnim.setValue(0.9);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(cardScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseRingAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseRingAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleNext = () => {
    triggerLightHaptic();
    if (stepIndex < TOUR_STEPS.length - 1) {
      cardScaleAnim.setValue(0.94);
      Animated.spring(cardScaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
      setStepIndex(stepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    triggerLightHaptic();
    if (stepIndex > 0) {
      cardScaleAnim.setValue(0.94);
      Animated.spring(cardScaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
      setStepIndex(stepIndex - 1);
    }
  };

  const handleFinish = () => {
    triggerSuccessHaptic();
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  if (!visible) return null;

  const currentStep = TOUR_STEPS[stepIndex];
  const isLastStep = stepIndex === TOUR_STEPS.length - 1;

  return (
    <Modal visible={visible} transparent={true} animationType="none">
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <View
          style={[
            styles.container,
            {
              paddingTop: Math.max(insets.top, 20),
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          {/* Top Skip Bar */}
          <View style={styles.topBar}>
            <View style={[styles.badgePill, { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder }]}>
              <Sparkles size={13} color={theme.accent} />
              <Text style={[styles.badgeText, { color: theme.accent }]}>FEATURE TOUR</Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.surfaceLight }]}
              onPress={handleFinish}
              activeOpacity={0.7}
            >
              <X size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Center / Highlight Area */}
          <View style={styles.centerContainer}>
            {/* Animated Spotlight Card */}
            <Animated.View
              style={[
                styles.tourCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.accent,
                  transform: [{ scale: cardScaleAnim }],
                },
              ]}
            >
              {/* Step indicator pill & icon */}
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconCircle, { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder }]}>
                  {currentStep.icon}
                </View>

                <View style={[styles.stepCountPill, { backgroundColor: theme.accentGlow }]}>
                  <Text style={[styles.stepCountText, { color: theme.accent }]}>
                    {stepIndex + 1} / {TOUR_STEPS.length}
                  </Text>
                </View>
              </View>

              {/* Title & Description */}
              <Text style={[styles.cardTitle, { color: theme.text }]}>{currentStep.title}</Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                {currentStep.description}
              </Text>

              {/* Step Dots */}
              <View style={styles.dotsRow}>
                {TOUR_STEPS.map((_, idx) => {
                  const isActive = idx === stepIndex;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.dot,
                        isActive
                          ? [styles.dotActive, { backgroundColor: theme.accent }]
                          : [styles.dotInactive, { backgroundColor: theme.surfaceHighlight }],
                      ]}
                    />
                  );
                })}
              </View>

              {/* Card Bottom Actions */}
              <View style={styles.cardActions}>
                {stepIndex > 0 ? (
                  <TouchableOpacity
                    style={[styles.prevBtn, { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder }]}
                    onPress={handlePrev}
                    activeOpacity={0.7}
                  >
                    <ArrowLeft size={16} color={theme.textSecondary} />
                    <Text style={[styles.prevBtnText, { color: theme.textSecondary }]}>Back</Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}

                <TouchableOpacity
                  style={[styles.nextBtn, { backgroundColor: theme.accent }]}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextBtnText}>
                    {isLastStep ? 'Got It!' : 'Next Tip'}
                  </Text>
                  {isLastStep ? (
                    <CheckCircle2 size={16} color="#FFFFFF" />
                  ) : (
                    <ArrowRight size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  stepCountPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepCountText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Fonts.regular,
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
  },
  dotInactive: {
    width: 6,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  prevBtnText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  nextBtnText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
});

