export interface Fraction {
    numerator: number;
    denominator: number;
}

export enum GameState {
    DECIDE_REDUCTION = 'DECIDE_REDUCTION', // Step 1 & 2
    PERFORM_CALCULATION = 'PERFORM_CALCULATION', // Step 3 & 4
    VICTORY = 'VICTORY' // Done all 3
}

export interface HistoryStep {
    fraction: Fraction;
    divisor: number;
}
