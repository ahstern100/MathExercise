import React from 'react';
import { Fraction } from '../types';

interface FractionDisplayProps {
    fraction: Fraction;
    divisor?: number; // The number we are dividing by (Step 3)
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FractionDisplay: React.FC<FractionDisplayProps> = ({ fraction, divisor, size = 'lg' }) => {
    
    const getTextSize = () => {
        switch(size) {
            case 'sm': return 'text-xl';
            case 'md': return 'text-3xl';
            case 'lg': return 'text-5xl';
            case 'xl': return 'text-7xl';
            default: return 'text-5xl';
        }
    };

    const textSize = getTextSize();
    
    // Divisor hint styling - Top Left absolute position
    const DivisorHint = () => (
        <div className="absolute -top-3 -left-5 text-rose-500 transform -rotate-12 whitespace-nowrap z-10 pointer-events-none">
            <span className="text-xl font-bold opacity-80">/{divisor}</span>
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-center font-bold text-slate-700 mx-1">
            {/* Numerator */}
            <div className="relative flex items-center justify-center px-2">
                <span className={`${textSize}`}>{fraction.numerator}</span>
                {divisor && <DivisorHint />}
            </div>

            {/* Divider Line */}
            <div className="w-full h-[3px] bg-slate-700 rounded-full my-1"></div>

            {/* Denominator */}
            <div className="relative flex items-center justify-center px-2">
                <span className={`${textSize}`}>{fraction.denominator}</span>
                {divisor && <DivisorHint />}
            </div>
        </div>
    );
};