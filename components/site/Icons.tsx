/** Small line icons shared by buttons and links. Decorative (aria-hidden). */

export const Arrow = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const UpRight = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const Phone = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M5.2 2.5 3.4 3.1c-.7.3-1.1 1-1 1.8.6 4.3 4.4 8.1 8.7 8.7.8.1 1.5-.3 1.8-1l.6-1.8-2.7-1.6-1.3 1.2C7.8 9.8 6.2 8.2 5.6 6.5l1.2-1.3Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

export const Pin = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
    <path d="M8 14.5s4.6-4.3 4.6-8a4.6 4.6 0 0 0-9.2 0c0 3.7 4.6 8 4.6 8Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="8" cy="6.4" r="1.6" fill="currentColor" />
  </svg>
);
