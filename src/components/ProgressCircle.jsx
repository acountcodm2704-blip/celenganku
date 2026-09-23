export default function ProgressCircle({ percent, size = 90, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const outlineRadius = radius + strokeWidth / 2 + 1.5;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" style={{ overflow: "visible" }}>
        {/* Garis tipis hitam mengikuti pinggiran lingkaran */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={outlineRadius}
          stroke="black"
          strokeWidth={2}
          fill="none"
        />
        {/* Track/latar lingkaran */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="black"
          strokeOpacity={0.1}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress aktual */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--green)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold" style={{ fontSize: size * 0.2 }}>
          {percent}%
        </span>
      </div>
    </div>
  );
}