const PALETTE = [
  "#C17B4B",
  "#7B6B52",
  "#5B8A6B",
  "#A0714F",
  "#6B7FA0",
  "#8A6BA0",
  "#A07B6B",
  "#6BA08A",
];

export function dogPlaceholderColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
