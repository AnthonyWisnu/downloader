function sanitizeSlug(text, maxLen = 30) {
  if (!text || typeof text !== 'string') return '';
  let slug = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s.-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/[-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();

  if (slug.length > maxLen) {
    slug = slug.slice(0, maxLen);
    const lastHyphen = slug.lastIndexOf('-');
    if (lastHyphen > 12) {
      slug = slug.slice(0, lastHyphen);
    }
  }

  return slug.replace(/^-+|-+$/g, '');
}

function extractShortId(url) {
  if (!url || typeof url !== 'string') return 'media';
  const clean = String(url).trim();

  const igMatch = clean.match(/(?:p|reel|tv|stories\/[^\/]+)\/([a-zA-Z0-9_-]+)/);
  if (igMatch) return igMatch[1].slice(0, 6);

  const ytPostMatch = clean.match(/[?&]lb=([a-zA-Z0-9_-]+)/) || clean.match(/\/post\/([a-zA-Z0-9_-]+)/);
  if (ytPostMatch) return ytPostMatch[1].slice(0, 6);

  const ytVidMatch = clean.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{6,11})/);
  if (ytVidMatch) return ytVidMatch[1].slice(0, 6);

  const xMatch = clean.match(/(?:status|statuses)\/(\d+)/);
  if (xMatch) {
    const digits = xMatch[1];
    return digits.length > 6 ? digits.slice(-6) : digits;
  }

  const ttMatch = clean.match(/(?:video|photo)\/(\d+)/);
  if (ttMatch) {
    const digits = ttMatch[1];
    return digits.length > 6 ? digits.slice(-6) : digits;
  }

  return 'media';
}

function getPlatformCode(platform) {
  const p = String(platform || '').toLowerCase();
  if (p === 'instagram') return 'IG';
  if (p === 'tiktok') return 'TT';
  if (p === 'x' || p === 'twitter') return 'X';
  if (p === 'youtube') return 'YT';
  return 'VOID';
}

function generateMediaFilename({
  platform = '',
  author = '',
  title = '',
  sourceUrl = '',
  kind = 'photo',
  slideIndex = null,
  totalSlides = null,
  format = 'jpg'
}) {
  const platCode = getPlatformCode(platform);
  const authorSlug = sanitizeSlug(author?.replace(/^@+/, '') || '', 20) || 'creator';
  const titleSlug = sanitizeSlug(title, 25) || 'post';
  const shortId = extractShortId(sourceUrl);

  let kindTag = kind;
  if (kind === 'slide' && slideIndex !== null) {
    kindTag = 'slide-' + String(slideIndex).padStart(2, '0');
  } else if (kind === 'zip') {
    kindTag = (totalSlides || 'all') + 'slides';
  }

  const ext = String(format || 'bin').toLowerCase().replace(/^\./, '');
  return 'VOID_' + platCode + '_' + authorSlug + '_' + titleSlug + '_' + shortId + '_' + kindTag + '.' + ext;
}

function sanitizeSafeFilename(name, defaultExt = 'bin') {
  if (!name || typeof name !== 'string') {
    return 'void-download.' + defaultExt;
  }

  let clean = name.trim().replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
  if (!clean.includes('.')) {
    clean += '.' + defaultExt;
  }
  return clean.slice(0, 100);
}

module.exports = {
  sanitizeSlug,
  extractShortId,
  getPlatformCode,
  generateMediaFilename,
  sanitizeSafeFilename
};