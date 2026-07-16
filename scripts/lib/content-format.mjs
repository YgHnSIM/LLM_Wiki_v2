export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function protectRenderedMath(html = '') {
  // KaTeX emits an ASCII tilde inside MathML for accents such as \tilde{x}.
  // Marked's single-tilde GFM extension can reinterpret two distant accents as
  // strikethrough when rendered math is passed through the Markdown parser.
  return String(html).replaceAll('~', '&#126;');
}

export function stripMarkdown(markdown = '') {
  return String(markdown)
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, ' ')
    .replace(/\[\[([^\]]+)\]\]/g, (_match, inside) => {
      const [target, label] = inside.split('|');
      return label?.trim() || target.split('#')[0].trim();
    })
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*#{1,6}\s*/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/_/g, ' ')
    .replace(/(\d)~(?=\d)/g, '$1–')
    .replace(/[~*]/g, '')
    .replace(/\$+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function firstParagraph(markdown = '') {
  const blocks = String(markdown)
    .replace(/^#\s+.*(?:\r?\n)+/, '')
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const candidate = blocks.find((block) => {
    const plain = stripMarkdown(block);
    return !/^(#{1,6}|```|~~~|>|[-*+]\s|\d+\.\s)/.test(block) && plain.length >= 30;
  });

  return stripMarkdown(candidate ?? markdown);
}

export function truncate(value, maxLength = 190) {
  const text = String(value).trim();
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength + 1);
  const boundary = Math.max(clipped.lastIndexOf(' '), clipped.lastIndexOf('.'), clipped.lastIndexOf('다.'));
  return `${clipped.slice(0, boundary > maxLength * 0.65 ? boundary + 1 : maxLength).trim()}…`;
}

export function readingMinutes(markdown = '') {
  return Math.max(1, Math.ceil(stripMarkdown(markdown).length / 700));
}
