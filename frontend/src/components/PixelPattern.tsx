export default function PixelPattern({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="pixel-pattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="4" height="4" fill="currentColor" opacity="0.4" />
          <rect x="8" y="8" width="4" height="4" fill="currentColor" opacity="0.2" />
          <rect x="16" y="16" width="4" height="4" fill="currentColor" opacity="0.4" />
          <rect x="20" y="4" width="4" height="4" fill="currentColor" opacity="0.1" />
          <rect x="4" y="20" width="4" height="4" fill="currentColor" opacity="0.1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#pixel-pattern)" />
    </svg>
  );
}
