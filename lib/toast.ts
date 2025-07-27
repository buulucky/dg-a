// Toast notification utility
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number; // milliseconds, default 4000
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

const getToastStyles = (type: ToastType, position: string) => {
  // ใช้ inline styles แทน Tailwind เพื่อให้แน่ใจว่าทำงาน
  const baseStyles = `
    position: fixed;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    z-index: 9999;
    transform: translateX(100%);
    transition: all 0.3s ease-out;
    max-width: 350px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: white;
    border: 1px solid;
  `;
  
  const typeStyles = {
    success: 'background: linear-gradient(135deg, #10b981, #059669); border-color: #059669;',
    error: 'background: linear-gradient(135deg, #ef4444, #dc2626); border-color: #dc2626;',
    warning: 'background: linear-gradient(135deg, #f59e0b, #d97706); border-color: #d97706;',
    info: 'background: linear-gradient(135deg, #3b82f6, #2563eb); border-color: #2563eb;'
  };

  const positionStyles = {
    'top-right': 'top: 24px; right: 24px;',
    'top-left': 'top: 24px; left: 24px;',
    'bottom-right': 'bottom: 24px; right: 24px;',
    'bottom-left': 'bottom: 24px; left: 24px;',
    'top-center': 'top: 24px; left: 50%; transform: translateX(-50%);'
  };

  return `${baseStyles} ${typeStyles[type]} ${positionStyles[position as keyof typeof positionStyles]}`;
};

const getIcon = (type: ToastType) => {
  const icons = {
    success: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>`,
    error: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>`,
    warning: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>`,
    info: `<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
           </svg>`
  };
  return icons[type];
};

const showToast = (message: string, type: ToastType = 'info', options: ToastOptions = {}) => {
  const { duration = 4000, position = 'top-right' } = options;

  // สร้าง toast element
  const toast = document.createElement('div');
  toast.style.cssText = getToastStyles(type, position);
  
  // สร้าง HTML content โดยไม่ใช้ Tailwind classes
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="flex-shrink: 0;">
        ${getIcon(type)}
      </div>
      <div style="flex: 1;">
        <p style="margin: 0; font-weight: 600; line-height: 1.4;">${message}</p>
      </div>
    </div>
  `;

  document.body.appendChild(toast);

  // แสดง toast ด้วย animation
  setTimeout(() => {
    if (position.includes('center')) {
      toast.style.transform = 'translateX(-50%) scale(1)';
    } else {
      toast.style.transform = 'translateX(0) scale(1)';
    }
    toast.style.opacity = '1';
  }, 100);

  // ซ่อน toast
  setTimeout(() => {
    if (position.includes('right')) {
      toast.style.transform = 'translateX(100%) scale(0.8)';
    } else if (position.includes('left')) {
      toast.style.transform = 'translateX(-100%) scale(0.8)';
    } else {
      toast.style.transform = 'translateX(-50%) scale(0.8)';
    }
    toast.style.opacity = '0';
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, duration);
};

// Export functions สำหรับใช้งานง่าย
export const toast = {
  success: (message: string, options?: ToastOptions) => showToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) => showToast(message, 'error', options),
  warning: (message: string, options?: ToastOptions) => showToast(message, 'warning', options),
  info: (message: string, options?: ToastOptions) => showToast(message, 'info', options),
};

export default toast;
