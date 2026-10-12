// Icone SVG in linea: ereditano il colore del testo (currentColor).

function Icon({ children, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export function MenuIcon(props) {
  return <Icon {...props}><path d="M3 6h18M3 12h18M3 18h18" /></Icon>;
}

export function SearchIcon(props) {
  return <Icon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>;
}

export function CloseIcon(props) {
  return <Icon {...props}><path d="M6 6l12 12M18 6 6 18" /></Icon>;
}

export function BookmarkIcon({ filled = false, ...props }) {
  return (
    <Icon {...props}>
      <path d="M6 3h12v18l-6-4.5L6 21z" fill={filled ? "currentColor" : "none"} />
    </Icon>
  );
}
