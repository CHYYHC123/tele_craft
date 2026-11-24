const pad = (value: number) => String(value).padStart(2, '0');

/** ISO 时间格式化为本地 `YYYY-MM-DD HH:mm`；无法解析时返回 `--` */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '--';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '--';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** 整数百分比：正数带 `+`，null/undefined 返回 `--`，如 20 → `+20%`、-8 → `-8%` */
export function formatChange(change: number | null | undefined): string {
  if (change === null || change === undefined) return '--';
  return `${change > 0 ? '+' : ''}${change}%`;
}
