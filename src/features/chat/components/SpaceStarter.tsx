import React, { useMemo } from "react";

type SpaceItem = {
  title: string;
  description: string;
  icon: string;
  content?: string;
};

const DEFAULT_SPACES: SpaceItem[] = [
  {
    title: "Lesson Plan Generator",
    description: "Generate and modify comprehensive lesson plans on any topic",
    icon: "📘",
    content:
      "Create a standards-aligned lesson plan for Grade 5 Science on photosynthesis. Include objectives, materials, step-by-step activities, and an exit ticket.",
  },
  {
    title: "Multiple Choice Quiz Builder",
    description: "Generate a quiz and export to popular formats",
    icon: "📝",
    content:
      "Generate a 10-question multiple-choice quiz about the water cycle with answer key and explanations.",
  },
  {
    title: "Text Translator",
    description: "Convert text between 100+ languages",
    icon: "🌐",
    content:
      "Translate the following text to Vietnamese and simplify for Grade 7 reading level:",
  },
  {
    title: "Worksheet Generator",
    description: "Create a worksheet for any subject",
    icon: "📄",
    content:
      "Create a printable worksheet with 8 short-answer questions about fractions for Grade 4.",
  },
  {
    title: "Rubric Generator",
    description: "Generate a rubric for an assignment",
    icon: "📊",
    content:
      "Create a 4-level rubric to assess a persuasive writing assignment for Grade 8.",
  },
  {
    title: "Text Leveler",
    description: "Adjust reading level for any grade",
    icon: "🔧",
    content:
      "Rewrite the following passage to a Grade 3 reading level while preserving meaning:",
  },
];

import { useEffect, useState } from "react";
import { chatService } from "../services/chatService";

const SpaceStarter: React.FC = () => {
  const [spaces, setSpaces] = useState<SpaceItem[]>(DEFAULT_SPACES);
  const computeScale = () => {
    if (typeof window === "undefined") return 1;
    const { innerWidth, innerHeight } = window;

    if (innerWidth <= 768) {
      return 1;
    }

    if (innerWidth >= 1200) {
      const widthAdjusted = innerWidth / 1480;
      const heightAdjusted = innerHeight / 940;
      const ratio = Math.min(widthAdjusted, heightAdjusted);
      return Math.min(0.9, Math.max(0.84, ratio));
    }

    if (innerWidth >= 992) {
      const widthAdjusted = innerWidth / 1180;
      const heightAdjusted = innerHeight / 840;
      return Math.min(1, Math.max(0.88, Math.min(widthAdjusted, heightAdjusted)));
    }

    const heightRatio = innerHeight / 900;
    const widthRatio = innerWidth / 1100;
    return Math.min(1, Math.max(0.82, Math.min(heightRatio, widthRatio)));
  };
  const [scale, setScale] = useState(computeScale);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 640 : false
  );
  const [isCompactDesktop, setIsCompactDesktop] = useState(
    typeof window !== "undefined"
      ? window.innerWidth > 640 && window.innerWidth <= 1280
      : false
  );

  useEffect(() => {
    const handleResize = () => {
      setScale((prev) => {
        const next = computeScale();
        return Math.abs(next - prev) > 0.01 ? next : prev;
      });
      const width = window.innerWidth;
      setIsMobile(width <= 640);
      setIsCompactDesktop(width > 640 && width <= 1280);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await chatService.getPublicSettings();
        const raw = res?.settings?.spaces_config;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSpaces(parsed);
          }
        }
      } catch {
        // fallback to defaults
      }
    })();
  }, []);
  const containerStyle = useMemo(() => {
    if (scale >= 0.98) return undefined;
    const style: React.CSSProperties & { zoom?: number } = {
      transform: `scale(${scale})`,
      transformOrigin: "top center",
    };
    style.zoom = scale;
    return style;
  }, [scale]);

  const displayedSpaces = useMemo(
    () => (isMobile ? spaces.slice(0, 4) : spaces),
    [isMobile, spaces]
  );

  const containerWidthClass = isMobile
    ? "max-w-full"
    : isCompactDesktop
    ? "max-w-[900px]"
    : "max-w-[1080px]";

  const gridLayoutClass = isMobile
    ? "grid-cols-2 gap-2"
    : isCompactDesktop
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-3.5"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 lg:gap-4";

  const cardPaddingClass = isMobile
    ? "p-3 min-h-[88px]"
    : isCompactDesktop
    ? "p-4 sm:p-4.5 md:p-5 min-h-[96px]"
    : "p-5 sm:p-5.5 md:p-6 min-h-[118px]";

  const cardGapClass = isMobile
    ? "gap-3"
    : isCompactDesktop
    ? "gap-3 sm:gap-3.5"
    : "gap-3 sm:gap-3.5";

  const iconSizeClass = isMobile
    ? "text-[1.75rem] sm:text-[1.9rem]"
    : isCompactDesktop
    ? "text-[1.9rem] sm:text-[2.15rem] md:text-[2.35rem]"
    : "text-[2.1rem] sm:text-[2.35rem] md:text-[2.6rem]";

  const titleSizeClass = isMobile
    ? "text-[0.95rem] sm:text-[1rem] md:text-[1.05rem]"
    : isCompactDesktop
    ? "text-[1rem] sm:text-[1.1rem] md:text-[1.2rem]"
    : "text-[1.05rem] sm:text-[1.15rem] md:text-[1.25rem]";

  const descriptionSizeClass = isMobile
    ? "text-xs sm:text-[0.85rem] md:text-[0.92rem]"
    : isCompactDesktop
    ? "text-sm sm:text-[0.95rem] md:text-[1.02rem]"
    : "text-sm sm:text-[1rem] md:text-[1.05rem]";

  return (
    <div
      className={`relative w-full mx-auto rounded-3xl dark:bg-card/70 scrollbar-none ${containerWidthClass}`}
      style={containerStyle}
    >
      {/* Pastel radial mist overlays */}
      <div className="pointer-events-none absolute inset-0">
        {/* Blue left (extend toward center to blend) */}
        <div className="absolute bottom-6 -left-12 sm:-left-24 w-[320px] h-[180px] sm:w-[480px] sm:h-[270px] md:w-[640px] md:h-[360px] rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.28),transparent_70%)] dark:bg-[radial-gradient(closest-side,rgba(59,130,246,0.24),transparent_70%)] blur-3xl"></div>
        {/* Purple center (largest, sits behind as bridge) */}
        <div className="absolute -top-14 sm:-top-20 md:-top-28 left-1/2 -translate-x-1/2 w-[380px] h-[210px] sm:w-[570px] sm:h-[315px] md:w-[760px] md:h-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.28),transparent_70%)] dark:bg-[radial-gradient(closest-side,rgba(139,92,246,0.24),transparent_70%)] blur-3xl"></div>
        {/* Lavender bridge to smooth overlaps */}
        <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[410px] h-[230px] sm:w-[615px] sm:h-[345px] md:w-[820px] md:h-[460px] rounded-full blur-3xl">
          <div className="w-full h-full rounded-full bg-[radial-gradient(closest-side,rgba(196,181,253,0.20),transparent_70%)] dark:bg-[radial-gradient(closest-side,rgba(196,181,253,0.18),transparent_70%)]"></div>
        </div>
        {/* Pink right (pull inward for blend) */}
        <div className="absolute bottom-8 -right-6 sm:-right-12 w-[320px] h-[180px] sm:w-[480px] sm:h-[270px] md:w-[640px] md:h-[360px] rounded-full bg-[radial-gradient(closest-side,rgba(244,114,182,0.28),transparent_70%)] dark:bg-[radial-gradient(closest-side,rgba(244,114,182,0.24),transparent_70%)] blur-3xl"></div>
      </div>
      <div className="relative p-3 sm:p-5 md:p-6">
        {/* <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <h2 className="text-sm sm:text-base font-semibold text-foreground">
            Start with a Space
          </h2>
          <button className="text-xs sm:text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
            Explore hundreds more →
          </button>
        </div> */}

        {/* Responsive grid */}
        <div className={`grid ${gridLayoutClass} w-full`}>
          {displayedSpaces.map((space, idx) => (
            <button
              key={idx}
              className={`group rounded-[18px] bg-card/70 dark:bg-card/50 hover:bg-card/90 dark:hover:bg-card/65 transition-all flex ${cardGapClass} shadow-sm dark:shadow-md text-left focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-[0.99] ${cardPaddingClass}`}
              onClick={() => {
                const detail = space.content || space.title;
                window.dispatchEvent(
                  new CustomEvent("suggestion-click", { detail })
                );
              }}
              type="button"
            >
              <div
                className={`${iconSizeClass} shrink-0 leading-none self-start mt-0.5`}
              >
                {space.icon}
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <div
                  className={`${titleSizeClass} font-semibold text-foreground mb-1.5 sm:mb-1.5 md:mb-2 leading-tight`}
                >
                  {space.title}
                </div>
                <div
                  className={`${descriptionSizeClass} text-foreground/70 dark:text-foreground/60 leading-relaxed`}
                >
                  {space.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpaceStarter;
