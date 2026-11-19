/**
 * O ano que a home oferece como retrospectiva: em dezembro, o que está terminando; em janeiro, o que acabou
 * de terminar. Fora dessa janela (1/12 a 31/1), ou sem nada concluído no ano, não há aviso. O menu abre qualquer ano.
 */
export function bannerYear(now: Date, years: number[]): number | null {
  const month = now.getMonth();
  const year = month === 11 ? now.getFullYear() : month === 0 ? now.getFullYear() - 1 : null;
  return year !== null && years.includes(year) ? year : null;
}
