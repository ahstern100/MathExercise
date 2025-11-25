import React, { useState, useEffect, useRef } from 'react';
import { Fraction, GameState } from './types';
import { gcd, generateRandomFraction } from './utils';
import { FractionDisplay } from './components/FractionDisplay';
import { Keypad } from './components/Keypad';
import { Smartphone, RotateCcw, Equal } from 'lucide-react';
import confetti from 'canvas-confetti';

const TOTAL_EXERCISES = 3;

const App: React.FC = () => {
    // Game State
    const [exercisesCompleted, setExercisesCompleted] = useState(0);
    const [gameState, setGameState] = useState<GameState>(GameState.DECIDE_REDUCTION);
    
    // History of fractions for the current exercise to show the chain (e.g. 30/80 = 15/40 = 3/8)
    const [fractionHistory, setFractionHistory] = useState<Fraction[]>([]);
    
    // Inputs & Feedback
    const [divisorInput, setDivisorInput] = useState<string>('');
    const [newNumInput, setNewNumInput] = useState<string>('');
    const [newDenInput, setNewDenInput] = useState<string>('');
    const [activeField, setActiveField] = useState<'divisor' | 'newNum' | 'newDen'>('divisor');
    
    const [feedback, setFeedback] = useState<string | null>(null);
    const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
    
    // Helper to store the divisor chosen in Step 1/2 for Step 3/4
    const [activeDivisor, setActiveDivisor] = useState<number | null>(null);

    // Scroll helper
    const scrollEndRef = useRef<HTMLDivElement>(null);

    // Initial load
    useEffect(() => {
        startNewExercise();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Scroll to end of equation when history changes or inputs change
    useEffect(() => {
        if (scrollEndRef.current) {
            scrollEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
        }
    }, [fractionHistory, gameState, activeField]);

    const startNewExercise = () => {
        const initialFraction = generateRandomFraction();
        setFractionHistory([initialFraction]);
        setGameState(GameState.DECIDE_REDUCTION);
        resetInputs();
    };

    const resetGame = () => {
        setExercisesCompleted(0);
        setGameState(GameState.DECIDE_REDUCTION);
        startNewExercise();
    };

    const resetInputs = () => {
        setDivisorInput('');
        setNewNumInput('');
        setNewDenInput('');
        setFeedback(null);
        setActiveDivisor(null);
        setActiveField('divisor');
    };

    const getCurrentFraction = () => fractionHistory[fractionHistory.length - 1];

    // --- KEYPAD HANDLERS ---

    const handleDigit = (digit: number) => {
        setFeedback(null); // Clear feedback on typing
        
        if (gameState === GameState.DECIDE_REDUCTION) {
            if (activeField === 'divisor') {
                setDivisorInput(prev => (prev + digit).slice(0, 3)); // Max 3 digits
            }
        } else if (gameState === GameState.PERFORM_CALCULATION) {
            if (activeField === 'newNum') {
                setNewNumInput(prev => (prev + digit).slice(0, 3));
            } else if (activeField === 'newDen') {
                setNewDenInput(prev => (prev + digit).slice(0, 3));
            }
        }
    };

    const handleBackspace = () => {
        setFeedback(null);
        if (gameState === GameState.DECIDE_REDUCTION) {
            if (activeField === 'divisor') {
                setDivisorInput(prev => prev.slice(0, -1));
            }
        } else if (gameState === GameState.PERFORM_CALCULATION) {
            if (activeField === 'newNum') {
                setNewNumInput(prev => prev.slice(0, -1));
            } else if (activeField === 'newDen') {
                setNewDenInput(prev => prev.slice(0, -1));
            }
        }
    };

    const handleSubmitPress = () => {
        if (gameState === GameState.DECIDE_REDUCTION) {
            handleDivisorSubmit();
        } else if (gameState === GameState.PERFORM_CALCULATION) {
            handleCalculationSubmit();
        }
    };

    // --- STEP 1 & 2: DECISION ---
    
    const handleNoReduction = () => {
        const current = getCurrentFraction();
        const common = gcd(current.numerator, current.denominator);
        if (common > 1) {
            setFeedback("טעות! אפשר לצמצם את השבר. נסי למצוא מספר שגם המונה וגם המכנה מתחלקים בו.");
            setFeedbackType('error');
            setActiveField('divisor'); 
        } else {
            handleExerciseComplete();
        }
    };

    const handleDivisorSubmit = () => {
        const d = parseInt(divisorInput);
        
        if (isNaN(d) || divisorInput === '') {
            setFeedback("יש להזין מספר או ללחוץ על ה-X");
            setFeedbackType('error');
            return;
        }

        if (d <= 1) {
            setFeedback("יש להזין מספר גדול מ-1");
            setFeedbackType('error');
            setDivisorInput('');
            return;
        }
        
        setActiveDivisor(d);
        setGameState(GameState.PERFORM_CALCULATION);
        setFeedback(null);
        setNewNumInput('');
        setNewDenInput('');
        setActiveField('newNum'); 
    };

    // --- STEP 3 & 4: CALCULATION ---

    const handleCalculationSubmit = () => {
        if (!activeDivisor) return;

        // --- NEW LOGIC FOR NAVIGATION ---
        // If we are on Numerator, and it's filled, but Denominator is empty -> Move to Denominator
        if (activeField === 'newNum' && newNumInput !== '' && newDenInput === '') {
            setActiveField('newDen');
            return;
        }
        // --------------------------------

        const numInput = parseInt(newNumInput);
        const denInput = parseInt(newDenInput);

        if (isNaN(numInput) || isNaN(denInput)) {
            setFeedback("נא למלא את שני המספרים");
            setFeedbackType('error');
            return;
        }

        const current = getCurrentFraction();
        const expectedNum = current.numerator / activeDivisor;
        const expectedDen = current.denominator / activeDivisor;

        const isIntegerDivision = Number.isInteger(expectedNum) && Number.isInteger(expectedDen);

        if (!isIntegerDivision) {
            setFeedback(`אופס! ${activeDivisor} לא מחלק את המונה והמכנה באופן שלם. נסי לבחור מספר אחר.`);
            setFeedbackType('error');
            // Allow retry? yes.
            return;
        }

        if (numInput === expectedNum && denInput === expectedDen) {
            // Correct calculation!
            // Update history by adding the new fraction
            setFractionHistory(prev => [...prev, { numerator: expectedNum, denominator: expectedDen }]);
            
            // Loop back to Step 1 state for the NEW fraction
            setGameState(GameState.DECIDE_REDUCTION);
            setDivisorInput(''); 
            setActiveDivisor(null); // Clear divisor for the *next* step (the previous one is rendered based on history logic)
            setFeedback("מעולה! השבר צומצם. האם אפשר לצמצם שוב?");
            setFeedbackType('success');
            setActiveField('divisor');
        } else {
            setFeedback("טעות בחישוב, נסי שוב.");
            setFeedbackType('error');
        }
    };

    const handleRegret = () => {
        // Go back to deciding divisor for the CURRENT fraction
        setGameState(GameState.DECIDE_REDUCTION);
        setFeedback(null);
        setActiveDivisor(null);
        setNewNumInput('');
        setNewDenInput('');
        setDivisorInput('');
        setActiveField('divisor');
    };

    // --- COMPLETION ---

    const handleExerciseComplete = () => {
        const nextCount = exercisesCompleted + 1;
        setExercisesCompleted(nextCount);
        
        if (nextCount >= TOTAL_EXERCISES) {
            setGameState(GameState.VICTORY);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            setFeedback("מצוין! סיימת את התרגיל הזה. בואי נעבור לתרגיל הבא.");
            setFeedbackType('success');
            setTimeout(() => {
                startNewExercise();
            }, 2000);
        }
    };

    // --- COMPONENTS ---
    
    const InputBox = ({ value, isActive, onClick, placeholder = '?' }: any) => (
        <div 
            onClick={onClick}
            className={`
                min-w-[60px] h-12 sm:h-14 px-1 flex items-center justify-center text-3xl font-bold rounded-xl border-2 transition-all cursor-pointer bg-white shadow-sm select-none
                ${isActive ? 'border-indigo-500 ring-4 ring-indigo-100 scale-105 z-10' : 'border-indigo-200 hover:border-indigo-300'}
                ${!value ? 'text-gray-300' : 'text-slate-800'}
            `}
        >
            {value || placeholder}
        </div>
    );

    // --- RENDERERS ---

    if (gameState === GameState.VICTORY) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 text-center p-4" dir="rtl">
                <div className="bg-white p-8 rounded-3xl shadow-2xl transform transition-all hover:scale-105">
                    <Smartphone className="w-20 h-20 mx-auto text-purple-600 mb-4" />
                    <h1 className="text-3xl font-bold text-purple-800 mb-2">כל הכבוד!</h1>
                    <p className="text-lg text-purple-600 mb-6">סיימת את כל התרגילים בהצלחה!</p>
                    <button 
                        onClick={resetGame}
                        className="px-8 py-3 bg-purple-600 text-white rounded-full text-xl font-bold shadow-lg hover:bg-purple-700 transition-colors"
                    >
                        שחקי שוב
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#f0fdf4] flex flex-col items-center select-none overflow-hidden font-sans">
            
            {/* Header / Progress - Reduced padding */}
            <div className="w-full max-w-2xl p-2 pt-3 flex justify-between items-center" dir="rtl">
                <div className="text-slate-500 font-bold text-sm sm:text-base">תרגיל {exercisesCompleted + 1} מתוך {TOTAL_EXERCISES}</div>
                <div className="flex gap-1">
                    {[...Array(TOTAL_EXERCISES)].map((_, i) => (
                        <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < exercisesCompleted ? 'bg-green-500' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            {/* Main Content Area - Flex 1 to take available space, reduced padding */}
            <div className="flex-1 w-full max-w-4xl flex flex-col items-center px-2 py-2 overflow-y-auto custom-scrollbar relative">
                
                {/* Instructions - Smaller text and margin */}
                <h2 className="text-xl font-bold text-slate-700 mb-2 text-center" dir="rtl">
                    {gameState === GameState.DECIDE_REDUCTION 
                        ? "האם אפשר לצמצם את השבר?" 
                        : "כתבי את השבר המצומצם"}
                </h2>

                {/* EQUATION AREA - Reduced vertical padding */}
                <div className="w-full overflow-x-auto pb-4 pt-4 px-4 flex justify-center min-h-[140px] items-center">
                    <div className="flex items-center gap-2 sm:gap-4 whitespace-nowrap" dir="ltr">
                        
                        {/* History Chain */}
                        {fractionHistory.map((frac, idx) => (
                            <React.Fragment key={idx}>
                                {/* Equals sign before items (except first) */}
                                {idx > 0 && <Equal className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 shrink-0" />}
                                
                                {/* Fraction Display */}
                                <div className={idx === fractionHistory.length - 1 && gameState === GameState.PERFORM_CALCULATION ? "opacity-100" : ""}>
                                    <FractionDisplay 
                                        fraction={frac} 
                                        divisor={
                                            (idx === fractionHistory.length - 1 && activeDivisor) ? activeDivisor : undefined
                                        }
                                        size="lg" 
                                    />
                                </div>
                            </React.Fragment>
                        ))}

                        {/* Current Calculation Inputs */}
                        {gameState === GameState.PERFORM_CALCULATION && (
                            <>
                                <Equal className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 shrink-0" />
                                <div className="flex flex-col items-center">
                                    <InputBox 
                                        value={newNumInput} 
                                        isActive={activeField === 'newNum'} 
                                        onClick={() => setActiveField('newNum')} 
                                        placeholder="?"
                                    />
                                    <div className="w-14 sm:w-16 h-[3px] bg-slate-700 my-2 rounded-full"></div>
                                    <InputBox 
                                        value={newDenInput} 
                                        isActive={activeField === 'newDen'} 
                                        onClick={() => setActiveField('newDen')} 
                                        placeholder="?"
                                    />
                                </div>
                                <div ref={scrollEndRef} />
                            </>
                        )}
                    </div>
                </div>

                {/* ACTION AREA (Below equation) - Reduced margin */}
                <div className="mt-2 min-h-[100px] flex items-center justify-center">
                    {gameState === GameState.DECIDE_REDUCTION && (
                        <div className="flex items-center gap-4 sm:gap-6" dir="rtl">
                            <button 
                                onClick={handleNoReduction}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-slate-200 shadow-[0_4px_0_0_rgba(203,213,225,1)] active:shadow-none active:translate-y-[4px] flex flex-col items-center justify-center gap-1 hover:bg-red-50 transition-colors group"
                            >
                                <span className="text-3xl font-bold text-slate-400 group-hover:text-red-500">X</span>
                                <span className="text-[10px] sm:text-xs font-bold text-slate-400 group-hover:text-red-500">לא ניתן</span>
                            </button>
                            
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-sm font-bold text-slate-400">צמצום ב:</span>
                                <InputBox 
                                    value={divisorInput} 
                                    isActive={activeField === 'divisor'} 
                                    onClick={() => setActiveField('divisor')} 
                                />
                            </div>
                        </div>
                    )}
                    
                    {gameState === GameState.PERFORM_CALCULATION && (
                         <button 
                            onClick={handleRegret}
                            className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200"
                            dir="rtl"
                        >
                            <RotateCcw size={14} />
                            חזרה לבחירת מחלק
                        </button>
                    )}
                </div>

                {/* Feedback Message - Absolute positioned or fixed height to prevent jumping */}
                <div className="mt-2 h-10 flex items-center justify-center w-full px-4">
                     <div className={`flex items-center justify-center text-center px-4 py-1 rounded-xl w-full max-w-md
                        ${feedback ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300
                        ${feedbackType === 'error' ? 'bg-red-100 text-red-700' : 
                          feedbackType === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}
                    `} dir="rtl">
                        <p className="font-bold text-sm sm:text-base truncate">{feedback || "..."}</p>
                    </div>
                </div>
            </div>

            {/* Custom Keypad (Fixed at bottom) */}
            <Keypad 
                onDigit={handleDigit} 
                onBackspace={handleBackspace} 
                onSubmit={handleSubmitPress} 
            />

        </div>
    );
};

export default App;