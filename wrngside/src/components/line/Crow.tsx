/** House crow, perched or flapping. Side view, facing right. */
export function Crow() {
  return (
    <svg className="crow-svg" viewBox="0 0 80 60" aria-hidden="true" focusable="false">
      <g className="crow-perched">
        <path d="M22 40 C18 30 26 18 40 17 C48 16 54 20 57 24 L64 25 L57 28 C57 36 50 44 40 46 L30 47 L12 55 L22 44 Z" fill="#070707" />
        <path d="M31 27 C38 24 48 26 52 33 C46 31 38 31 31 27 Z" fill="#1b1b20" />
        <circle cx="52" cy="22.5" r="1.3" fill="#8a8a8a" />
        <path d="M37 46 L36 54 M43 46 L44 54" stroke="#070707" strokeWidth="1.6" />
        <path d="M33 54 L39 54 M41 54 L47 54" stroke="#070707" strokeWidth="1.4" />
      </g>
      <g className="crow-flying">
        <path d="M24 34 C24 28 32 24 42 24 C50 24 55 27 58 30 L66 31 L58 34 C55 38 48 40 40 40 L28 40 L14 46 L22 37 Z" fill="#070707" />
        <path className="wing-up" d="M34 28 C30 16 22 8 12 4 C22 14 26 22 28 30 Z M44 27 C46 15 52 6 60 2 C54 12 50 22 48 29 Z" fill="#070707" />
        <path className="wing-down" d="M34 36 C28 44 18 52 6 56 C18 46 24 40 28 34 Z M46 36 C50 46 54 52 62 58 C52 52 46 44 44 37 Z" fill="#070707" />
      </g>
    </svg>
  );
}
