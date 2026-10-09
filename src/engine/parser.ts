import { Token } from '../types/calculator';

/**
 * Converts Infix tokens to Postfix (Reverse Polish Notation)
 * using the fault-tolerant Shunting-Yard algorithm.
 */
export function infixToPostfix(tokens: Token[]): Token[] {
  const outputQueue: Token[] = [];
  const operatorStack: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    switch (token.type) {
      case 'NUMBER':
      case 'CONSTANT':
        outputQueue.push(token);
        break;

      case 'FUNCTION':
        operatorStack.push(token);
        break;

      case 'COMMA':
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1].type !== 'LPAREN'
        ) {
          outputQueue.push(operatorStack.pop()!);
        }
        if (operatorStack.length === 0) {
          throw new Error('Misplaced comma or mismatched parentheses');
        }
        break;

      case 'OPERATOR': {
        const o1 = token;
        while (operatorStack.length > 0) {
          const o2 = operatorStack[operatorStack.length - 1];

          if (o2.type === 'FUNCTION') {
            outputQueue.push(operatorStack.pop()!);
            continue;
          }

          if (o2.type === 'OPERATOR') {
            const prec1 = o1.precedence ?? 0;
            const prec2 = o2.precedence ?? 0;
            const isLeftAssoc = o1.associativity === 'LEFT';

            if ((isLeftAssoc && prec1 <= prec2) || (!isLeftAssoc && prec1 < prec2)) {
              outputQueue.push(operatorStack.pop()!);
              continue;
            }
          }
          break;
        }
        operatorStack.push(o1);
        break;
      }

      case 'LPAREN':
        operatorStack.push(token);
        break;

      case 'RPAREN': {
        let matchFound = false;
        while (operatorStack.length > 0) {
          const top = operatorStack.pop()!;
          if (top.type === 'LPAREN') {
            matchFound = true;
            break;
          }
          outputQueue.push(top);
        }

        if (!matchFound) {
          throw new Error('Mismatched parentheses');
        }

        // If function is on top of operator stack, pop it to output
        if (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1].type === 'FUNCTION'
        ) {
          outputQueue.push(operatorStack.pop()!);
        }
        break;
      }
    }
  }

  // Pop remaining operators from stack to output queue
  // If there are unclosed LPAREN, auto-close them by popping associated pending functions
  while (operatorStack.length > 0) {
    const top = operatorStack.pop()!;
    if (top.type === 'LPAREN') {
      // If a function was immediately wrapping this unclosed parenthesis, pop it
      if (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type === 'FUNCTION'
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      continue;
    }
    if (top.type === 'RPAREN') {
      continue;
    }
    outputQueue.push(top);
  }

  return outputQueue;
}
