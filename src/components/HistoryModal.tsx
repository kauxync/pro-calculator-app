import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCalculator } from '../context/CalculatorContext';
import { useTheme } from '../theme/ThemeContext';
import { Fonts } from '../theme/fonts';
import { formatDisplayExpression, formatTime } from '../utils/format';
import { HistoryItem } from '../types/calculator';
import { X, Trash2, Clock } from 'lucide-react-native';

export const HistoryModal: React.FC = () => {
  const { state, setHistoryOpen, selectHistoryItem, clearHistory } = useCalculator();
  const { theme } = useTheme();

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={[
        styles.historyCard,
        {
          backgroundColor: theme.surfaceLight,
          borderColor: theme.surfaceBorder,
        },
      ]}
      onPress={() => selectHistoryItem(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.timestamp, { color: theme.textMuted }]}>{formatTime(item.timestamp)}</Text>
      </View>
      <Text style={[styles.expressionText, { color: theme.textSecondary }]}>
        {formatDisplayExpression(item.expression)}
      </Text>
      <Text style={[styles.resultText, { color: theme.accent }]}>= {item.result}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={state.isHistoryOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setHistoryOpen(false)}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
              },
            ]}
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.surfaceBorder }]}>
              <View style={styles.headerTitleRow}>
                <Clock size={20} color={theme.accent} />
                <Text style={[styles.title, { color: theme.text }]}>Calculation History</Text>
              </View>

              <View style={styles.headerActions}>
                {state.history.length > 0 && (
                  <TouchableOpacity
                    onPress={clearHistory}
                    style={styles.clearBtn}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={18} color={theme.danger} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => setHistoryOpen(false)}
                  style={[styles.closeBtn, { backgroundColor: theme.surfaceLight }]}
                  activeOpacity={0.7}
                >
                  <X size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content List */}
            {state.history.length === 0 ? (
              <View style={styles.emptyState}>
                <Clock size={48} color={theme.textMuted} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No calculations yet</Text>
                <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>
                  Completed calculations will appear here.
                </Text>
              </View>
            ) : (
              <FlatList
                data={state.history}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
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
    height: '75%',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  closeBtn: {
    padding: 8,
    borderRadius: 10,
  },
  listContent: {
    paddingVertical: 16,
    gap: 12,
  },
  historyCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    fontFamily: Fonts.monoRegular,
  },
  expressionText: {
    fontSize: 17,
    fontFamily: Fonts.monoRegular,
    marginBottom: 6,
    textAlign: 'right',
  },
  resultText: {
    fontSize: 23,
    fontFamily: Fonts.monoBold,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginTop: 6,
  },
});
