import { Fraction } from './types';

// Greatest Common Divisor
export const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
};

export const generateRandomFraction = (): Fraction => {
    // Generate a fraction that is likely reducible for practice
    // We pick a "base" irreducible fraction, then multiply by a factor
    
    // Random base numerator 1-10
    const baseNum = Math.floor(Math.random() * 9) + 1;
    // Random base denominator (must be larger than num usually for proper fractions, but improper is fine too technically. Let's stick to simple logic)
    // Let's ensure they are different
    let baseDenom = Math.floor(Math.random() * 9) + 2;
    while (baseDenom === baseNum) {
        baseDenom = Math.floor(Math.random() * 9) + 2;
    }

    // Determine a multiplier to make it reducible (2, 3, 4, 5, 6, 10)
    const multiplier = [2, 3, 4, 5, 6, 10][Math.floor(Math.random() * 6)];
    
    // Sometimes allow already simplified fractions to test the "X" button
    const isAlreadySimplified = Math.random() > 0.75; // 25% chance it's already simplified

    if (isAlreadySimplified) {
        // Ensure the base is simplified
        const common = gcd(baseNum, baseDenom);
        return {
            numerator: baseNum / common,
            denominator: baseDenom / common
        };
    }

    return {
        numerator: baseNum * multiplier,
        denominator: baseDenom * multiplier
    };
};
