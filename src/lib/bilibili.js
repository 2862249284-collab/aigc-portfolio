// Accept video addresses only; remove tracking while preserving a selected part.
export function bilibiliURL(value) {
  if (typeof value !== 'string') return '';
  const input = value.trim();
  if (/^BV[1-9A-HJ-NP-Za-km-z]{10}$/.test(input)) return `https://www.bilibili.com/video/${input}/`;
  try {
    const url = new URL(input);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port || !['www.bilibili.com','bilibili.com','m.bilibili.com'].includes(url.hostname)) return '';
    const match = url.pathname.match(/^\/video\/(BV[1-9A-HJ-NP-Za-km-z]{10}|av[1-9]\d*)\/?$/);
    if (!match) return '';
    const part = url.searchParams.get('p');
    if (part !== null && !/^[1-9]\d{0,5}$/.test(part)) return '';
    return `https://www.bilibili.com/video/${match[1]}/${part && part !== '1' ? `?p=${part}` : ''}`;
  } catch { return ''; }
}

export function uniqueBilibiliURL(work, works) {
  const url = bilibiliURL(work.bilibili);
  if (!url) return '';
  return works.some(other => other !== work && bilibiliURL(other.bilibili) === url) ? '' : url;
}
