export const operations = ['add', 'substract', 'multiply', 'divide', 'module'] as const;
export type OperationNames = typeof operations[number];
export const OperationsSymbols: Record<OperationNames, string> =
{
    add: '+',
    substract: '-',
    multiply: '×',
    divide: '÷',
    module: '%',
}