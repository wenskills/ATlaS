function BrandLoader({ size = 40, label }) {
  return (
    <div className="brand-loader" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="brand-loader-svg">
        <circle cx="50" cy="50" r="42" className="brand-loader-track" />
        <g className="brand-loader-orbit">
          <circle cx="50" cy="8" r="5" className="brand-loader-dot dot-a" />
          <circle cx="86.4" cy="71" r="5" className="brand-loader-dot dot-b" />
          <circle cx="13.6" cy="71" r="5" className="brand-loader-dot dot-c" />
        </g>
        <polygon points="50,38 41,62 59,62" className="brand-loader-peak" />
      </svg>
      {label && <span className="brand-loader-label">{label}</span>}
    </div>
  );
}

export default BrandLoader;
