const root = document.querySelector<HTMLElement>('#dom-ui');

if (!root) {
  throw new Error('#dom-ui が見つかりません。');
}

export const setScreen = (content: string): void => {
  root.innerHTML = content;
};

export const clearScreen = (): void => {
  root.innerHTML = '';
};

export const qs = <T extends Element>(selector: string): T => {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`${selector} が見つかりません。`);
  return element;
};

export const qsa = <T extends Element>(selector: string): T[] => Array.from(root.querySelectorAll<T>(selector));
