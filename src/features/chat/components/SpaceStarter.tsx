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
    const ratio = Math.min(1, window.innerHeight / 826);
    return Math.min(1, 0.85 + 0.15 * ratio);
  };
  const [scale, setScale] = useState(computeScale);

  useEffect(() => {
    const handleResize = () => {
      setScale((prev) => {
        const next = computeScale();
        return Math.abs(next - prev) > 0.01 ? next : prev;
      });
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
    if (scale >= 1) return undefined;
    const style: React.CSSProperties & { zoom?: number } = {
      transform: `scale(${scale})`,
      transformOrigin: "top center",
    };
    style.zoom = scale;
    return style;
  }, [scale]);

  return (
    <div
      className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-visible dark:bg-card/70 scrollbar-none"
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
      <div className="relative p-2 sm:p-4 md:p-3">
        {/* <div className="flex items-center justify-between mb-1.5 sm:mb-2">
          <h2 className="text-sm sm:text-base font-semibold text-foreground">
            Start with a Space
          </h2>
          <button className="text-xs sm:text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
            Explore hundreds more →
          </button>
        </div> */}

        {/* Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-3.5 w-full">
          {spaces.map((space, idx) => (
            <button
              key={idx}
              className="group rounded-xl border border-border/60 bg-card/70 dark:bg-card/50 hover:bg-card/90 dark:hover:bg-card/65 transition-all p-4 sm:p-3.5 md:p-4 flex gap-3 sm:gap-2.5 shadow-sm dark:shadow-md hover:border-border/80 dark:hover:border-border/60 text-left min-h-[96px] focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-[0.99]"
              onClick={() => {
                const detail = space.content || space.title;
                window.dispatchEvent(
                  new CustomEvent("suggestion-click", { detail })
                );
              }}
              type="button"
            >
              <div className="text-2xl sm:text-[26px] md:text-3xl shrink-0 leading-none self-start mt-0.5">
                {space.icon}
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <div className="text-sm sm:text-[15px] md:text-base font-semibold text-foreground mb-1 sm:mb-0.5 md:mb-1 leading-tight">
                  {space.title}
                </div>
                <div className="text-xs sm:text-[13px] md:text-sm text-foreground/70 dark:text-foreground/60 leading-relaxed">
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
