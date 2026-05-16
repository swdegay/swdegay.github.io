import { bold, gray, green, italic, red, yellow } from '@std/fmt/colors';

const log = {
  success: (l: string, m: string) => console.log(`${green(bold(l))} ${m}`),
  error: (l: string, m: string) => console.error(`${red(bold(l))} ${m}`),
  hint: (m: string) => console.info(gray(italic(m))),
  warn: (l: string, m: string) => console.warn(`${yellow(bold(l))} ${m}`),
};

export default log;
