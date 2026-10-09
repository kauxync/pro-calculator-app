import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CalcButton } from './CalcButton';
import { useCalculator } from '../context/CalculatorContext';

export const Keypad: React.FC = () => {
  const {
    inputDigit,
    inputOperator,
    inputDot,
    inputParenthesis,
    toggleSign,
    clearAll,
    equals,
  } = useCalculator();

  return (
    <View style={styles.container}>
      {/* Row 1 */}
      <View style={styles.row}>
        <CalcButton label="AC" onPress={clearAll} variant="action" />
        <CalcButton label="( )" onPress={inputParenthesis} variant="action" />
        <CalcButton label="%" onPress={() => inputOperator('%')} variant="action" />
        <CalcButton label="÷" onPress={() => inputOperator('/')} variant="operator" />
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        <CalcButton label="7" onPress={() => inputDigit('7')} />
        <CalcButton label="8" onPress={() => inputDigit('8')} />
        <CalcButton label="9" onPress={() => inputDigit('9')} />
        <CalcButton label="×" onPress={() => inputOperator('*')} variant="operator" />
      </View>

      {/* Row 3 */}
      <View style={styles.row}>
        <CalcButton label="4" onPress={() => inputDigit('4')} />
        <CalcButton label="5" onPress={() => inputDigit('5')} />
        <CalcButton label="6" onPress={() => inputDigit('6')} />
        <CalcButton label="−" onPress={() => inputOperator('-')} variant="operator" />
      </View>

      {/* Row 4 */}
      <View style={styles.row}>
        <CalcButton label="1" onPress={() => inputDigit('1')} />
        <CalcButton label="2" onPress={() => inputDigit('2')} />
        <CalcButton label="3" onPress={() => inputDigit('3')} />
        <CalcButton label="+" onPress={() => inputOperator('+')} variant="operator" />
      </View>

      {/* Row 5 */}
      <View style={styles.row}>
        <CalcButton label="±" onPress={toggleSign} variant="number" />
        <CalcButton label="0" onPress={() => inputDigit('0')} />
        <CalcButton label="." onPress={inputDot} />
        <CalcButton label="=" onPress={equals} variant="operator" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

