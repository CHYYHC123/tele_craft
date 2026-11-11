/** 拼接 className，自动过滤 falsy 值 */
export const cn = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(' ');
