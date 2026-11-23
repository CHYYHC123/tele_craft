/** 把 id 对应的项向上移动一位；已经在最上面或找不到时返回原数组 */
export const moveItemUp = <T extends { id: number }>(items: T[], id: number): T[] => {
  const index = items.findIndex((item) => item.id === id);
  if (index <= 0) return items;

  const next = [...items];
  [next[index - 1], next[index]] = [next[index], next[index - 1]];
  return next;
};
