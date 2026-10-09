import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Fonts } from '../theme/fonts';
import {
  X,
  Palette,
  Info,
  Cpu,
  ShieldCheck,
  Check,
  Moon,
  Sun,
  Globe,
  Code2,
  Compass,
  ArrowRight,
} from 'lucide-react-native';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenQuickTour?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onOpenQuickTour,
}) => {
  const { theme, themeId, setTheme, availableThemes } = useTheme();
  const [themeFilter, setThemeFilter] = useState<'all' | 'dark' | 'light'>('all');

  const filteredThemes = availableThemes.filter((t) => {
    if (themeFilter === 'dark') return !t.isLight;
    if (themeFilter === 'light') return t.isLight;
    return true;
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.surface, borderColor: theme.surfaceBorder },
            ]}
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.surfaceBorder }]}>
              <View style={styles.headerTitleRow}>
                <Palette size={20} color={theme.accent} />
                <Text style={[styles.title, { color: theme.text }]}>Settings & App Info</Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: theme.surfaceLight }]}
                activeOpacity={0.7}
              >
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* THEME SELECTION SECTION */}
              <View style={styles.section}>
                <View style={styles.themeHeaderRow}>
                  <View style={styles.sectionHeader}>
                    <Palette size={16} color={theme.accent} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Color Theme</Text>
                  </View>

                  {/* Dark / Light / All Filter Pills */}
                  <View style={[styles.filterBar, { backgroundColor: theme.surfaceLight }]}>
                    <TouchableOpacity
                      onPress={() => setThemeFilter('all')}
                      style={[
                        styles.filterPill,
                        themeFilter === 'all' && {
                          backgroundColor: theme.accentGlow,
                          borderColor: theme.accent,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          { color: themeFilter === 'all' ? theme.accent : theme.textMuted },
                        ]}
                      >
                        All
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setThemeFilter('dark')}
                      style={[
                        styles.filterPill,
                        themeFilter === 'dark' && {
                          backgroundColor: theme.accentGlow,
                          borderColor: theme.accent,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Moon
                        size={12}
                        color={themeFilter === 'dark' ? theme.accent : theme.textMuted}
                      />
                      <Text
                        style={[
                          styles.filterText,
                          { color: themeFilter === 'dark' ? theme.accent : theme.textMuted },
                        ]}
                      >
                        Dark
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setThemeFilter('light')}
                      style={[
                        styles.filterPill,
                        themeFilter === 'light' && {
                          backgroundColor: theme.accentGlow,
                          borderColor: theme.accent,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <Sun
                        size={12}
                        color={themeFilter === 'light' ? theme.accent : theme.textMuted}
                      />
                      <Text
                        style={[
                          styles.filterText,
                          { color: themeFilter === 'light' ? theme.accent : theme.textMuted },
                        ]}
                      >
                        Light
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.themesGrid}>
                  {filteredThemes.map((t) => {
                    const isSelected = t.id === themeId;
                    return (
                      <TouchableOpacity
                        key={t.id}
                        onPress={() => setTheme(t.id)}
                        style={[
                          styles.themeCard,
                          {
                            backgroundColor: t.surface,
                            borderColor: isSelected ? t.accent : theme.surfaceBorder,
                          },
                          isSelected && styles.themeCardSelected,
                        ]}
                        activeOpacity={0.7}
                      >
                        {/* Swatches */}
                        <View style={styles.swatchRow}>
                          {t.previewColors.map((color, idx) => (
                            <View
                              key={idx}
                              style={[
                                styles.swatchDot,
                                {
                                  backgroundColor: color,
                                  borderColor: theme.surfaceBorder,
                                  borderWidth: 1,
                                },
                              ]}
                            />
                          ))}
                        </View>

                        <View style={styles.themeInfo}>
                          <View style={styles.themeNameRow}>
                            <Text
                              style={[
                                styles.themeName,
                                { color: isSelected ? t.accent : t.text },
                              ]}
                            >
                              {t.name}
                            </Text>
                            <View
                              style={[
                                styles.modeBadge,
                                {
                                  backgroundColor: t.isLight
                                    ? 'rgba(245, 158, 11, 0.15)'
                                    : 'rgba(56, 189, 248, 0.15)',
                                },
                              ]}
                            >
                              {t.isLight ? (
                                <Sun size={10} color="#EA580C" />
                              ) : (
                                <Moon size={10} color={t.accent} />
                              )}
                            </View>
                          </View>
                          <Text
                            style={[styles.themeDesc, { color: t.textSecondary }]}
                            numberOfLines={1}
                          >
                            {t.description}
                          </Text>
                        </View>

                        {isSelected && (
                          <View style={[styles.checkCircle, { backgroundColor: t.accent }]}>
                            <Check size={14} color="#FFFFFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* QUICK TOUR WALKTHROUGH SECTION */}
              {onOpenQuickTour && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Compass size={16} color={theme.accent} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Interactive Tour</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      setTimeout(() => {
                        onOpenQuickTour();
                      }, 250);
                    }}
                    style={[
                      styles.tourCard,
                      {
                        backgroundColor: theme.surfaceLight,
                        borderColor: theme.accent,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.tourIconWrap, { backgroundColor: theme.accentGlow }]}>
                      <Compass size={22} color={theme.accent} />
                    </View>
                    <View style={styles.tourInfo}>
                      <Text style={[styles.tourTitle, { color: theme.text }]}>Start Feature Quick Tour</Text>
                      <Text style={[styles.tourSubtitle, { color: theme.textSecondary }]}>
                        Explore tap cursor, gesture backspace, scientific console & offline tools.
                      </Text>
                    </View>
                    <ArrowRight size={18} color={theme.accent} />
                  </TouchableOpacity>
                </View>
              )}

              {/* ENGINE & PRECISION ARCHITECTURE */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Cpu size={16} color={theme.accent} />
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Engine Architecture</Text>
                </View>

                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: theme.surfaceLight,
                      borderColor: theme.surfaceBorder,
                    },
                  ]}
                >
                  <View style={styles.infoRow}>
                    <ShieldCheck size={18} color={theme.success} />
                    <View style={styles.infoTextGroup}>
                      <Text style={[styles.infoLabel, { color: theme.text }]}>
                        Zero Floating-Point Error
                      </Text>
                      <Text style={[styles.infoValue, { color: theme.textSecondary }]}>
                        Computations run on 36-digit Decimal.js arbitrary precision ($0.1 + 0.2 = 0.3$).
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.infoDivider, { backgroundColor: theme.surfaceBorder }]} />

                  <View style={styles.infoRow}>
                    <Cpu size={18} color={theme.accent} />
                    <View style={styles.infoTextGroup}>
                      <Text style={[styles.infoLabel, { color: theme.text }]}>
                        Compiler Engine
                      </Text>
                      <Text style={[styles.infoValue, { color: theme.textSecondary }]}>
                        Shunting-Yard Infix-to-RPN Parser with safe AST evaluation.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* APP INFO DETAILS */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Info size={16} color={theme.accent} />
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>App Information</Text>
                </View>

                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: theme.surfaceLight,
                      borderColor: theme.surfaceBorder,
                    },
                  ]}
                >
                  {/* App Name */}
                  <View style={styles.keyValueRow}>
                    <Text style={[styles.keyText, { color: theme.textMuted }]}>App Name</Text>
                    <Text style={[styles.valText, { color: theme.text }]}>Pro Calculator</Text>
                  </View>

                  <View style={[styles.infoDivider, { backgroundColor: theme.surfaceBorder }]} />

                  {/* Version */}
                  <View style={styles.keyValueRow}>
                    <Text style={[styles.keyText, { color: theme.textMuted }]}>Version</Text>
                    <Text style={[styles.valText, { color: theme.accent }]}>v1.2.0</Text>
                  </View>

                  <View style={[styles.infoDivider, { backgroundColor: theme.surfaceBorder }]} />

                  {/* Developed By */}
                  <View style={styles.keyValueRow}>
                    <View style={styles.keyWithIcon}>
                      <Code2 size={15} color={theme.accent} />
                      <Text style={[styles.keyText, { color: theme.textMuted }]}>Developed By</Text>
                    </View>
                    <Text style={[styles.valHighlight, { color: theme.accent }]}>KAUXYNC</Text>
                  </View>

                  <View style={[styles.infoDivider, { backgroundColor: theme.surfaceBorder }]} />

                  {/* Package Name */}
                  <View style={styles.keyValueRow}>
                    <Text style={[styles.keyText, { color: theme.textMuted }]}>Package Name</Text>
                    <Text style={[styles.valText, { color: theme.text }]}>in.kauxync.calculator</Text>
                  </View>

                  <View style={[styles.infoDivider, { backgroundColor: theme.surfaceBorder }]} />

                  {/* Domain */}
                  <View style={styles.keyValueRow}>
                    <View style={styles.keyWithIcon}>
                      <Globe size={15} color={theme.accent} />
                      <Text style={[styles.keyText, { color: theme.textMuted }]}>Domain</Text>
                    </View>
                    <Text style={[styles.valHighlight, { color: theme.accent }]}>kauxync.in</Text>
                  </View>

                  <View style={[styles.infoDivider, { backgroundColor: theme.surfaceBorder }]} />

                  {/* Storage */}
                  <View style={styles.keyValueRow}>
                    <Text style={[styles.keyText, { color: theme.textMuted }]}>Storage</Text>
                    <Text style={[styles.valText, { color: theme.text }]}>100% Offline Local</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '82%',
    paddingHorizontal: 20,
    paddingTop: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 10,
  },
  scrollContent: {
    paddingVertical: 18,
    gap: 22,
    paddingBottom: 40,
  },
  section: {
    gap: 10,
  },
  themeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    letterSpacing: 0.5,
  },
  filterBar: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
  },
  themesGrid: {
    gap: 10,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
  },
  themeCardSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 4,
  },
  swatchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  themeInfo: {
    flex: 1,
  },
  themeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  themeName: {
    fontSize: 15,
    fontFamily: Fonts.bold,
  },
  modeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  themeDesc: {
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 14,
  },
  tourIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourInfo: {
    flex: 1,
    gap: 2,
  },
  tourTitle: {
    fontSize: 15,
    fontFamily: Fonts.bold,
  },
  tourSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    lineHeight: 17,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    lineHeight: 18,
  },
  infoDivider: {
    height: 1,
  },
  keyValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keyWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keyText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  valText: {
    fontSize: 13,
    fontFamily: Fonts.monoMedium,
  },
  valHighlight: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    letterSpacing: 0.5,
  },
});
