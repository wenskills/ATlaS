const PATHS = {
  sparkles: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z",
  lock: "M6 10V8a6 6 0 1112 0v2M5 10h14v10H5z",
  "coin-off": "M3 3l18 18M12 21a9 9 0 100-18",
  "brand-github":
    "M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.2 4.2 0 00-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 00-6.2 0C6.5 2.7 5.4 3 5.4 3a4.2 4.2 0 00-.1 3.2A4.6 4.6 0 004 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21",
  "arrow-right": "M5 12h14M13 6l6 6-6 6",
  search: "M10 17a7 7 0 100-14 7 7 0 000 14zM21 21l-4.3-4.3",
  brain:
    "M9 4a3 3 0 00-3 3 3 3 0 00-1.5 5.6A3 3 0 007 18a3 3 0 005-2.3V6a2 2 0 00-3-1.7zm6 0a3 3 0 013 3 3 3 0 011.5 5.6A3 3 0 0117 18a3 3 0 01-5-2.3V6a2 2 0 013-1.7z",
  "chart-bar": "M4 20V10m6 10V4m6 16v-7",
  puzzle:
    "M9 3v2.5a1.5 1.5 0 003 0V3h4a1 1 0 011 1v4h-2.5a1.5 1.5 0 000 3H17v4a1 1 0 01-1 1h-4v-2.5a1.5 1.5 0 00-3 0V16H5a1 1 0 01-1-1v-4h2.5a1.5 1.5 0 000-3H4V4a1 1 0 011-1h4z",
  map: "M9 4l-6 2.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4zM9 4v13M15 6.5v13",
  sliders: "M4 6h10M18 6h2M4 12h2M10 12h10M4 18h14M22 18h0M14 6a2 2 0 11-4 0 2 2 0 014 0zM8 12a2 2 0 114 0 2 2 0 01-4 0zM18 18a2 2 0 11-4 0 2 2 0 014 0z",
  mail: "M4 6h16v12H4z M4 6l8 7 8-7",
  rocket:
    "M12 2c2.5 1.5 4 4.5 4 8 0 2-.8 4-2 5.5L12 18l-2-2.5C8.8 14 8 12 8 10c0-3.5 1.5-6.5 4-8zM9 16.5L6.5 19M15 16.5L17.5 19M10.5 9.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z",
  "file-text": "M6 2h9l5 5v15H6zM15 2v5h5M9 13h6M9 17h6M9 9h2",
  target: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 13a1 1 0 100-2 1 1 0 000 2z",
};

function Icon({ name, size = 15, strokeWidth = 1.8 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name] || ""} />
    </svg>
  );
}

export default Icon;
