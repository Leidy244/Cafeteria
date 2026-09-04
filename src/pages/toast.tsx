import type { ToastType } from '../types';

let toastFn: ((message: string, type?: ToastType) => void) | null = null;

export function registerToastHandler(handler: (message: string, type?: ToastType) => void) {
  toastFn = handler;
}

export function showToast(message: string, type: ToastType = 'success') {
  if (toastFn) {
    toastFn(message, type);
  } else {
    console.warn('Toast not available:', message);
  }
}
