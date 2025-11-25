import React from 'react';
import { Delete, Check } from 'lucide-react';

interface KeypadProps {
    onDigit: (digit: number) => void;
    onBackspace: () => void;
    onSubmit: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({ onDigit, onBackspace, onSubmit }) => {
    // Base class for number buttons
    const btnClass = "h-16 w-full bg-white rounded-2xl shadow-[0_4px_0_0_rgba(203,213,225,1)] active:shadow-none active:translate-y-[4px] border-2 border-slate-200 text-3xl font-bold text-slate-700 transition-all flex items-center justify-center touch-manipulation select-none hover:bg-slate-50";
    
    // Action button classes (Solid colors)
    const actionBtnBase = "h-16 w-full rounded-2xl active:shadow-none active:translate-y-[4px] border-2 text-white flex items-center justify-center transition-all touch-manipulation select-none shadow-md";

    return (
        <div className="w-full max-w-[360px] mx-auto mt-auto pb-6 px-4" dir="ltr">
            <div className="grid grid-cols-3 gap-3">
                {/* Row 1: 1-2-3 */}
                {[1, 2, 3].map(num => (
                    <button key={num} onClick={() => onDigit(num)} className={btnClass}>
                        {num}
                    </button>
                ))}

                {/* Row 2: 4-5-6 */}
                {[4, 5, 6].map(num => (
                    <button key={num} onClick={() => onDigit(num)} className={btnClass}>
                        {num}
                    </button>
                ))}

                {/* Row 3: 7-8-9 */}
                {[7, 8, 9].map(num => (
                    <button key={num} onClick={() => onDigit(num)} className={btnClass}>
                        {num}
                    </button>
                ))}
                
                {/* Row 4: Backspace - 0 - Submit */}
                
                {/* Red Backspace (Solid Red) */}
                <button 
                    onClick={onBackspace} 
                    className={`${actionBtnBase} bg-red-500 border-red-600 shadow-[0_4px_0_0_#991b1b] hover:bg-red-600`}
                >
                    <Delete className="w-8 h-8" />
                </button>
                
                {/* 0 */}
                <button onClick={() => onDigit(0)} className={btnClass}>
                    0
                </button>
                
                {/* Green Submit (Solid Green) */}
                <button 
                    onClick={onSubmit} 
                    className={`${actionBtnBase} bg-green-500 border-green-600 shadow-[0_4px_0_0_#166534] hover:bg-green-600`}
                >
                    <Check className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
};