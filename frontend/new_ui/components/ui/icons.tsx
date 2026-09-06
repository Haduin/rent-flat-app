import {CSSProperties} from "react";

export interface IconProps {
    size?: number;
    color?: string;
    style?: CSSProperties;
}

const base = (size: number) => ({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
});

export const IconHome = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <path d="M3 11l9-7 9 7"/>
        <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/>
    </svg>
);

export const IconGrid = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
);

export const IconCard = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <rect x="2" y="6" width="20" height="13" rx="2"/>
        <path d="M2 10h20"/>
    </svg>
);

export const IconTrendingUp = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <path d="M4 17l6-6 4 4 6-8"/>
        <path d="M14 7h6v6"/>
    </svg>
);

export const IconWallet = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
);

export const IconSearch = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <circle cx="11" cy="11" r="7"/>
        <path d="m21 21-4.35-4.35"/>
    </svg>
);

export const IconPlus = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <path d="M12 5v14M5 12h14"/>
    </svg>
);

export const IconMore = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
        <circle cx="5" cy="12" r="1.5"/>
        <circle cx="12" cy="12" r="1.5"/>
        <circle cx="19" cy="12" r="1.5"/>
    </svg>
);

export const IconCalendar = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
);

export const IconUsers = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <circle cx="9" cy="8" r="3.2"/>
        <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/>
        <circle cx="17.5" cy="9.2" r="2.4"/>
        <path d="M15.8 14.2c2.7.4 4.7 2.4 4.7 5.3"/>
    </svg>
);

export const IconFileText = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <path d="M6 2h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"/>
        <path d="M14 2v6h6"/>
        <path d="M9 13h6M9 17h6"/>
    </svg>
);

export const IconBell = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
    </svg>
);

export const IconPencil = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>
    </svg>
);

export const IconTrash = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <path d="M4 7h16"/>
        <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>
        <path d="M10 11v6M14 11v6"/>
        <path d="M9 7V4h6v3"/>
    </svg>
);

export const IconEye = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

export const IconCheck = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <path d="M20 6 9 17l-5-5"/>
    </svg>
);

export const IconSplit = ({size = 16, color = "currentColor", style}: IconProps) => (
    <svg {...base(size)} stroke={color} style={style}>
        <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
        <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
        <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
        <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
        <path d="M12 3v18"/>
    </svg>
);
