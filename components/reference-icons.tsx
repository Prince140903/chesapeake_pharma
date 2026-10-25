import React from "react";

export function CommercialStrategyIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="6" width="30" height="22" rx="2" stroke="#135C70" strokeWidth="1.8" fill="#F4FAFA" />
      <path d="M10 11H17" stroke="#135C70" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 19L24 14L28 17L32 12" stroke="#289CA0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="22" r="3" stroke="#135C70" strokeWidth="1.5" />
      <path d="M7 32C7 28.5 10 27 12 27C14 27 17 28.5 17 32" stroke="#135C70" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22 28V24" stroke="#135C70" strokeWidth="2" strokeLinecap="round" />
      <path d="M26 28V21" stroke="#135C70" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 28V18" stroke="#289CA0" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DrugDeliveryIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Syringe in center */}
      <rect x="18" y="10" width="4" height="15" rx="1" stroke="#135C70" strokeWidth="1.8" fill="#F4FAFA" />
      <path d="M16 10H24" stroke="#135C70" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 5V10" stroke="#135C70" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 25V33" stroke="#289CA0" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19 14H21M19 18H21M19 22H21" stroke="#289CA0" strokeWidth="1.2" strokeLinecap="round" />
      {/* Vial on left */}
      <rect x="8" y="16" width="6" height="13" rx="1.5" stroke="#135C70" strokeWidth="1.5" fill="#F4FAFA" />
      <path d="M9 14H13" stroke="#135C70" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 23H14" stroke="#289CA0" strokeWidth="1.2" />
      {/* Pipette / tube on right */}
      <rect x="26" y="16" width="6" height="13" rx="1.5" stroke="#135C70" strokeWidth="1.5" fill="#F4FAFA" />
      <path d="M27 14H31" stroke="#135C70" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 21H32" stroke="#289CA0" strokeWidth="1.2" />
    </svg>
  );
}

export function BusinessDevIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circular gear ring */}
      <circle cx="20" cy="20" r="14" stroke="#289CA0" strokeWidth="1.6" strokeDasharray="3 3" />
      {/* Handshake */}
      <path
        d="M11 20L15 16C15.5 15.5 16.5 15.5 17 16L20 19L23 16C23.5 15.5 24.5 15.5 25 16L29 20"
        stroke="#135C70"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 22L17 26C17.5 26.5 18.5 26.5 19 26L22 23L24 25"
        stroke="#135C70"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 19L22 24" stroke="#135C70" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="20" cy="20" r="1.5" fill="#289CA0" />
    </svg>
  );
}

export function CompetitiveIntelIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="28" height="20" rx="2" stroke="#135C70" strokeWidth="1.8" fill="#F4FAFA" />
      <path d="M16 28L14 33H26L24 28" stroke="#135C70" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Line chart */}
      <path d="M10 20L15 15L20 18L26 12L30 14" stroke="#289CA0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bar indicators */}
      <path d="M11 24V22" stroke="#135C70" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 24V21" stroke="#135C70" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 24V19" stroke="#135C70" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 24V17" stroke="#289CA0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MerckLogoBadge({ className = "h-4" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Merck 4-petal floral circle */}
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="none">
        <circle cx="7" cy="7" r="4.5" stroke="#007A78" strokeWidth="1.6" />
        <circle cx="13" cy="7" r="4.5" stroke="#007A78" strokeWidth="1.6" />
        <circle cx="7" cy="13" r="4.5" stroke="#007A78" strokeWidth="1.6" />
        <circle cx="13" cy="13" r="4.5" stroke="#007A78" strokeWidth="1.6" />
      </svg>
      <span className="font-extrabold text-[11px] tracking-wider text-[#007A78] uppercase">MERCK</span>
    </div>
  );
}

export function NovartisLogoBadge({ className = "h-4" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Novartis flame mark */}
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="none">
        <path d="M10 2C10 2 14 7 14 11C14 14.5 11.5 17 8.5 17C5.5 17 4 14.5 4 11C4 7 8 2 8 2" fill="#D9531E" />
        <path d="M12 8C12 8 16 11 16 14C16 16.5 14.5 18 12.5 18C10.5 18 9 16.5 9 14C9 11 12 8 12 8" fill="#003865" />
      </svg>
      <span className="font-bold text-[11px] tracking-wide text-[#003865] uppercase">NOVARTIS</span>
    </div>
  );
}
