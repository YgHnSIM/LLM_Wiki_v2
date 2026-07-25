const subtitleDashPart = /^\s+—\s+$/u;
const subtitleDashSplit = /(\s+—\s+)/u;

export function splitTitleAtSubtitleDash(value) {
  return String(value ?? '').split(subtitleDashSplit);
}

export function isSubtitleDashPart(value) {
  return subtitleDashPart.test(String(value ?? ''));
}

export function appendTitleWithSubtitleColon(element, value, appendText = (target, text) => {
  target.append(target.ownerDocument.createTextNode(text));
}) {
  if (!element?.ownerDocument) return;

  for (const part of splitTitleAtSubtitleDash(value)) {
    if (!part) continue;
    if (!isSubtitleDashPart(part)) {
      appendText(element, part);
      continue;
    }
    appendText(element, ': ');
  }
}
