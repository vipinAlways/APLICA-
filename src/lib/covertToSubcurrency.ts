export default function covertToSubcurrency(amount: number, factor = 100) {
  return Math.round(amount * factor);
}
