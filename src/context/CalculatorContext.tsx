import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AngleMode, CalculatorMode, CalculatorState, HistoryItem } from '../types/calculator';
import { calculate } from '../engine/calculator';
import {
  triggerLightHaptic,
  triggerMediumHaptic,
  triggerSuccessHaptic,
  triggerErrorHaptic,
} from '../utils/haptics';

const HISTORY_STORAGE_KEY = '@calculator_history_v1';

type Action =
  | { type: 'INPUT_DIGIT'; digit: string }
  | { type: 'INPUT_OPERATOR'; operator: string }
  | { type: 'INPUT_DOT' }
  | { type: 'INPUT_PARENTHESIS' }
  | { type: 'INPUT_FUNCTION'; func: string }
  | { type: 'INPUT_CONSTANT'; constant: string }
  | { type: 'TOGGLE_SIGN' }
  | { type: 'BACKSPACE' }
  | { type: 'CLEAR_ALL' }
  | { type: 'EQUALS' }
  | { type: 'SET_CURSOR_POSITION'; position: number }
  | { type: 'MOVE_CURSOR_LEFT' }
  | { type: 'MOVE_CURSOR_RIGHT' }
  | { type: 'TOGGLE_ANGLE_MODE' }
  | { type: 'TOGGLE_CALCULATOR_MODE' }
  | { type: 'SET_HISTORY_OPEN'; isOpen: boolean }
  | { type: 'LOAD_HISTORY'; history: HistoryItem[] }
  | { type: 'SELECT_HISTORY_ITEM'; item: HistoryItem }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'MEMORY_ADD' }
  | { type: 'MEMORY_SUBTRACT' }
  | { type: 'MEMORY_RECALL' }
  | { type: 'MEMORY_CLEAR' };

const initialState: CalculatorState = {
  expression: '',
  displayValue: '0',
  cursorPosition: 0,
  previewResult: null,
  angleMode: 'DEG',
  mode: 'standard',
  memory: '0',
  history: [],
  isHistoryOpen: false,
  error: null,
};

function updatePreview(expression: string, angleMode: AngleMode): string | null {
  if (!expression || expression === '0') return null;
  if (/^-?[0-9.]+$/.test(expression)) return null;

  const result = calculate(expression, angleMode, true);
  if (result.success && result.formatted && result.formatted !== expression) {
    return result.formatted;
  }
  return null;
}

function insertAt(expr: string, pos: number, text: string): { newExpr: string; newPos: number } {
  const safePos = Math.max(0, Math.min(pos, expr.length));
  const newExpr = expr.slice(0, safePos) + text + expr.slice(safePos);
  return {
    newExpr,
    newPos: safePos + text.length,
  };
}

function deleteAt(expr: string, pos: number): { newExpr: string; newPos: number } {
  if (pos <= 0 || !expr) {
    return { newExpr: expr, newPos: 0 };
  }

  const safePos = Math.min(pos, expr.length);
  const before = expr.slice(0, safePos);
  const after = expr.slice(safePos);

  // Check if deleting a complete function token before cursor (e.g. sin(, sqrt()
  const funcMatch = before.match(/(asinh|acosh|atanh|sinh|cosh|tanh|asin|acos|atan|sqrt|cbrt|log2|log|ln|abs|exp|sec|csc|cot)\($/);
  if (funcMatch) {
    const len = funcMatch[0].length;
    return {
      newExpr: before.slice(0, -len) + after,
      newPos: safePos - len,
    };
  }

  return {
    newExpr: before.slice(0, -1) + after,
    newPos: safePos - 1,
  };
}

function calculatorReducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case 'SET_CURSOR_POSITION':
      return {
        ...state,
        cursorPosition: Math.max(0, Math.min(action.position, state.expression.length)),
      };

    case 'MOVE_CURSOR_LEFT':
      return {
        ...state,
        cursorPosition: Math.max(0, state.cursorPosition - 1),
      };

    case 'MOVE_CURSOR_RIGHT':
      return {
        ...state,
        cursorPosition: Math.min(state.expression.length, state.cursorPosition + 1),
      };

    case 'INPUT_DIGIT': {
      let currentExpr = state.expression;
      let pos = state.cursorPosition;

      if (state.error || currentExpr === '0') {
        currentExpr = '';
        pos = 0;
      }

      const { newExpr, newPos } = insertAt(currentExpr, pos, action.digit);

      return {
        ...state,
        expression: newExpr,
        displayValue: newExpr,
        cursorPosition: newPos,
        previewResult: updatePreview(newExpr, state.angleMode),
        error: null,
      };
    }

    case 'INPUT_DOT': {
      let currentExpr = state.expression;
      let pos = state.cursorPosition;

      if (state.error || !currentExpr || currentExpr === '0') {
        currentExpr = '';
        pos = 0;
      }

      const { newExpr, newPos } = insertAt(currentExpr, pos, '.');

      return {
        ...state,
        expression: newExpr,
        displayValue: newExpr,
        cursorPosition: newPos,
        previewResult: updatePreview(newExpr, state.angleMode),
        error: null,
      };
    }

    case 'INPUT_OPERATOR': {
      let currentExpr = state.expression;
      let pos = state.cursorPosition;

      if (state.error || !currentExpr) {
        currentExpr = '0';
        pos = 1;
      }

      const { newExpr, newPos } = insertAt(currentExpr, pos, action.operator);

      return {
        ...state,
        expression: newExpr,
        displayValue: newExpr,
        cursorPosition: newPos,
        previewResult: updatePreview(newExpr, state.angleMode),
        error: null,
      };
    }

    case 'INPUT_PARENTHESIS': {
      const expr = state.expression;
      let openCount = 0;
      let closeCount = 0;
      for (const ch of expr) {
        if (ch === '(') openCount++;
        if (ch === ')') closeCount++;
      }

      const pos = state.cursorPosition;
      const isOpenNeeded =
        !expr ||
        pos === 0 ||
        openCount === closeCount ||
        /[\+\-×*÷/^(]$/.test(expr.slice(0, pos));

      const charToInsert = isOpenNeeded ? '(' : ')';
      const { newExpr, newPos } = insertAt(expr, pos, charToInsert);

      return {
        ...state,
        expression: newExpr,
        displayValue: newExpr,
        cursorPosition: newPos,
        previewResult: updatePreview(newExpr, state.angleMode),
        error: null,
      };
    }

    case 'INPUT_FUNCTION': {
      let currentExpr = state.expression;
      let pos = state.cursorPosition;

      if (state.error || currentExpr === '0') {
        currentExpr = '';
        pos = 0;
      }

      const { newExpr, newPos } = insertAt(currentExpr, pos, action.func + '(');

      return {
        ...state,
        expression: newExpr,
        displayValue: newExpr,
        cursorPosition: newPos,
        previewResult: updatePreview(newExpr, state.angleMode),
        error: null,
      };
    }

    case 'INPUT_CONSTANT': {
      let currentExpr = state.expression;
      let pos = state.cursorPosition;

      if (state.error || currentExpr === '0') {
        currentExpr = '';
        pos = 0;
      }

      const { newExpr, newPos } = insertAt(currentExpr, pos, action.constant);

      return {
        ...state,
        expression: newExpr,
        displayValue: newExpr,
        cursorPosition: newPos,
        previewResult: updatePreview(newExpr, state.angleMode),
        error: null,
      };
    }

    case 'TOGGLE_SIGN': {
      if (!state.expression || state.expression === '0') return state;
      let newExpr = state.expression;
      if (newExpr.startsWith('-(') && newExpr.endsWith(')')) {
        newExpr = newExpr.slice(2, -1);
      } else if (newExpr.startsWith('-')) {
        newExpr = newExpr.slice(1);
      } else {
        newExpr = `-(${newExpr})`;
      }
      return {
        ...state,
        expression: newExpr,
        displayValue: newExpr,
        cursorPosition: newExpr.length,
        previewResult: updatePreview(newExpr, state.angleMode),
        error: null,
      };
    }

    case 'BACKSPACE': {
      if (state.error) {
        return {
          ...state,
          expression: '',
          displayValue: '0',
          cursorPosition: 0,
          previewResult: null,
          error: null,
        };
      }

      const { newExpr, newPos } = deleteAt(state.expression, state.cursorPosition);

      return {
        ...state,
        expression: newExpr,
        displayValue: newExpr || '0',
        cursorPosition: newPos,
        previewResult: updatePreview(newExpr, state.angleMode),
        error: null,
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...state,
        expression: '',
        displayValue: '0',
        cursorPosition: 0,
        previewResult: null,
        error: null,
      };
    }

    case 'EQUALS': {
      if (!state.expression || state.expression.trim() === '') return state;
      const res = calculate(state.expression, state.angleMode, false);

      if (res.success && res.formatted !== undefined) {
        const historyItem: HistoryItem = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
          expression: state.expression,
          result: res.formatted,
          timestamp: Date.now(),
        };

        const updatedHistory = [historyItem, ...state.history].slice(0, 50);

        return {
          ...state,
          expression: res.formatted,
          displayValue: res.formatted,
          cursorPosition: res.formatted.length,
          previewResult: null,
          history: updatedHistory,
          error: null,
        };
      } else {
        return {
          ...state,
          error: res.error || 'Error',
          previewResult: null,
        };
      }
    }

    case 'TOGGLE_ANGLE_MODE': {
      const nextMode: AngleMode = state.angleMode === 'DEG' ? 'RAD' : 'DEG';
      return {
        ...state,
        angleMode: nextMode,
        previewResult: updatePreview(state.expression, nextMode),
      };
    }

    case 'TOGGLE_CALCULATOR_MODE': {
      const nextCalcMode: CalculatorMode =
        state.mode === 'standard' ? 'scientific' : 'standard';
      return {
        ...state,
        mode: nextCalcMode,
      };
    }

    case 'SET_HISTORY_OPEN':
      return { ...state, isHistoryOpen: action.isOpen };

    case 'LOAD_HISTORY':
      return { ...state, history: action.history };

    case 'SELECT_HISTORY_ITEM':
      return {
        ...state,
        expression: action.item.result,
        displayValue: action.item.result,
        cursorPosition: action.item.result.length,
        previewResult: null,
        isHistoryOpen: false,
        error: null,
      };

    case 'CLEAR_HISTORY':
      return { ...state, history: [] };

    case 'MEMORY_ADD': {
      const res = calculate(state.expression || state.displayValue, state.angleMode, false);
      if (res.success && res.value) {
        const memCurrent = calculate(state.memory, 'DEG', false);
        const memVal = memCurrent.value ? memCurrent.value.plus(res.value).toString() : res.value.toString();
        return { ...state, memory: memVal };
      }
      return state;
    }

    case 'MEMORY_SUBTRACT': {
      const res = calculate(state.expression || state.displayValue, state.angleMode, false);
      if (res.success && res.value) {
        const memCurrent = calculate(state.memory, 'DEG', false);
        const memVal = memCurrent.value ? memCurrent.value.minus(res.value).toString() : res.value.negated().toString();
        return { ...state, memory: memVal };
      }
      return state;
    }

    case 'MEMORY_RECALL': {
      const { newExpr, newPos } = insertAt(state.expression, state.cursorPosition, state.memory);
      return {
        ...state,
        expression: newExpr,
        displayValue: newExpr,
        cursorPosition: newPos,
        previewResult: updatePreview(newExpr, state.angleMode),
      };
    }

    case 'MEMORY_CLEAR':
      return { ...state, memory: '0' };

    default:
      return state;
  }
}

interface CalculatorContextProps {
  state: CalculatorState;
  inputDigit: (d: string) => void;
  inputOperator: (op: string) => void;
  inputDot: () => void;
  inputParenthesis: () => void;
  inputFunction: (fn: string) => void;
  inputConstant: (c: string) => void;
  toggleSign: () => void;
  backspace: () => void;
  clearAll: () => void;
  equals: () => void;
  setCursorPosition: (pos: number) => void;
  moveCursorLeft: () => void;
  moveCursorRight: () => void;
  toggleAngleMode: () => void;
  toggleCalculatorMode: () => void;
  setHistoryOpen: (open: boolean) => void;
  selectHistoryItem: (item: HistoryItem) => void;
  clearHistory: () => void;
  memoryAdd: () => void;
  memorySubtract: () => void;
  memoryRecall: () => void;
  memoryClear: () => void;
}

const CalculatorContext = createContext<CalculatorContextProps | undefined>(undefined);

export const CalculatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);

  // Load history from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            dispatch({ type: 'LOAD_HISTORY', history: parsed });
          }
        }
      } catch (e) {
        console.error('Failed to load history', e);
      }
    })();
  }, []);

  // Save history to AsyncStorage when modified
  useEffect(() => {
    AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(state.history)).catch(
      (err) => console.error('Failed to save history', err)
    );
  }, [state.history]);

  const inputDigit = (d: string) => {
    triggerLightHaptic();
    dispatch({ type: 'INPUT_DIGIT', digit: d });
  };

  const inputOperator = (op: string) => {
    triggerMediumHaptic();
    dispatch({ type: 'INPUT_OPERATOR', operator: op });
  };

  const inputDot = () => {
    triggerLightHaptic();
    dispatch({ type: 'INPUT_DOT' });
  };

  const inputParenthesis = () => {
    triggerLightHaptic();
    dispatch({ type: 'INPUT_PARENTHESIS' });
  };

  const inputFunction = (fn: string) => {
    triggerLightHaptic();
    dispatch({ type: 'INPUT_FUNCTION', func: fn });
  };

  const inputConstant = (c: string) => {
    triggerLightHaptic();
    dispatch({ type: 'INPUT_CONSTANT', constant: c });
  };

  const toggleSign = () => {
    triggerLightHaptic();
    dispatch({ type: 'TOGGLE_SIGN' });
  };

  const backspace = () => {
    triggerLightHaptic();
    dispatch({ type: 'BACKSPACE' });
  };

  const clearAll = () => {
    triggerMediumHaptic();
    dispatch({ type: 'CLEAR_ALL' });
  };

  const equals = () => {
    dispatch({ type: 'EQUALS' });
    if (state.error) {
      triggerErrorHaptic();
    } else {
      triggerSuccessHaptic();
    }
  };

  const setCursorPosition = (position: number) => {
    triggerLightHaptic();
    dispatch({ type: 'SET_CURSOR_POSITION', position });
  };

  const moveCursorLeft = () => {
    triggerLightHaptic();
    dispatch({ type: 'MOVE_CURSOR_LEFT' });
  };

  const moveCursorRight = () => {
    triggerLightHaptic();
    dispatch({ type: 'MOVE_CURSOR_RIGHT' });
  };

  const toggleAngleMode = () => {
    triggerLightHaptic();
    dispatch({ type: 'TOGGLE_ANGLE_MODE' });
  };

  const toggleCalculatorMode = () => {
    triggerLightHaptic();
    dispatch({ type: 'TOGGLE_CALCULATOR_MODE' });
  };

  const setHistoryOpen = (isOpen: boolean) => {
    triggerLightHaptic();
    dispatch({ type: 'SET_HISTORY_OPEN', isOpen });
  };

  const selectHistoryItem = (item: HistoryItem) => {
    triggerLightHaptic();
    dispatch({ type: 'SELECT_HISTORY_ITEM', item });
  };

  const clearHistory = () => {
    triggerMediumHaptic();
    dispatch({ type: 'CLEAR_HISTORY' });
  };

  const memoryAdd = () => {
    triggerLightHaptic();
    dispatch({ type: 'MEMORY_ADD' });
  };

  const memorySubtract = () => {
    triggerLightHaptic();
    dispatch({ type: 'MEMORY_SUBTRACT' });
  };

  const memoryRecall = () => {
    triggerLightHaptic();
    dispatch({ type: 'MEMORY_RECALL' });
  };

  const memoryClear = () => {
    triggerLightHaptic();
    dispatch({ type: 'MEMORY_CLEAR' });
  };

  return (
    <CalculatorContext.Provider
      value={{
        state,
        inputDigit,
        inputOperator,
        inputDot,
        inputParenthesis,
        inputFunction,
        inputConstant,
        toggleSign,
        backspace,
        clearAll,
        equals,
        setCursorPosition,
        moveCursorLeft,
        moveCursorRight,
        toggleAngleMode,
        toggleCalculatorMode,
        setHistoryOpen,
        selectHistoryItem,
        clearHistory,
        memoryAdd,
        memorySubtract,
        memoryRecall,
        memoryClear,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
