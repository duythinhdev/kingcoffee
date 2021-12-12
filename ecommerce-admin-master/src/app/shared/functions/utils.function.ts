export function isNumber(value: any): value is number {
    return !isNaN(toInteger(value));
}
  
export function toInteger(value: any): number {
    return parseInt(`${value}`, 10);
}