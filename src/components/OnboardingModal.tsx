import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { ThemePalette } from '../theme/themes';
import { Fonts } from '../theme/fonts';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '../utils/haptics';
import {
  Zap,
  Sparkles,
  Compass,
  Palette,
  ArrowRight,
  CheckCircle2,
  Check,
  Moon,
  Sun,
  Plus,
  RefreshCw,
} from 'lucide-react-native';
import Decimal from 'decimal.js';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const ONBOARDING_STORAGE_KEY = '@has_seen_onboarding_v1';

// Floating Ambient Math Glyph
const FloatingGlyph: React.FC<{ symbol: string; x: number; y: number; delay: number; color: string }> = ({
  symbol,
  x,
  y,
  delay,
  color,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 10],
  });

  const rotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '8deg'],
  });

  return (
    <Animated.View
      style={[
        styles.floatingGlyph,
        {
          left: x,
          top: y,
          opacity: 0.22,
          transform: [{ translateY }, { rotate }],
        },
      ]}
      pointerEvents="none"
    >
      <Text style={[styles.glyphText, { color }]}>{symbol}</Text>
    </Animated.View>
  );
};

export const OnboardingModal: React.FC<{ visible: boolean; onFinish: (startTour?: boolean) => void }> = ({
  visible,
  onFinish,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme, themeId, setTheme, availableThemes } = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Slide 1: Interactive Live Counter State
  const [interactiveCount, setInteractiveCount] = useState<Decimal>(new Decimal(0));
  const countScaleAnim = useRef(new Animated.Value(1)).current;

  // Slide 2: Interactive Trig Widget State
  const [activeTrigTab, setActiveTrigTab] = useState<'sin' | 'sqrt' | 'fact'>('sin');

  const handleAddFloat = () => {
    triggerLightHaptic();
    setInteractiveCount((prev) => prev.plus('0.1'));
    countScaleAnim.setValue(1.15);
    Animated.spring(countScaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const handleResetFloat = () => {
    triggerLightHaptic();
    setInteractiveCount(new Decimal(0));
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index <= 2) {
      setCurrentIndex(index);
      triggerLightHaptic();
    }
  };

  const handleNext = async () => {
    if (currentIndex < 2) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      await handleComplete(true);
    }
  };

  const handleComplete = async (startTour: boolean = true) => {
    triggerSuccessHaptic();
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (e) {
      console.error('Failed to save onboarding status', e);
    }
    onFinish(startTour);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {/* Background Ambient Floating Math Glyphs */}
        <FloatingGlyph symbol="π" x={24} y={110} delay={0} color={theme.accent} />
        <FloatingGlyph symbol="√" x={SCREEN_WIDTH - 60} y={130} delay={400} color={theme.btnOperatorBg} />
        <FloatingGlyph symbol="∞" x={40} y={SCREEN_HEIGHT - 220} delay={800} color={theme.accent} />
        <FloatingGlyph symbol="∫" x={SCREEN_WIDTH - 50} y={SCREEN_HEIGHT - 240} delay={1200} color={theme.success} />
        <FloatingGlyph symbol="φ" x={SCREEN_WIDTH / 2 - 15} y={90} delay={600} color={theme.accent} />

        {/* Top Header */}
        <View style={styles.headerRow}>
          <View
            style={[
              styles.brandBadge,
              {
                backgroundColor: theme.surfaceLight,
                borderColor: theme.surfaceBorder,
              },
            ]}
          >
            <Sparkles size={13} color={theme.accent} />
            <Text style={[styles.brandText, { color: theme.accent }]}>PRO CALCULATOR</Text>
          </View>

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => handleComplete(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipText, { color: theme.textMuted }]}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Swipeable Carousel */}
        <FlatList
          ref={flatListRef}
          data={[0, 1, 2]}
          keyExtractor={(item) => item.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false, listener: handleScroll }
          )}
          scrollEventThrottle={16}
          style={styles.carousel}
          renderItem={({ item: slideIndex }) => {
            // SLIDE 1: INTERACTIVE ZERO-FLOAT ENGINE
            if (slideIndex === 0) {
              return (
                <View style={styles.slideContainer}>
                  <View
                    style={[
                      styles.contentCard,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.surfaceBorder,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.tagPill,
                        {
                          backgroundColor: theme.accentGlow,
                          borderColor: theme.accent,
                        },
                      ]}
                    >
                      <Zap size={13} color={theme.accent} />
                      <Text style={[styles.tagText, { color: theme.accent }]}>
                        ARBITRARY PRECISION
                      </Text>
                    </View>

                    <Text style={[styles.slideTitle, { color: theme.text }]}>
                      Zero Floating Dust
                    </Text>
                    <Text style={[styles.slideSubtitle, { color: theme.accent }]}>
                      Guaranteed Exact Arithmetic
                    </Text>

                    {/* Interactive Float Comparison Card */}
                    <View
                      style={[
                        styles.interactiveBox,
                        {
                          backgroundColor: theme.surfaceLight,
                          borderColor: theme.surfaceBorder,
                        },
                      ]}
                    >
                      {/* Standard JS Float Bug */}
                      <View style={styles.comparisonRow}>
                        <View style={styles.badgeLabel}>
                          <Text style={styles.bugBadgeText}>Standard JS</Text>
                        </View>
                        <Text style={[styles.bugMathText, { color: theme.danger }]}>
                          0.1 + 0.2 = 0.30000000000000004
                        </Text>
                      </View>

                      <View style={[styles.boxDivider, { backgroundColor: theme.surfaceBorder }]} />

                      {/* Pro Precision Engine Result */}
                      <View style={styles.comparisonRow}>
                        <View style={[styles.badgeLabel, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                          <Text style={[styles.proBadgeText, { color: theme.success }]}>Pro Engine</Text>
                        </View>
                        <Text style={[styles.proMathText, { color: theme.success }]}>
                          0.1 + 0.2 = 0.3 ✓
                        </Text>
                      </View>

                      {/* Live Interactive Counter */}
                      <View style={[styles.liveCounterContainer, { backgroundColor: theme.surface }]}>
                        <View style={styles.counterLeft}>
                          <Text style={[styles.counterLabel, { color: theme.textMuted }]}>
                            Live Decimal Test:
                          </Text>
                          <Animated.Text
                            style={[
                              styles.counterValue,
                              { color: theme.accent, transform: [{ scale: countScaleAnim }] },
                            ]}
                          >
                            {interactiveCount.toString()}
                          </Animated.Text>
                        </View>

                        <View style={styles.counterBtns}>
                          <TouchableOpacity
                            style={[styles.miniBtn, { backgroundColor: theme.accent }]}
                            onPress={handleAddFloat}
                            activeOpacity={0.7}
                          >
                            <Plus size={14} color="#FFFFFF" />
                            <Text style={styles.miniBtnText}>+0.1</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.miniIconBtn, { backgroundColor: theme.surfaceLight, borderColor: theme.surfaceBorder }]}
                            onPress={handleResetFloat}
                            activeOpacity={0.7}
                          >
                            <RefreshCw size={12} color={theme.textMuted} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    <Text style={[styles.slideDescription, { color: theme.textSecondary }]}>
                      No approximation artifacts. 36-digit Decimal core evaluates your expressions
                      with mathematical fidelity.
                    </Text>
                  </View>
                </View>
              );
            }

            // SLIDE 2: INTERACTIVE SCIENTIFIC PLAYGROUND
            if (slideIndex === 1) {
              return (
                <View style={styles.slideContainer}>
                  <View
                    style={[
                      styles.contentCard,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.surfaceBorder,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.tagPill,
                        {
                          backgroundColor: theme.accentGlow,
                          borderColor: theme.accent,
                        },
                      ]}
                    >
                      <Compass size={13} color={theme.accent} />
                      <Text style={[styles.tagText, { color: theme.accent }]}>
                        SCIENTIFIC SUITE
                      </Text>
                    </View>

                    <Text style={[styles.slideTitle, { color: theme.text }]}>
                      Advanced Functions
                    </Text>
                    <Text style={[styles.slideSubtitle, { color: theme.accent }]}>
                      DEG & RAD Trigonometry
                    </Text>

                    {/* Interactive Function Playground Box */}
                    <View
                      style={[
                        styles.interactiveBox,
                        {
                          backgroundColor: theme.surfaceLight,
                          borderColor: theme.surfaceBorder,
                        },
                      ]}
                    >
                      {/* Tabs */}
                      <View style={styles.tabRow}>
                        <TouchableOpacity
                          style={[
                            styles.tabBtn,
                            activeTrigTab === 'sin' && { backgroundColor: theme.accentGlow, borderColor: theme.accent, borderWidth: 1 },
                          ]}
                          onPress={() => {
                            triggerLightHaptic();
                            setActiveTrigTab('sin');
                          }}
                        >
                          <Text style={[styles.tabText, { color: activeTrigTab === 'sin' ? theme.accent : theme.textMuted }]}>
                            Trig
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.tabBtn,
                            activeTrigTab === 'sqrt' && { backgroundColor: theme.accentGlow, borderColor: theme.accent, borderWidth: 1 },
                          ]}
                          onPress={() => {
                            triggerLightHaptic();
                            setActiveTrigTab('sqrt');
                          }}
                        >
                          <Text style={[styles.tabText, { color: activeTrigTab === 'sqrt' ? theme.accent : theme.textMuted }]}>
                            Roots
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.tabBtn,
                            activeTrigTab === 'fact' && { backgroundColor: theme.accentGlow, borderColor: theme.accent, borderWidth: 1 },
                          ]}
                          onPress={() => {
                            triggerLightHaptic();
                            setActiveTrigTab('fact');
                          }}
                        >
                          <Text style={[styles.tabText, { color: activeTrigTab === 'fact' ? theme.accent : theme.textMuted }]}>
                            Discrete
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Display Equation Animation */}
                      <View style={[styles.formulaBox, { backgroundColor: theme.surface }]}>
                        {activeTrigTab === 'sin' && (
                          <View style={styles.formulaContent}>
                            <Text style={[styles.formulaEq, { color: theme.textSecondary }]}>
                              sin(30°) in DEG Mode
                            </Text>
                            <Text style={[styles.formulaRes, { color: theme.accent }]}>= 0.5</Text>
                          </View>
                        )}

                        {activeTrigTab === 'sqrt' && (
                          <View style={styles.formulaContent}>
                            <Text style={[styles.formulaEq, { color: theme.textSecondary }]}>
                              √(144) + ∛(27)
                            </Text>
                            <Text style={[styles.formulaRes, { color: theme.accent }]}>= 15</Text>
                          </View>
                        )}

                        {activeTrigTab === 'fact' && (
                          <View style={styles.formulaContent}>
                            <Text style={[styles.formulaEq, { color: theme.textSecondary }]}>
                              5! (Factorial) & 5 nCr 2
                            </Text>
                            <Text style={[styles.formulaRes, { color: theme.accent }]}>= 120 & 10</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Text style={[styles.slideDescription, { color: theme.textSecondary }]}>
                      Full inverse & hyperbolic curves, nth-powers, combinations, permutations,
                      and hardware memory registers (M+, M-, MR, MC).
                    </Text>
                  </View>
                </View>
              );
            }

            // SLIDE 3: INTERACTIVE THEME SHOWCASE
            return (
              <View style={styles.slideContainer}>
                <View
                  style={[
                    styles.contentCard,
                    styles.themePickerCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.surfaceBorder,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.tagPill,
                      {
                        backgroundColor: theme.accentGlow,
                        borderColor: theme.accent,
                      },
                    ]}
                  >
                    <Palette size={13} color={theme.accent} />
                    <Text style={[styles.tagText, { color: theme.accent }]}>
                      PERSONALIZE LOOK
                    </Text>
                  </View>

                  <Text style={[styles.slideTitle, { color: theme.text }]}>
                    Choose Your Theme
                  </Text>
                  <Text style={[styles.slideSubtitle, { color: theme.accent }]}>
                    Tap to Preview Live
                  </Text>

                  {/* Theme Grid */}
                  <ScrollView
                    style={styles.themeGridScroll}
                    contentContainerStyle={styles.themeGridContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {availableThemes.map((t: ThemePalette) => {
                      const isSelected = t.id === themeId;
                      return (
                        <TouchableOpacity
                          key={t.id}
                          onPress={() => {
                            triggerMediumHaptic();
                            setTheme(t.id);
                          }}
                          style={[
                            styles.themeTile,
                            {
                              backgroundColor: t.background,
                              borderColor: isSelected ? t.accent : t.surfaceBorder,
                              borderWidth: isSelected ? 2 : 1,
                            },
                            isSelected && styles.themeTileSelected,
                          ]}
                          activeOpacity={0.8}
                        >
                          {/* Top mini header */}
                          <View style={styles.tileHeader}>
                            <View style={styles.tileTitleRow}>
                              <Text
                                style={[
                                  styles.tileName,
                                  { color: isSelected ? t.accent : t.text },
                                ]}
                                numberOfLines={1}
                              >
                                {t.name}
                              </Text>
                              {t.isLight ? (
                                <Sun size={12} color="#EA580C" />
                              ) : (
                                <Moon size={12} color={t.accent} />
                              )}
                            </View>

                            {isSelected && (
                              <View style={[styles.tileCheck, { backgroundColor: t.accent }]}>
                                <Check size={11} color="#FFFFFF" />
                              </View>
                            )}
                          </View>

                          {/* Mini keypad preview pills */}
                          <View style={styles.miniKeypadRow}>
                            <View
                              style={[
                                styles.miniKey,
                                { backgroundColor: t.btnNumberBg, borderColor: t.btnNumberBorder },
                              ]}
                            >
                              <Text style={[styles.miniKeyText, { color: t.btnNumberText }]}>
                                7
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.miniKey,
                                { backgroundColor: t.btnActionBg, borderColor: t.btnActionBorder },
                              ]}
                            >
                              <Text style={[styles.miniKeyText, { color: t.btnActionText }]}>
                                AC
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.miniKey,
                                { backgroundColor: t.btnScientificBg, borderColor: t.btnScientificBorder },
                              ]}
                            >
                              <Text style={[styles.miniKeyText, { color: t.btnScientificText }]}>
                                sin
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.miniKey,
                                { backgroundColor: t.btnOperatorBg },
                              ]}
                            >
                              <Text style={[styles.miniKeyText, { color: t.btnOperatorText }]}>
                                =
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            );
          }}
        />

        {/* Bottom Navigation */}
        <View style={styles.bottomControls}>
          {/* Indicator Dots */}
          <View style={styles.dotsRow}>
            {[0, 1, 2].map((idx) => {
              const isActive = idx === currentIndex;
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

          {/* Next / Start Button */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: theme.accent,
                shadowColor: theme.accent,
              },
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>
              {currentIndex === 2 ? 'Start Quick Tour' : 'Next'}
            </Text>
            {currentIndex === 2 ? (
              <Compass size={18} color="#FFFFFF" />
            ) : (
              <ArrowRight size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative',
  },
  floatingGlyph: {
    position: 'absolute',
    zIndex: 0,
  },
  glyphText: {
    fontSize: 28,
    fontFamily: Fonts.monoBold,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 10,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  brandText: {
    fontSize: 11,
    letterSpacing: 1.2,
    fontFamily: Fonts.bold,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  carousel: {
    flex: 1,
    zIndex: 10,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  contentCard: {
    width: '100%',
    height: '94%',
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  themePickerCard: {
    justifyContent: 'flex-start',
    paddingTop: 18,
    paddingBottom: 10,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  tagText: {
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: Fonts.bold,
  },
  slideTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Fonts.bold,
  },
  slideSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 14,
    fontFamily: Fonts.medium,
  },
  slideDescription: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: Fonts.regular,
    paddingHorizontal: 10,
  },
  interactiveBox: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  comparisonRow: {
    gap: 4,
  },
  badgeLabel: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  bugBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#EF4444',
  },
  proBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
  },
  bugMathText: {
    fontSize: 13,
    fontFamily: Fonts.monoRegular,
    textDecorationLine: 'line-through',
  },
  proMathText: {
    fontSize: 14,
    fontFamily: Fonts.monoBold,
  },
  boxDivider: {
    height: 1,
  },
  liveCounterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
  },
  counterLeft: {
    gap: 2,
  },
  counterLabel: {
    fontSize: 11,
    fontFamily: Fonts.medium,
  },
  counterValue: {
    fontSize: 20,
    fontFamily: Fonts.monoBold,
  },
  counterBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  miniBtnText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
  miniIconBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
  },
  formulaBox: {
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formulaContent: {
    alignItems: 'center',
    gap: 4,
  },
  formulaEq: {
    fontSize: 13,
    fontFamily: Fonts.monoRegular,
  },
  formulaRes: {
    fontSize: 22,
    fontFamily: Fonts.monoBold,
  },
  themeGridScroll: {
    width: '100%',
    flex: 1,
    marginTop: 4,
  },
  themeGridContent: {
    gap: 8,
    paddingBottom: 8,
  },
  themeTile: {
    borderRadius: 16,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeTileSelected: {
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tileName: {
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  tileCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniKeypadRow: {
    flexDirection: 'row',
    gap: 6,
  },
  miniKey: {
    flex: 1,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniKeyText: {
    fontSize: 11,
    fontFamily: Fonts.monoBold,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
    zIndex: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  dotInactive: {
    width: 7,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 18,
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
    letterSpacing: 0.5,
  },
});
