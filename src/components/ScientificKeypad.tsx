import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalcButton } from './CalcButton';
import { useCalculator } from '../context/CalculatorContext';
import { useTheme } from '../theme/ThemeContext';
import { Fonts } from '../theme/fonts';
import { triggerLightHaptic } from '../utils/haptics';

type PaletteCategory = 'TRIG' | 'HYP' | 'MATH' | 'PROB' | 'CONST';

export const ScientificKeypad: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<PaletteCategory>('TRIG');
  const [isSecond, setIsSecond] = useState(false);
  const { theme } = useTheme();

  const {
    inputDigit,
    inputOperator,
    inputDot,
    inputParenthesis,
    inputFunction,
    inputConstant,
    toggleSign,
    clearAll,
    equals,
    memoryAdd,
    memorySubtract,
    memoryRecall,
    memoryClear,
  } = useCalculator();

  const handleCategoryChange = (cat: PaletteCategory) => {
    triggerLightHaptic();
    setActiveCategory(cat);
  };

  const renderPaletteRow = () => {
    switch (activeCategory) {
      case 'TRIG':
        return (
          <View style={styles.paletteRow}>
            <CalcButton
              label={isSecond ? '1st' : '2nd'}
              onPress={() => setIsSecond(!isSecond)}
              variant="action"
              isSmall
            />
            <CalcButton
              label={isSecond ? 'asin' : 'sin'}
              onPress={() => inputFunction(isSecond ? 'asin' : 'sin')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label={isSecond ? 'acos' : 'cos'}
              onPress={() => inputFunction(isSecond ? 'acos' : 'cos')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label={isSecond ? 'atan' : 'tan'}
              onPress={() => inputFunction(isSecond ? 'atan' : 'tan')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label={isSecond ? 'cot' : 'sec'}
              onPress={() => inputFunction(isSecond ? 'cot' : 'sec')}
              variant="scientific"
              isSmall
            />
          </View>
        );

      case 'HYP':
        return (
          <View style={styles.paletteRow}>
            <CalcButton
              label={isSecond ? '1st' : '2nd'}
              onPress={() => setIsSecond(!isSecond)}
              variant="action"
              isSmall
            />
            <CalcButton
              label={isSecond ? 'asinh' : 'sinh'}
              onPress={() => inputFunction(isSecond ? 'asinh' : 'sinh')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label={isSecond ? 'acosh' : 'cosh'}
              onPress={() => inputFunction(isSecond ? 'acosh' : 'cosh')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label={isSecond ? 'atanh' : 'tanh'}
              onPress={() => inputFunction(isSecond ? 'atanh' : 'tanh')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label="csc"
              onPress={() => inputFunction('csc')}
              variant="scientific"
              isSmall
            />
          </View>
        );

      case 'MATH':
        return (
          <View style={styles.paletteRow}>
            <CalcButton
              label="ln"
              onPress={() => inputFunction('ln')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label="log₁₀"
              onPress={() => inputFunction('log')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label="log₂"
              onPress={() => inputFunction('log2')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label="eˣ"
              onPress={() => inputFunction('exp')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label="10ˣ"
              onPress={() => inputOperator('10^')}
              variant="scientific"
              isSmall
            />
          </View>
        );

      case 'PROB':
        return (
          <View style={styles.paletteRow}>
            <CalcButton
              label="nCr"
              onPress={() => inputOperator(' ncr ')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label="nPr"
              onPress={() => inputOperator(' npr ')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label="mod"
              onPress={() => inputOperator(' mod ')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label="rand"
              onPress={() => inputConstant('rand')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label="|x|"
              onPress={() => inputFunction('abs')}
              variant="scientific"
              isSmall
            />
          </View>
        );

      case 'CONST':
        return (
          <View style={styles.paletteRow}>
            <CalcButton
              label="π"
              onPress={() => inputConstant('π')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label="e"
              onPress={() => inputConstant('e')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label="φ (phi)"
              onPress={() => inputConstant('phi')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label="τ (2π)"
              onPress={() => inputConstant('tau')}
              variant="scientific"
              isSmall
            />
            <CalcButton
              label="c (light)"
              onPress={() => inputConstant('c')}
              variant="scientific"
              isSmall
            />
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <View
        style={[
          styles.categoryBar,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderColor: theme.surfaceBorder,
          },
        ]}
      >
        {(['TRIG', 'HYP', 'MATH', 'PROB', 'CONST'] as PaletteCategory[]).map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => handleCategoryChange(cat)}
              style={[
                styles.categoryTab,
                isActive && {
                  backgroundColor: theme.accentGlow,
                  borderWidth: 1,
                  borderColor: theme.accent,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  { color: theme.textMuted },
                  isActive && { color: theme.accent },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Dynamic Function Palette Row */}
      {renderPaletteRow()}

      {/* Universal Scientific Functions Row */}
      <View style={styles.row}>
        <CalcButton label="√" onPress={() => inputFunction('sqrt')} variant="scientific" isSmall />
        <CalcButton label="∛" onPress={() => inputFunction('cbrt')} variant="scientific" isSmall />
        <CalcButton label="xʸ" onPress={() => inputOperator('^')} variant="scientific" isSmall />
        <CalcButton label="x²" onPress={() => inputOperator('^2')} variant="scientific" isSmall />
        <CalcButton label="x!" onPress={() => inputOperator('!')} variant="scientific" isSmall />
      </View>

      {/* Primary Grid Row 1 */}
      <View style={styles.row}>
        <CalcButton label="AC" onPress={clearAll} variant="action" isSmall />
        <CalcButton label="(" onPress={() => inputParenthesis()} variant="action" isSmall />
        <CalcButton label=")" onPress={() => inputOperator(')')} variant="action" isSmall />
        <CalcButton label="%" onPress={() => inputOperator('%')} variant="action" isSmall />
        <CalcButton label="÷" onPress={() => inputOperator('/')} variant="operator" isSmall />
      </View>

      {/* Primary Grid Row 2 */}
      <View style={styles.row}>
        <CalcButton label="7" onPress={() => inputDigit('7')} isSmall />
        <CalcButton label="8" onPress={() => inputDigit('8')} isSmall />
        <CalcButton label="9" onPress={() => inputDigit('9')} isSmall />
        <CalcButton label="MC" onPress={memoryClear} variant="scientific" isSmall />
        <CalcButton label="×" onPress={() => inputOperator('*')} variant="operator" isSmall />
      </View>

      {/* Primary Grid Row 3 */}
      <View style={styles.row}>
        <CalcButton label="4" onPress={() => inputDigit('4')} isSmall />
        <CalcButton label="5" onPress={() => inputDigit('5')} isSmall />
        <CalcButton label="6" onPress={() => inputDigit('6')} isSmall />
        <CalcButton label="MR" onPress={memoryRecall} variant="scientific" isSmall />
        <CalcButton label="−" onPress={() => inputOperator('-')} variant="operator" isSmall />
      </View>

      {/* Primary Grid Row 4 */}
      <View style={styles.row}>
        <CalcButton label="1" onPress={() => inputDigit('1')} isSmall />
        <CalcButton label="2" onPress={() => inputDigit('2')} isSmall />
        <CalcButton label="3" onPress={() => inputDigit('3')} isSmall />
        <CalcButton label="M+" onPress={memoryAdd} variant="scientific" isSmall />
        <CalcButton label="+" onPress={() => inputOperator('+')} variant="operator" isSmall />
      </View>

      {/* Primary Grid Row 5 */}
      <View style={styles.row}>
        <CalcButton label="±" onPress={toggleSign} isSmall />
        <CalcButton label="0" onPress={() => inputDigit('0')} isSmall />
        <CalcButton label="." onPress={inputDot} isSmall />
        <CalcButton label="M-" onPress={memorySubtract} variant="scientific" isSmall />
        <CalcButton label="=" onPress={equals} variant="operator" isSmall />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingBottom: 6,
    width: '100%',
  },
  categoryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 3,
    marginBottom: 6,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 5,
    alignItems: 'center',
    borderRadius: 8,
  },
  categoryTabText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    letterSpacing: 0.5,
  },
  paletteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
});
