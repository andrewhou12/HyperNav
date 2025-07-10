
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Maximize2, Minimize2 } from 'lucide-react';

export const CalculatorTool: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNumber = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleEquals = () => {
    try {
      const result = eval(equation + display);
      setDisplay(result.toString());
      setEquation('');
    } catch (error) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleAdvanced = (operation: string) => {
    try {
      const num = parseFloat(display);
      let result: number;
      
      switch (operation) {
        case 'sqrt':
          result = Math.sqrt(num);
          break;
        case 'square':
          result = num * num;
          break;
        case 'log':
          result = Math.log10(num);
          break;
        case 'ln':
          result = Math.log(num);
          break;
        case 'sin':
          result = Math.sin(num * Math.PI / 180);
          break;
        case 'cos':
          result = Math.cos(num * Math.PI / 180);
          break;
        case 'tan':
          result = Math.tan(num * Math.PI / 180);
          break;
        case 'factorial':
          result = num <= 0 ? 1 : Array.from({length: num}, (_, i) => i + 1).reduce((a, b) => a * b, 1);
          break;
        default:
          result = num;
      }
      
      setDisplay(result.toString());
      setEquation('');
    } catch (error) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const basicButtons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '=']
  ];

  const advancedButtons = [
    ['C', '±', '%', '÷', 'sin', 'cos'],
    ['7', '8', '9', '×', 'tan', 'log'],
    ['4', '5', '6', '-', 'ln', 'x²'],
    ['1', '2', '3', '+', '√', 'x!'],
    ['0', '.', '⌫', '=', 'π', 'e']
  ];

  const buttons = isExpanded ? advancedButtons : basicButtons;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 h-full flex flex-col"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Calculator</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg hover:bg-muted transition-colors"
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Display */}
      <div className="bg-card/50 rounded-xl p-4 border border-border">
        <div className="text-right">
          <div className="text-sm text-muted-foreground min-h-[20px]">{equation}</div>
          <div className="text-2xl font-mono font-bold text-foreground">{display}</div>
        </div>
      </div>

      {/* Buttons */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isExpanded ? 'expanded' : 'basic'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`grid gap-2 flex-1 ${isExpanded ? 'grid-cols-6' : 'grid-cols-4'}`}
        >
          {buttons.flat().map((btn, index) => (
            <button
              key={`${btn}-${index}`}
              onClick={() => {
                if (btn === 'C') handleClear();
                else if (btn === '⌫') handleDelete();
                else if (btn === '=') handleEquals();
                else if (['+', '-', '×', '÷'].includes(btn)) {
                  const op = btn === '×' ? '*' : btn === '÷' ? '/' : btn;
                  handleOperator(op);
                }
                else if (btn === '±') {
                  setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
                }
                else if (btn === '%') {
                  setDisplay((parseFloat(display) / 100).toString());
                }
                else if (btn === 'sin' || btn === 'cos' || btn === 'tan') {
                  handleAdvanced(btn);
                }
                else if (btn === 'log' || btn === 'ln') {
                  handleAdvanced(btn);
                }
                else if (btn === '√') {
                  handleAdvanced('sqrt');
                }
                else if (btn === 'x²') {
                  handleAdvanced('square');
                }
                else if (btn === 'x!') {
                  handleAdvanced('factorial');
                }
                else if (btn === 'π') {
                  setDisplay(Math.PI.toString());
                }
                else if (btn === 'e') {
                  setDisplay(Math.E.toString());
                }
                else handleNumber(btn);
              }}
              className={`p-2 rounded-xl font-medium transition-all text-sm ${
                btn === '=' 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : ['+', '-', '×', '÷', 'sin', 'cos', 'tan', 'log', 'ln', '√', 'x²', 'x!', 'π', 'e'].includes(btn)
                  ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {btn === '⌫' ? <Delete className="w-3 h-3 mx-auto" /> : btn}
            </button>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
