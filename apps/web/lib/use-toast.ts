'use client';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function toast({ title, description, variant = 'default' }: ToastOptions) {
  if (typeof window !== 'undefined') {
    const isError = variant === 'destructive';
    const message = description ? `${title}: ${description}` : title;
    
    if (isError) {
      console.error(message);
    }
    
    const alertEl = document.createElement('div');
    alertEl.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all transform ${
      isError ? 'bg-red-600 text-white' : 'bg-zinc-900 text-white border border-zinc-700'
    }`;
    alertEl.innerHTML = `
      <div class="font-semibold">${title}</div>
      ${description ? `<div class="text-sm opacity-90 mt-1">${description}</div>` : ''}
    `;
    document.body.appendChild(alertEl);
    
    setTimeout(() => {
      alertEl.style.opacity = '0';
      setTimeout(() => alertEl.remove(), 300);
    }, 3000);
  }
}
