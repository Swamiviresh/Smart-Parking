export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#3b82f6"/>
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
        fill="white" fontSize="22" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
        P
      </text>
    </svg>
  );
}
