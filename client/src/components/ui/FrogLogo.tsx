interface FrogLogoProps {
  className?: string;
}

export const FrogLogo = ({ className = '' }: FrogLogoProps) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path
      d="M8 24c0-3.1 1.2-5.9 3.2-8a7 7 0 0 1 13.1-3.1c1.2-.3 2.4-.4 3.7-.4s2.5.1 3.7.4a7 7 0 0 1 13.1 3.1 11.6 11.6 0 0 1 3.2 8c0 10.1-8.5 17-20 17S8 34.1 8 24Z"
      fill="currentColor"
    />
    <circle cx="17.5" cy="21" r="2" fill="#047857" />
    <circle cx="34.5" cy="21" r="2" fill="#047857" />
    <path d="M19 30c2.8 2.5 10.2 2.5 13 0" stroke="#047857" strokeLinecap="round" strokeWidth="2" />
  </svg>
);
