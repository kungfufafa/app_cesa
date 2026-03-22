const HTML_ENTITY_MAP: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&#(\d+);/g, (_match: string, rawCode: string) => {
      const code = Number(rawCode);
      return Number.isFinite(code) ? String.fromCharCode(code) : "";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_match: string, rawCode: string) => {
      const code = parseInt(rawCode, 16);
      return Number.isFinite(code) ? String.fromCharCode(code) : "";
    })
    .replace(/&(nbsp|amp|lt|gt|quot);|&#39;/g, (match: string) => HTML_ENTITY_MAP[match] ?? match);

const normalizeWhitespace = (value: string): string =>
  value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .trim();

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const htmlToPlainText = (html?: string | null): string => {
  if (!html) return "";

  const text: string = html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<\/\s*(p|div|li|ul|ol|h[1-6]|tr)\s*>/gi, "\n")
    .replace(/<a[^>]*href=(['"])(.*?)\1[^>]*>(.*?)<\/a>/gi, (_match: string, _quote: string, href: string, label: string) => {
      const readableLabel: string = htmlToPlainText(label);
      return readableLabel ? `${readableLabel} (${href})` : href;
    })
    .replace(/<[^>]+>/g, "");

  return normalizeWhitespace(decodeHtmlEntities(text));
};

export const plainTextToHtml = (text?: string | null): string => {
  const normalizedText = normalizeWhitespace(text ?? "");

  if (!normalizedText) {
    return "";
  }

  return normalizedText
    .split(/\n{2,}/)
    .map((paragraph: string) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
};

export const extractInlineUrlsFromHtml = (html?: string | null): string[] => {
  if (!html) return [];

  const urls: string[] = [];
  const pushUrl = (value?: string | null) => {
    const normalizedValue = value?.trim();
    if (!normalizedValue || urls.includes(normalizedValue)) {
      return;
    }

    urls.push(normalizedValue);
  };

  const hrefRegex = /href=(['"])(.*?)\1/gi;
  let hrefMatch = hrefRegex.exec(html);
  while (hrefMatch) {
    pushUrl(hrefMatch[2]);
    hrefMatch = hrefRegex.exec(html);
  }

  const text = decodeHtmlEntities(html);
  const urlRegex = /https?:\/\/[^\s<>"')]+/gi;
  let urlMatch = urlRegex.exec(text);
  while (urlMatch) {
    pushUrl(urlMatch[0]);
    urlMatch = urlRegex.exec(text);
  }

  return urls;
};
