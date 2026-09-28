export const maxMarkdownCharacters = 50_000;

function plainText(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*(?:[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+|>\s*)/, '')
    .replace(/[`*_~]/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export function parseMarkdownWorkLog(value: string) {
  const markdownContent = value.replace(/\r\n?/g, '\n');
  if (!markdownContent.trim() || markdownContent.length > maxMarkdownCharacters) return undefined;

  const lines = markdownContent.split('\n');
  const heading = lines.find((line) => /^\s*#\s+\S/.test(line));
  const firstContent = lines.find((line) => line.trim() && !/^\s*(?:```|~~~|---+$)/.test(line));
  const title = plainText((heading ?? firstContent ?? '').replace(/^\s*#{1,6}\s+/, '')).slice(0, 140) || '工作日志';

  const completed: string[] = [];
  let inCompletedSection = false;
  for (const line of lines) {
    const section = line.match(/^\s*#{1,6}\s+(.+)$/);
    if (section) {
      inCompletedSection = /完成|completed|done/i.test(section[1]);
      continue;
    }
    if (!inCompletedSection) continue;
    const item = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?(.+)$/);
    if (item) completed.push(plainText(item[1]));
  }

  return { title, completed: completed.filter(Boolean).slice(0, 100), markdownContent };
}

export function markdownPreviewText(value: string, maxLength = 160): string {
  const lines = value.split(/\r?\n/);
  const excerpt = lines
    .filter((line) => !/^\s*(?:#{1,6}\s+|```|~~~|---+$)/.test(line))
    .map(plainText)
    .filter(Boolean)
    .join(' · ');
  return excerpt.slice(0, maxLength) || 'Markdown 日志';
}
