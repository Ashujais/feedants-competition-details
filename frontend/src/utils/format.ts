export const money = (value: number) => `\u20B9 ${value.toLocaleString('en-IN')}`;

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }).format(new Date(value));
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
