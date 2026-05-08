'use client';

import { toPng } from 'html-to-image';
import { useEffect, useRef, useState } from 'react';

// ─── Canvas dimensions (design at largest required Apple resolution) ───────────
const W = 1320;
const H = 2868;

// ─── Export sizes ──────────────────────────────────────────────────────────────
const IPHONE_SIZES = [
    { label: '6.9"', w: 1320, h: 2868 },
    { label: '6.5"', w: 1284, h: 2778 },
    { label: '6.3"', w: 1206, h: 2622 },
    { label: '6.1"', w: 1125, h: 2436 },
] as const;

// ─── iPhone mockup pre-measured values ────────────────────────────────────────
const MK_W = 1022;
const MK_H = 2082;
const MK_RATIO = MK_W / MK_H;
const SC_L = (52 / MK_W) * 100;
const SC_T = (46 / MK_H) * 100;
const SC_W = (918 / MK_W) * 100;
const SC_H = (1990 / MK_H) * 100;
const SC_RX = (126 / 918) * 100;
const SC_RY = (126 / 1990) * 100;

// ─── Width formula ─────────────────────────────────────────────────────────────
function phoneW(cW: number, cH: number, clamp = 0.84) {
    return Math.min(clamp, 0.72 * (cH / cW) * MK_RATIO);
}

// ─── Image preload cache ───────────────────────────────────────────────────────
const IMAGE_PATHS = [
    '/mockup.png',
    '/app-icon.png',
    '/screenshots/calendar.png',
    '/screenshots/search.png',
    '/screenshots/map.png',
    '/screenshots/planner.png',
    '/screenshots/planner-degree.png',
];
const imageCache: Record<string, string> = {};

async function preloadAllImages() {
    await Promise.all(
        IMAGE_PATHS.map(async (path) => {
            try {
                const resp = await fetch(path);
                const blob = await resp.blob();
                const dataUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
                imageCache[path] = dataUrl;
            } catch {
                console.warn(`Failed to preload: ${path}`);
            }
        })
    );
}

function img(path: string): string {
    return imageCache[path] || path;
}

// ─── Themes ────────────────────────────────────────────────────────────────────
const THEMES = {
    'blue-light': {
        bg: '#f5f6fc',
        bgAlt: '#eef0fa',
        fg: '#212529',
        accent: '#305db7',
        accentLight: '#5b82d4',
        muted: '#606166',
        cardBg: '#ffffff',
        pillBg: '#e8edf8',
        pillFg: '#305db7',
        label: 'UCI Blue · Light',
    },
    'blue-dark': {
        bg: '#0d1117',
        bgAlt: '#161b26',
        fg: '#f0f4ff',
        accent: '#5b82d4',
        accentLight: '#7ba3f0',
        muted: '#8b9ab8',
        cardBg: '#1a2035',
        pillBg: '#1e2d52',
        pillFg: '#7ba3f0',
        label: 'UCI Blue · Dark',
    },
} as const;

type ThemeId = keyof typeof THEMES;

// ─── Copy ──────────────────────────────────────────────────────────────────────
const SLIDES_COPY = [
    {
        id: 'hero',
        label: 'SCHEDULE SMARTER',
        headline: (
            <>
                Your schedule,
                <br />
                sorted.
            </>
        ),
        // sub: "The #1 planner for UCI students.",
    },
    {
        id: 'search',
        label: 'COURSE SEARCH',
        headline: (
            <>
                140+ departments.
                <br />
                One search.
            </>
        ),
        sub: 'Find any UCI course instantly.',
    },
    {
        id: 'schedule',
        label: 'SCHEDULE BUILDER',
        headline: (
            <>
                Build conflict-
                <br />
                free schedules.
            </>
        ),
        sub: 'Compare variations before you enroll.',
    },
    {
        id: 'grades',
        label: 'GRADE DISTRIBUTIONS',
        headline: (
            <>
                Pick the right
                <br />
                professor.
            </>
        ),
        sub: 'See grade distributions before you commit.',
    },
    {
        id: 'map',
        label: 'CAMPUS MAP',
        headline: <>Never get lost on campus again.</>,
        sub: 'See exactly where each class meets.',
    },
    {
        id: 'more',
        label: 'AND MORE',
        headline: (
            <>
                Everything
                <br />
                you need.
            </>
        ),
        sub: null,
    },
] as const;

// ─── Device frame ──────────────────────────────────────────────────────────────
function Phone({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
    return (
        <div
            style={{
                position: 'relative',
                aspectRatio: `${MK_W}/${MK_H}`,
                ...style,
            }}
        >
            <img
                src={img('/mockup.png')}
                alt=""
                style={{ display: 'block', width: '100%', height: '100%' }}
                draggable={false}
            />
            <div
                style={{
                    position: 'absolute',
                    zIndex: 10,
                    overflow: 'hidden',
                    left: `${SC_L}%`,
                    top: `${SC_T}%`,
                    width: `${SC_W}%`,
                    height: `${SC_H}%`,
                    borderRadius: `${SC_RX}% / ${SC_RY}%`,
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top',
                    }}
                    draggable={false}
                />
            </div>
        </div>
    );
}

// ─── Caption ───────────────────────────────────────────────────────────────────
function Caption({
    cW,
    label,
    headline,
    sub,
    theme,
    align = 'center',
}: {
    cW: number;
    label: string;
    headline: React.ReactNode;
    sub?: string | null;
    theme: (typeof THEMES)[ThemeId];
    align?: 'center' | 'left';
}) {
    return (
        <div style={{ textAlign: align }}>
            <div
                style={{
                    fontSize: cW * 0.028,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    color: theme.accent,
                    textTransform: 'uppercase',
                    marginBottom: cW * 0.02,
                }}
            >
                {label}
            </div>
            <div
                style={{
                    fontSize: cW * 0.095,
                    fontWeight: 700,
                    lineHeight: 1.0,
                    color: theme.fg,
                }}
            >
                {headline}
            </div>
            {sub && (
                <div
                    style={{
                        fontSize: cW * 0.038,
                        fontWeight: 400,
                        color: theme.muted,
                        marginTop: cW * 0.025,
                        lineHeight: 1.4,
                    }}
                >
                    {sub}
                </div>
            )}
        </div>
    );
}

// ─── Decorative blob ───────────────────────────────────────────────────────────
function Blob({
    x,
    y,
    size,
    color,
    opacity = 0.18,
}: {
    x: string;
    y: string;
    size: string;
    color: string;
    opacity?: number;
}) {
    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: size,
                height: size,
                borderRadius: '50%',
                background: color,
                opacity,
                filter: 'blur(80px)',
                pointerEvents: 'none',
            }}
        />
    );
}

// ─── Feature pills ─────────────────────────────────────────────────────────────
const FEATURE_PILLS = [
    'Course search',
    'Grade distributions',
    'Campus map',
    '4-year planner',
    'Quarter-by-quarter roadmap',
    'Search GEs',
    'Enrollment history',
    'Multiple schedules',
    'Open source',
];

// ─── Slides ────────────────────────────────────────────────────────────────────
type SlideProps = { cW: number; cH: number; theme: (typeof THEMES)[ThemeId] };

function Slide1({ cW, cH, theme }: SlideProps) {
    const fw = phoneW(cW, cH) * 100;
    const copy = SLIDES_COPY[0];
    const isDark = theme.bg === THEMES['blue-dark'].bg;

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: isDark
                    ? `radial-gradient(ellipse at 60% 30%, #1a2a5e 0%, ${theme.bg} 70%)`
                    : `radial-gradient(ellipse at 60% 20%, #d6e2ff 0%, ${theme.bg} 65%)`,
            }}
        >
            <Blob x="55%" y="-5%" size={`${cW * 0.9}px`} color={theme.accent} opacity={isDark ? 0.15 : 0.12} />
            <Blob x="-15%" y="50%" size={`${cW * 0.7}px`} color={theme.accentLight} opacity={isDark ? 0.1 : 0.08} />

            {/* App icon + wordmark */}
            <div
                style={{
                    position: 'absolute',
                    top: cH * 0.06,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: cW * 0.035,
                }}
            >
                <img
                    src={img('/app-icon.png')}
                    alt="AntAlmanac"
                    style={{
                        width: cW * 0.13,
                        height: cW * 0.13,
                        borderRadius: cW * 0.028,
                        boxShadow: `0 ${cW * 0.01}px ${cW * 0.04}px rgba(0,0,0,${isDark ? 0.5 : 0.15})`,
                    }}
                    draggable={false}
                />
                <div
                    style={{
                        fontSize: cW * 0.055,
                        fontWeight: 700,
                        color: theme.fg,
                        letterSpacing: '-0.01em',
                    }}
                >
                    AntAlmanac
                </div>
            </div>

            {/* Caption */}
            <div
                style={{
                    position: 'absolute',
                    top: cH * 0.17,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '88%',
                }}
            >
                <Caption cW={cW} label={copy.label} headline={copy.headline} sub={null} theme={theme} />
            </div>

            {/* Phone — centered, peeking from bottom */}
            <Phone
                src={img('/screenshots/calendar.png')}
                alt="Weekly schedule"
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: `translateX(-50%) translateY(8%)`,
                    width: `${fw}%`,
                    filter: `drop-shadow(0 ${cW * 0.02}px ${cW * 0.06}px rgba(0,0,0,${isDark ? 0.55 : 0.22}))`,
                }}
            />
        </div>
    );
}

function Slide2({ cW, cH, theme }: SlideProps) {
    const fw = phoneW(cW, cH, 0.78) * 100;
    const copy = SLIDES_COPY[1];
    const isDark = theme.bg === THEMES['blue-dark'].bg;

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: isDark
                    ? `linear-gradient(160deg, #0d1117 0%, #151d35 100%)`
                    : `linear-gradient(160deg, ${theme.bg} 0%, #dce6ff 100%)`,
            }}
        >
            <Blob x="60%" y="10%" size={`${cW * 0.8}px`} color={theme.accentLight} opacity={0.13} />

            {/* Phone — offset right */}
            <Phone
                src={img('/screenshots/search.png')}
                alt="Course search"
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: '-6%',
                    transform: 'translateY(6%) rotate(3deg)',
                    width: `${fw}%`,
                    filter: `drop-shadow(0 ${cW * 0.02}px ${cW * 0.07}px rgba(0,0,0,${isDark ? 0.6 : 0.2}))`,
                }}
            />

            {/* Caption — left-anchored, vertically centered */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '7%',
                    width: '100%',
                    transform: 'translateY(-283%)',
                }}
            >
                <Caption
                    cW={cW}
                    label={copy.label}
                    headline={copy.headline}
                    sub={copy.sub}
                    theme={theme}
                    align="left"
                />
            </div>

            {/* Department count badge */}
            <div
                style={{
                    position: 'absolute',
                    bottom: cH * 0.24,
                    left: '7%',
                    background: theme.cardBg,
                    borderRadius: cW * 0.03,
                    padding: `${cW * 0.025}px ${cW * 0.04}px`,
                    boxShadow: `0 ${cW * 0.005}px ${cW * 0.025}px rgba(0,0,0,${isDark ? 0.4 : 0.1})`,
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: cW * 0.008,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(48,93,183,0.1)'}`,
                }}
            >
                <div
                    style={{
                        fontSize: cW * 0.065,
                        fontWeight: 800,
                        color: theme.accent,
                        lineHeight: 1,
                    }}
                >
                    10,000+
                </div>
                <div
                    style={{
                        fontSize: cW * 0.03,
                        color: theme.muted,
                        fontWeight: 500,
                    }}
                >
                    courses
                </div>
            </div>

            {/* Enrollment alerts pill */}
            <div
                style={{
                    position: 'absolute',
                    bottom: cH * 0.14,
                    left: '7%',
                    background: isDark ? '#1a2e3a' : '#e3f2ff',
                    borderRadius: cW * 0.03,
                    padding: `${cW * 0.022}px ${cW * 0.035}px`,
                    boxShadow: `0 ${cW * 0.005}px ${cW * 0.025}px rgba(0,0,0,${isDark ? 0.4 : 0.1})`,
                    border: `1px solid ${isDark ? 'rgba(91,130,212,0.2)' : 'rgba(48,93,183,0.15)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: cW * 0.015,
                }}
            >
                <div style={{ fontSize: cW * 0.032, lineHeight: 1 }}>🔔</div>
                <div style={{ fontSize: cW * 0.026, color: theme.accent, fontWeight: 600 }}>Get enrollment alerts</div>
            </div>

            {/* GPA history pill */}
            <div
                style={{
                    position: 'absolute',
                    bottom: cH * 0.08,
                    right: '7%',
                    background: isDark ? '#1a2e3a' : '#e3f2ff',
                    borderRadius: cW * 0.03,
                    padding: `${cW * 0.025}px ${cW * 0.04}px`,
                    boxShadow: `0 ${cW * 0.005}px ${cW * 0.025}px rgba(0,0,0,${isDark ? 0.4 : 0.1})`,
                    border: `1px solid ${isDark ? 'rgba(91,130,212,0.2)' : 'rgba(48,93,183,0.15)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: cW * 0.018,
                }}
            >
                <div style={{ fontSize: cW * 0.038, lineHeight: 1 }}>📊</div>
                <div style={{ fontSize: cW * 0.032, color: theme.accent, fontWeight: 600 }}>View GPA history</div>
            </div>
        </div>
    );
}

function Slide3({ cW, cH, theme }: SlideProps) {
    const fw = phoneW(cW, cH) * 100;
    const copy = SLIDES_COPY[4]; // map copy
    const isDark = theme.bg === THEMES['blue-dark'].bg;

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: isDark
                    ? `linear-gradient(170deg, #0d1a18 0%, #0d1117 60%)`
                    : `linear-gradient(170deg, #e8f4f0 0%, ${theme.bg} 60%)`,
            }}
        >
            <Blob x="-20%" y="20%" size={`${cW}px`} color="#2a8c6e" opacity={isDark ? 0.13 : 0.1} />
            <Blob x="50%" y="55%" size={`${cW * 0.7}px`} color={theme.accentLight} opacity={0.1} />

            {/* Caption top-center */}
            <div
                style={{
                    position: 'absolute',
                    top: cH * 0.07,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '88%',
                }}
            >
                <Caption cW={cW} label={copy.label} headline={copy.headline} sub={copy.sub} theme={theme} />
            </div>

            {/* Phone centered */}
            <Phone
                src={img('/screenshots/map.png')}
                alt="Campus map"
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%) translateY(6%)',
                    width: `${fw}%`,
                    filter: `drop-shadow(0 ${cW * 0.02}px ${cW * 0.06}px rgba(0,0,0,${isDark ? 0.55 : 0.2}))`,
                }}
            />

            {/* Walking time badge */}
            <div
                style={{
                    position: 'absolute',
                    top: cH * 0.8,
                    left: '5%',
                    background: theme.cardBg,
                    borderRadius: cW * 0.035,
                    padding: `${cW * 0.03}px ${cW * 0.045}px`,
                    boxShadow: `0 ${cW * 0.008}px ${cW * 0.035}px rgba(0,0,0,${isDark ? 0.45 : 0.12})`,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(48,93,183,0.08)'}`,
                    zIndex: 20,
                }}
            >
                <div
                    style={{
                        fontSize: cW * 0.026,
                        color: theme.muted,
                        marginBottom: cW * 0.01,
                        fontWeight: 500,
                    }}
                >
                    Walking time
                </div>
                <div
                    style={{
                        fontSize: cW * 0.056,
                        fontWeight: 800,
                        color: theme.accent,
                        lineHeight: 1,
                    }}
                >
                    4 min
                </div>
                <div
                    style={{
                        fontSize: cW * 0.024,
                        color: theme.muted,
                        marginTop: cW * 0.008,
                    }}
                >
                    ICS → ALP
                </div>
            </div>

            {/* Directions badge */}
            <div
                style={{
                    position: 'absolute',
                    top: cH * 0.7,
                    right: '5%',
                    background: isDark ? '#1a2e3a' : '#e3f2ff',
                    borderRadius: cW * 0.035,
                    padding: `${cW * 0.03}px ${cW * 0.045}px`,
                    boxShadow: `0 ${cW * 0.008}px ${cW * 0.035}px rgba(0,0,0,${isDark ? 0.45 : 0.1})`,
                    border: `1px solid ${isDark ? 'rgba(91,130,212,0.2)' : 'rgba(48,93,183,0.15)'}`,
                    zIndex: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: cW * 0.015,
                }}
            >
                <div style={{ fontSize: cW * 0.038, lineHeight: 1 }}>📍</div>
                <div
                    style={{
                        fontSize: cW * 0.028,
                        color: theme.accent,
                        fontWeight: 600,
                    }}
                >
                    Get directions
                </div>
            </div>
        </div>
    );
}

function Slide4({ cW, cH, theme }: SlideProps) {
    const fw1 = phoneW(cW, cH, 0.76) * 100;
    const fw2 = phoneW(cW, cH, 0.76) * 100;
    const isDark = theme.bg === THEMES['blue-dark'].bg;

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: isDark
                    ? `linear-gradient(155deg, #0d1117 0%, #0f1e38 100%)`
                    : `linear-gradient(155deg, ${theme.bg} 0%, #d4e3ff 100%)`,
            }}
        >
            <Blob x="-10%" y="-5%" size={`${cW * 0.9}px`} color={theme.accent} opacity={0.12} />
            <Blob x="60%" y="50%" size={`${cW * 0.7}px`} color={theme.accentLight} opacity={0.1} />

            {/* Caption — top center */}
            <div
                style={{
                    position: 'absolute',
                    top: cH * 0.07,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '88%',
                }}
            >
                <Caption
                    cW={cW}
                    label="4-YEAR PLANNER"
                    headline={<>Plan all 4 years.</>}
                    sub="Map every quarter before you enroll."
                    theme={theme}
                    align="center"
                />
            </div>

            {/* Phone 1 — quarterly view, left, front */}
            <Phone
                src={img('/screenshots/planner.png')}
                alt="4-year planner"
                style={{
                    position: 'absolute',
                    bottom: 120,
                    left: '-4%',
                    transform: 'translateY(8%) rotate(-4deg)',
                    width: `${fw1}%`,
                    filter: `drop-shadow(0 ${cW * 0.02}px ${cW * 0.07}px rgba(0,0,0,${isDark ? 0.6 : 0.22}))`,
                    zIndex: 10,
                    scale: 1.1,
                }}
            />

            {/* Phone 2 — degree requirements, right, angled up */}
            <Phone
                src={img('/screenshots/planner-degree.png')}
                alt="Degree requirements"
                style={{
                    position: 'absolute',
                    bottom: '-11.5%',
                    right: '-18%',
                    transform: 'translateY(-5%) rotate(5deg)',
                    width: `${fw2}%`,
                    filter: `drop-shadow(0 ${cW * 0.02}px ${cW * 0.07}px rgba(0,0,0,${isDark ? 0.55 : 0.18}))`,
                    zIndex: 15,
                }}
            />
        </div>
    );
}

function Slide5({ cW, cH, theme }: SlideProps) {
    const copy = SLIDES_COPY[5];
    const isDark = theme.bg === THEMES['blue-dark'].bg;

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: isDark
                    ? `linear-gradient(180deg, #0f1525 0%, #0d1117 100%)`
                    : `linear-gradient(180deg, #1e3a8a 0%, #305db7 100%)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: `0 ${cW * 0.08}px`,
            }}
        >
            <Blob x="60%" y="-10%" size={`${cW}px`} color={isDark ? theme.accentLight : '#ffffff'} opacity={0.08} />
            <Blob x="-20%" y="60%" size={`${cW * 0.8}px`} color={isDark ? theme.accent : '#3b82f6'} opacity={0.1} />

            {/* App icon */}
            <img
                src={img('/app-icon.png')}
                alt="AntAlmanac"
                style={{
                    width: cW * 0.22,
                    height: cW * 0.22,
                    borderRadius: cW * 0.05,
                    marginBottom: cH * 0.04,
                    boxShadow: `0 ${cW * 0.015}px ${cW * 0.055}px rgba(0,0,0,0.35)`,
                }}
                draggable={false}
            />

            {/* Caption */}
            <div style={{ marginBottom: cH * 0.06, textAlign: 'center' }}>
                <div
                    style={{
                        fontSize: cW * 0.028,
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        color: isDark ? theme.accent : 'rgba(255,255,255,0.65)',
                        textTransform: 'uppercase',
                        marginBottom: cW * 0.02,
                    }}
                >
                    {copy.label}
                </div>
                <div
                    style={{
                        fontSize: cW * 0.095,
                        fontWeight: 700,
                        lineHeight: 1.0,
                        color: '#ffffff',
                    }}
                >
                    {copy.headline}
                </div>
            </div>

            {/* Feature pills */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap' as const,
                    gap: cW * 0.025,
                    justifyContent: 'center',
                    width: '100%',
                    marginBottom: cH * 0.05,
                }}
            >
                {FEATURE_PILLS.map((pill) => (
                    <div
                        key={pill}
                        style={{
                            background: isDark ? 'rgba(91,130,212,0.18)' : 'rgba(255,255,255,0.15)',
                            border: `1px solid ${isDark ? 'rgba(91,130,212,0.35)' : 'rgba(255,255,255,0.3)'}`,
                            borderRadius: cW * 0.04,
                            padding: `${cW * 0.018}px ${cW * 0.04}px`,
                            fontSize: cW * 0.032,
                            fontWeight: 500,
                            color: '#ffffff',
                        }}
                    >
                        {pill}
                    </div>
                ))}
            </div>

            {/* ICSSC attribution */}
            <div
                style={{
                    marginTop: cH * 0.04,
                    display: 'flex',
                    alignItems: 'center',
                    gap: cW * 0.022,
                }}
            >
                <svg
                    viewBox="0 0 446 359"
                    style={{
                        width: cW * 0.065,
                        height: cW * 0.065,
                        flexShrink: 0,
                        fill: isDark ? theme.muted : 'rgba(255,255,255,0.45)',
                    }}
                >
                    <path d="M205.278 7.60434C201.902 11.8259 199.37 18.299 199.37 22.2391C199.37 26.4606 191.211 42.2211 181.364 58.263C160.825 90.6282 131.566 147.478 124.813 168.023C122.563 175.622 118.061 193.071 115.248 206.862L110.184 231.909L106.807 213.897C104.838 204.047 100.337 189.412 96.679 181.532C86.2693 158.173 70.2327 145.508 74.1715 163.52C75.2969 168.586 74.7342 171.963 73.3275 171.963C67.982 171.963 63.4805 151.137 63.1991 127.778C62.9178 115.113 62.0737 103.856 60.667 102.73C57.2909 99.0713 33.9394 124.119 22.1229 143.82C-2.354 184.628 -7.13684 245.418 10.8692 287.915C20.9975 312.682 40.1289 337.167 57.8536 348.987C76.1409 361.089 95.2723 361.089 111.59 349.269C118.061 344.766 124.532 338.293 126.22 335.197C130.159 327.879 135.223 328.161 141.975 335.478C144.789 338.855 153.792 344.766 161.388 348.706C173.205 354.616 178.831 355.742 196.556 355.46C208.091 355.179 229.192 355.179 242.978 355.46C312.751 356.867 335.821 355.742 351.014 350.394C372.677 342.796 378.023 334.634 378.023 308.742C378.023 279.472 377.179 278.909 338.072 278.909C317.253 278.909 306.562 277.784 307.687 276.095C308.812 274.406 323.724 273.281 343.136 273.281C374.647 273.281 377.46 272.718 382.524 267.089C387.589 261.179 440.763 165.209 444.983 153.951C446.389 150.293 444.701 149.448 436.261 149.448H425.851L396.592 203.203L367.332 256.957L351.577 255.269C307.687 250.484 309.094 250.766 307.687 242.885C302.904 219.526 295.589 201.796 282.366 181.814C267.736 159.862 260.984 143.257 263.235 135.94C264.079 134.251 268.58 132.562 273.363 132.562C283.21 132.562 315.565 146.634 324.568 155.077C333.571 163.239 342.292 164.646 350.451 159.299C356.922 155.077 357.485 153.107 356.359 139.598C354.39 116.239 338.353 86.1252 314.72 61.3588C298.121 43.6283 290.244 37.9995 270.268 28.4307C256.764 21.9576 242.415 12.9517 238.195 8.44867C228.067 -2.52737 213.437 -2.80881 205.278 7.60434Z" />
                </svg>
                <div
                    style={{
                        fontSize: cW * 0.028,
                        color: isDark ? theme.muted : 'rgba(255,255,255,0.45)',
                    }}
                >
                    Built by ICSSC Projects
                </div>
            </div>
        </div>
    );
}

// ─── Slide registry ────────────────────────────────────────────────────────────
const SLIDE_COMPONENTS = [Slide1, Slide2, Slide3, Slide4, Slide5];

// ─── Preview wrapper ───────────────────────────────────────────────────────────
function ScreenshotPreview({
    slideIndex,
    themeId,
    exportRef: _exportRef,
    onExport,
    exporting,
}: {
    slideIndex: number;
    themeId: ThemeId;
    exportRef: React.RefObject<HTMLDivElement | null>;
    onExport: () => void;
    exporting: boolean;
}) {
    const previewRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const el = previewRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            // Use min of both axes so no axis is clipped by rounding
            setScale(Math.min(el.clientWidth / W, el.clientHeight / H));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const theme = THEMES[themeId];
    const SlideComp = SLIDE_COMPONENTS[slideIndex];

    return (
        <div
            ref={previewRef}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: '100%',
                aspectRatio: `${W}/${H}`,
                position: 'relative',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: hovered ? '0 6px 28px rgba(0,0,0,0.22)' : '0 4px 20px rgba(0,0,0,0.15)',
                cursor: 'default',
                transition: 'box-shadow 0.15s ease',
                // Contain the scaled slide precisely — no subpixel bleed
                contain: 'strict',
            }}
        >
            {/* Scaled preview */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: W,
                    height: H,
                    transformOrigin: 'center center',
                    transform: `translate(-50%, -50%) scale(${scale})`,
                }}
            >
                <SlideComp cW={W} cH={H} theme={theme} />
            </div>

            {/* Slide number badge */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    background: 'rgba(0,0,0,0.55)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 6,
                    backdropFilter: 'blur(4px)',
                    zIndex: 30,
                }}
            >
                {slideIndex + 1} / {SLIDE_COMPONENTS.length} · {SLIDES_COPY[slideIndex].id}
            </div>

            {/* Hover download button */}
            <button
                onClick={onExport}
                disabled={exporting}
                style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    zIndex: 30,
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                    background: exporting ? 'rgba(0,0,0,0.45)' : 'rgba(37,99,235,0.92)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: exporting ? 'default' : 'pointer',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    whiteSpace: 'nowrap',
                }}
            >
                {exporting ? '↓ …' : '↓ Save'}
            </button>
        </div>
    );
}

// ─── Export logic ──────────────────────────────────────────────────────────────
async function captureSlide(el: HTMLElement, w: number, h: number): Promise<string> {
    el.style.left = '0px';
    el.style.opacity = '1';
    el.style.zIndex = '-1';

    const opts = { width: w, height: h, pixelRatio: 1, cacheBust: true };

    // Double-call: first warms up fonts/images, second produces clean output
    await toPng(el, opts);
    const dataUrl = await toPng(el, opts);

    el.style.left = '-9999px';
    el.style.opacity = '';
    el.style.zIndex = '';
    return dataUrl;
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function ScreenshotsPage() {
    const [ready, setReady] = useState(false);
    const [themeId, setThemeId] = useState<ThemeId>('blue-light');
    const [sizeIdx, setSizeIdx] = useState(0);
    const [exporting, setExporting] = useState<string | null>(null);
    const [exportingIdx, setExportingIdx] = useState<number | null>(null);

    const exportRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        preloadAllImages().then(() => setReady(true));
    }, []);

    const theme = THEMES[themeId];
    const size = IPHONE_SIZES[sizeIdx];

    async function exportAll() {
        setExporting('0/' + SLIDE_COMPONENTS.length);
        for (let i = 0; i < SLIDE_COMPONENTS.length; i++) {
            setExporting(`${i + 1}/${SLIDE_COMPONENTS.length}`);
            const el = exportRefs.current[i];
            if (!el) continue;
            const dataUrl = await captureSlide(el, size.w, size.h);
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${String(i + 1).padStart(2, '0')}-${SLIDES_COPY[i].id}-${themeId}-${size.w}x${size.h}.png`;
            a.click();
            await new Promise((r) => setTimeout(r, 300));
        }
        setExporting(null);
    }

    async function exportOne(i: number) {
        if (exportingIdx !== null || exporting) return;
        setExportingIdx(i);
        const el = exportRefs.current[i];
        if (el) {
            const dataUrl = await captureSlide(el, size.w, size.h);
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${String(i + 1).padStart(2, '0')}-${SLIDES_COPY[i].id}-${themeId}-${size.w}x${size.h}.png`;
            a.click();
        }
        setExportingIdx(null);
    }

    if (!ready) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f3f4f6',
                    fontFamily: 'sans-serif',
                    color: '#6b7280',
                    fontSize: 16,
                }}
            >
                Loading images…
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f3f4f6',
                position: 'relative',
                overflowX: 'hidden',
            }}
        >
            {/* ── Offscreen export canvases ── */}
            {SLIDE_COMPONENTS.map((SlideComp, i) => (
                <div
                    key={i}
                    ref={(el) => {
                        exportRefs.current[i] = el;
                    }}
                    style={{
                        position: 'absolute',
                        left: '-9999px',
                        top: 0,
                        width: W,
                        height: H,
                        pointerEvents: 'none',
                    }}
                >
                    <SlideComp cW={W} cH={H} theme={theme} />
                </div>
            ))}

            {/* ── Toolbar ── */}
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    background: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                {/* Scrollable controls */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 16px',
                        overflowX: 'auto',
                        minWidth: 0,
                    }}
                >
                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: 14,
                            whiteSpace: 'nowrap',
                            color: '#111827',
                        }}
                    >
                        AntAlmanac · App Store Screenshots
                    </span>

                    {/* Theme switcher */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 4,
                            background: '#f3f4f6',
                            borderRadius: 8,
                            padding: 4,
                            flexShrink: 0,
                        }}
                    >
                        {(Object.keys(THEMES) as ThemeId[]).map((id) => (
                            <button
                                key={id}
                                onClick={() => setThemeId(id)}
                                style={{
                                    padding: '4px 14px',
                                    borderRadius: 6,
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    background: themeId === id ? 'white' : 'transparent',
                                    color: themeId === id ? '#305db7' : '#6b7280',
                                    boxShadow: themeId === id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                }}
                            >
                                {THEMES[id].label}
                            </button>
                        ))}
                    </div>

                    {/* Export size */}
                    <select
                        value={sizeIdx}
                        onChange={(e) => setSizeIdx(Number(e.target.value))}
                        style={{
                            fontSize: 12,
                            border: '1px solid #e5e7eb',
                            borderRadius: 6,
                            padding: '4px 10px',
                            background: 'white',
                        }}
                    >
                        {IPHONE_SIZES.map((s, i) => (
                            <option key={i} value={i}>
                                {s.label} — {s.w}×{s.h}
                            </option>
                        ))}
                    </select>

                    <span
                        style={{
                            fontSize: 11,
                            color: '#9ca3af',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Note: source screenshots are RGBA — flatten to RGB before submitting to App Store
                    </span>
                </div>

                {/* Fixed export button */}
                <div
                    style={{
                        flexShrink: 0,
                        padding: '10px 16px',
                        borderLeft: '1px solid #e5e7eb',
                    }}
                >
                    <button
                        onClick={exportAll}
                        disabled={!!exporting}
                        style={{
                            padding: '7px 20px',
                            background: exporting ? '#93c5fd' : '#305db7',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: exporting ? 'default' : 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {exporting ? `Exporting… ${exporting}` : 'Export All'}
                    </button>
                </div>
            </div>

            {/* ── Slide grid ── */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 20,
                    padding: 24,
                    maxWidth: 1600,
                    margin: '0 auto',
                }}
            >
                {SLIDE_COMPONENTS.map((_, i) => (
                    <ScreenshotPreview
                        key={`${i}-${themeId}`}
                        slideIndex={i}
                        themeId={themeId}
                        exportRef={{ current: exportRefs.current[i] }}
                        onExport={() => exportOne(i)}
                        exporting={exportingIdx === i}
                    />
                ))}
            </div>
        </div>
    );
}
