"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ChangeEvent,
} from "react";
import styles from "./page.module.css";
import {
  FaCalendarAlt,
  FaChartLine,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaCompass,
  FaFilter,
  FaPenNib,
  FaPlayCircle,
  FaRobot,
  FaVideo,
} from "react-icons/fa";
import {
  MdOutlineLibraryAdd,
  MdOutlineSubtitles,
  MdOutlineTipsAndUpdates,
} from "react-icons/md";
import type { IconType } from "react-icons";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism.css";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import {
  addDays,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

type Region = "US" | "EU" | "Global";
type Source = "Google Trends" | "TikTok" | "YouTube";

type Trend = {
  id: number;
  title: string;
  source: Source;
  region: Region;
  searchVolume: number;
  growth: number;
};

type ClipSource = {
  id: string;
  title: string;
  creator: string;
  duration: number;
  url: string;
  category: string;
  complianceNotes: string;
};

type ScheduleItem = {
  id: string;
  platform: "TikTok" | "YouTube Shorts";
  scheduledAt: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail: string;
  status: "Scheduled" | "Ready" | "Draft";
};

type Recommendation = {
  id: string;
  category: "Keywords" | "Hashtags" | "Creative" | "Call to Action";
  title: string;
  description: string;
  action: string;
  metricLift: number;
  ready: boolean;
};

type ABTest = {
  variant: string;
  ctr: number;
  views: number;
  watchTime: number;
  winner?: boolean;
};

type OptimizationMetric = {
  strategy: string;
  views: number;
  likes: number;
  shares: number;
};

type VelocityPoint = {
  name: string;
  views: number;
  likes: number;
  shares: number;
};

type HashtagMetric = {
  hashtag: string;
  lift: number;
  avgViews: number;
};

const sections: Array<{ id: string; label: string; Icon: IconType }> = [
  { id: "trend-identification", label: "Trend Identification", Icon: FaCompass },
  { id: "content-creation", label: "Content Creation", Icon: FaPenNib },
  { id: "video-clipping", label: "Video Clipping", Icon: FaVideo },
  { id: "scheduling-uploading", label: "Scheduling & Uploading", Icon: FaCalendarAlt },
  { id: "viral-optimization", label: "Viral Optimization", Icon: FaChartLine },
];

const trendCatalog: Trend[] = [
  {
    id: 1,
    title: "AI Side Hustles That Print Cash in 2024",
    source: "YouTube",
    region: "Global",
    searchVolume: 148_000,
    growth: 42,
  },
  {
    id: 2,
    title: "Autonomous Content Agents",
    source: "Google Trends",
    region: "US",
    searchVolume: 96_500,
    growth: 58,
  },
  {
    id: 3,
    title: "90 Day Glow-Up Challenges",
    source: "TikTok",
    region: "EU",
    searchVolume: 82_300,
    growth: 34,
  },
  {
    id: 4,
    title: "MrBeast Philanthropy Moments",
    source: "YouTube",
    region: "Global",
    searchVolume: 132_450,
    growth: 29,
  },
  {
    id: 5,
    title: "Podcast Clips: Success vs. Significance",
    source: "YouTube",
    region: "US",
    searchVolume: 73_200,
    growth: 31,
  },
  {
    id: 6,
    title: "TikTok Shop Playbooks",
    source: "TikTok",
    region: "Global",
    searchVolume: 109_400,
    growth: 64,
  },
  {
    id: 7,
    title: "Creator Economy Reinvestment",
    source: "Google Trends",
    region: "EU",
    searchVolume: 68_950,
    growth: 21,
  },
  {
    id: 8,
    title: "AI Thumbnail Experiments",
    source: "YouTube",
    region: "US",
    searchVolume: 57_680,
    growth: 44,
  },
  {
    id: 9,
    title: "Day-in-the-life Micro Vlogs",
    source: "TikTok",
    region: "Global",
    searchVolume: 118_900,
    growth: 39,
  },
];

const clipSources: ClipSource[] = [
  {
    id: "beast-redemption",
    title: "MrBeast | $1 vs. $100,000,000 House",
    creator: "MrBeast",
    duration: 19 * 60 + 12,
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    category: "Spectacle Hooks",
    complianceNotes: "Original creator attribution required in description & on-screen.",
  },
  {
    id: "mfm-focus",
    title: "My First Million Podcast | Trim the Distractions",
    creator: "My First Million",
    duration: 6 * 60 + 44,
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    category: "Podcast Wisdom",
    complianceNotes: "Allowed for transformative commentary with citation.",
  },
  {
    id: "lex-ai-revolution",
    title: "Lex Fridman on AI Agents",
    creator: "Lex Fridman Podcast",
    duration: 4 * 60 + 7,
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    category: "AI & Future",
    complianceNotes: "Fair-use allowed for education; must include guest + show names.",
  },
];

const waveformTemplate: number[] = [
  0.18, 0.52, 0.86, 0.43, 0.68, 0.9, 0.55, 0.22, 0.31, 0.77, 0.64, 0.52, 0.19,
  0.4, 0.73, 0.87, 0.61, 0.33, 0.26, 0.58, 0.95, 0.82, 0.48, 0.37, 0.29, 0.62,
  0.79, 0.51, 0.16, 0.42, 0.68, 0.83, 0.72, 0.38, 0.2, 0.46, 0.7, 0.92, 0.59,
  0.44, 0.24, 0.53, 0.81, 0.97, 0.69, 0.35, 0.17, 0.49, 0.76, 0.89, 0.57, 0.28,
  0.22, 0.6, 0.84, 0.91, 0.63, 0.32,
];

const performanceMetrics: OptimizationMetric[] = [
  { strategy: "Hook Remix", views: 128_000, likes: 9_320, shares: 2_460 },
  { strategy: "Creator Collab", views: 164_500, likes: 12_040, shares: 3_890 },
  { strategy: "Interactive Polls", views: 119_300, likes: 7_940, shares: 1_980 },
  { strategy: "Fast Cut Visuals", views: 178_900, likes: 14_210, shares: 4_140 },
];

const velocitySeries: VelocityPoint[] = [
  { name: "Hour 1", views: 22_000, likes: 1_480, shares: 420 },
  { name: "Hour 6", views: 58_500, likes: 4_860, shares: 1_260 },
  { name: "Hour 12", views: 92_300, likes: 7_640, shares: 2_180 },
  { name: "Hour 24", views: 138_900, likes: 11_240, shares: 3_540 },
  { name: "Hour 48", views: 183_400, likes: 15_360, shares: 4_760 },
];

const hashtagMetrics: HashtagMetric[] = [
  { hashtag: "#CreatorAutomation", lift: 86, avgViews: 126_000 },
  { hashtag: "#AIAgents", lift: 93, avgViews: 164_500 },
  { hashtag: "#ViralBlueprint", lift: 71, avgViews: 99_800 },
  { hashtag: "#ShortFormMastery", lift: 78, avgViews: 112_400 },
];

const abTitleTests: ABTest[] = [
  { variant: "Variant A: 'AI Agents Built My Channel in 30 Days'", ctr: 6.8, views: 148_900, watchTime: 78, winner: true },
  { variant: "Variant B: 'How I Automated 60 Viral Shorts'", ctr: 5.4, views: 121_500, watchTime: 64 },
];

const abThumbnailTests: ABTest[] = [
  { variant: "Thumbnail A: Blueprint Grid", ctr: 5.9, views: 134_200, watchTime: 72 },
  { variant: "Thumbnail B: Split Screen Automation", ctr: 7.1, views: 168_400, watchTime: 81, winner: true },
];

const recommendations: Recommendation[] = [
  {
    id: "reco-keywords",
    category: "Keywords",
    title: "Lean into 'Autonomous Creator' keyword cluster",
    description:
      "Search velocity is up 58% week-over-week. Align hooks and metadata with 'autonomous creator' language to ride the breakout curve.",
    action: "Update TikTok + Shorts metadata in queued uploads.",
    metricLift: 23,
    ready: true,
  },
  {
    id: "reco-hashtags",
    category: "Hashtags",
    title: "Pair trend hashtags with evergreen anchors",
    description:
      "#AIAgents is overperforming when bundled with #CreatorAutomation + #BuildInPublic. Maintain a 2:1 new-to-evergreen ratio.",
    action: "Push hashtag template to Google Sheets content plan.",
    metricLift: 17,
    ready: true,
  },
  {
    id: "reco-creative",
    category: "Creative",
    title: "Test punch-in camera transitions",
    description:
      "Retention plummets at second 17 on long-form repurposed clips. Add kinetic punch-ins synced to waveform peaks.",
    action: "Toggle advanced motion pack in LovoArt scene builder.",
    metricLift: 12,
    ready: false,
  },
  {
    id: "reco-cta",
    category: "Call to Action",
    title: "Swap generic CTA for outcome promise",
    description:
      "Use audience-specific promises (“Launch 2 viral shorts/day without burnout”) to lift conversion.",
    action: "Update script CTA macros and push to Sheets.",
    metricLift: 9,
    ready: true,
  },
];

const baseScriptTemplate = (trend: Trend, tone: string, scriptLength: number, audience: string, hookStyle: string, callToAction: string) => {
  const pacing = scriptLength <= 45 ? "rapid-fire pacing" : scriptLength <= 75 ? "dynamic pacing" : "story-driven pacing";
  return [
    `HOOK – ${hookStyle.toUpperCase()} (${tone}, ${scriptLength}s)`,
    `Narrator: Imagine ${audience.toLowerCase()} deploying automated workflows that publish twice a day—without burning out.`,
    `Scene Direction: Start with an over-the-shoulder shot of dashboards flashing green while a timeline animates to ${scriptLength} seconds.`,
    `INSIGHT – WHY THIS TREND MATTERS`,
    `Narrator: ${trend.title} is surging ${trend.growth}% this week. Creators riding it are stacking compounding watch time.`,
    `Overlay: Pull in live pulses from Google Trends, TikTok Creative Center, and YouTube Analytics showing synchronized spikes.`,
    `TACTIC STACK (${pacing})`,
    `• Auto-generate scripts with persona-aware GPT prompts tailored to ${audience}.`,
    `• Queue LovoArt scene templates with adaptive B-roll tied to hook moments.`,
    `• Layer waveform-synced captions using #3498db color pops at key verbs.`,
    `CLOSE – CALL TO ACTION`,
    `Narrator: ${callToAction}`,
    `End Card: Flash next steps with a subtle green ${"#2ecc71"} progress ring filling to 100%.`,
  ].join("\n\n");
};

const highlightScript = (code: string) => {
  const language =
    Prism.languages.markdown ??
    Prism.languages.jsx ??
    Prism.languages.typescript ??
    Prism.languages.javascript;

  return Prism.highlight(code, language, "markdown");
};

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 10)}`;

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ?? "");
  const [regionFilter, setRegionFilter] = useState<Region | "All">("All");
  const [sourceFilters, setSourceFilters] = useState<Source[]>([
    "Google Trends",
    "TikTok",
    "YouTube",
  ]);
  const [sortKey, setSortKey] = useState<"title" | "searchVolume" | "growth">(
    "searchVolume",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selectedTrendId, setSelectedTrendId] = useState<number>(
    trendCatalog[0]?.id ?? 1,
  );
  const selectedTrend = useMemo(
    () => trendCatalog.find((trend) => trend.id === selectedTrendId) ?? trendCatalog[0],
    [selectedTrendId],
  );

  const [tone, setTone] = useState("Energetic Mentor");
  const [scriptLength, setScriptLength] = useState(60);
  const [audience, setAudience] = useState("Growth-focused creators");
  const [hookStyle, setHookStyle] = useState("Pattern Interrupt");
  const [callToAction, setCallToAction] = useState(
    "Tap follow to get the automation stack we use to ship 60 videos a month.",
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState(
    baseScriptTemplate(
      selectedTrend,
      tone,
      scriptLength,
      audience,
      hookStyle,
      callToAction,
    ),
  );

  const [voiceProfile, setVoiceProfile] = useState("LOVO Nova – Energetic Female");
  const [visualMood, setVisualMood] = useState("Dynamic studio with kinetic lighting");
  const [lovoCaptionStyle, setLovoCaptionStyle] = useState("Kinetic captions with #3498db emphasis");

  const [clipQuery, setClipQuery] = useState("");
  const [selectedClipId, setSelectedClipId] = useState<string>(clipSources[0]?.id ?? "");
  const selectedClip = useMemo(
    () => clipSources.find((clip) => clip.id === selectedClipId) ?? clipSources[0],
    [selectedClipId],
  );
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(selectedClip?.duration ?? 60);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [clipCaptionStyle, setClipCaptionStyle] = useState("Dynamic word highlights");
  const [visualEffectsEnabled, setVisualEffectsEnabled] = useState(true);
  const [attributionConfirmed, setAttributionConfirmed] = useState(true);

  const [sheetSyncing, setSheetSyncing] = useState(false);
  const [lastSheetSync, setLastSheetSync] = useState<Date>(new Date());
  const [sheetConnected] = useState(true);

  const initialScheduledPosts = useMemo<ScheduleItem[]>(
    () => [
      {
        id: createId(),
        platform: "TikTok",
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
        title: "AI Agents Built My Viral Engine",
        description: "How I automated 2 uploads daily using creator agents.",
        tags: ["#AIAgents", "#CreatorAutomation", "#ViralBlueprint"],
        thumbnail:
          "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=640&q=80",
        status: "Scheduled",
      },
      {
        id: createId(),
        platform: "YouTube Shorts",
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
        title: "3 Hooks That Keep Viewers for 60 Seconds",
        description: "Steal the hook stack I'm using on automation breakdowns.",
        tags: ["#ShortFormMastery", "#HookWriting"],
        thumbnail:
          "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=640&q=80",
        status: "Ready",
      },
      {
        id: createId(),
        platform: "TikTok",
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
        title: "Viral Blueprint: 20-Minute Automation Setup",
        description: "A behind-the-scenes look at our video automation dashboard.",
        tags: ["#ViralBlueprint", "#Automation"],
        thumbnail:
          "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=640&q=80",
        status: "Draft",
      },
    ],
    [],
  );

  const [scheduledPosts, setScheduledPosts] = useState<ScheduleItem[]>(initialScheduledPosts);

  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "10:00",
    platform: "TikTok" as ScheduleItem["platform"],
    title: "",
    description: "",
    tags: "",
    thumbnail: "",
  });

  const [selectedTitleVariant, setSelectedTitleVariant] = useState(abTitleTests[0]?.variant ?? "");
  const [selectedThumbnailVariant, setSelectedThumbnailVariant] = useState(
    abThumbnailTests[0]?.variant ?? "",
  );

  const maxVolume = useMemo(
    () => Math.max(...trendCatalog.map((trend) => trend.searchVolume)),
    [],
  );

  const filteredTrends = useMemo(() => {
    return trendCatalog.filter((trend) => {
      const regionMatch = regionFilter === "All" || trend.region === regionFilter;
      const sourceMatch = sourceFilters.includes(trend.source);
      return regionMatch && sourceMatch;
    });
  }, [regionFilter, sourceFilters]);

  const sortedTrends = useMemo(() => {
    const trends = [...filteredTrends];
    trends.sort((a, b) => {
      const direction = sortOrder === "asc" ? 1 : -1;
      if (sortKey === "title") {
        return a.title.localeCompare(b.title) * direction;
      }
      if (sortKey === "growth") {
        return (a.growth - b.growth) * direction;
      }
      return (a.searchVolume - b.searchVolume) * direction;
    });
    return trends;
  }, [filteredTrends, sortKey, sortOrder]);

  const clipResults = useMemo(() => {
    if (!clipQuery.trim()) return clipSources;
    return clipSources.filter((clip) =>
      clip.title.toLowerCase().includes(clipQuery.trim().toLowerCase()),
    );
  }, [clipQuery]);

  useEffect(() => {
    setTrimStart(0);
    setTrimEnd(selectedClip?.duration ?? 60);
  }, [selectedClip]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-40% 0px -45% 0px",
        threshold: [0.2, 0.45, 0.7],
      },
    );

    sections.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const handleGenerateScript = useCallback(() => {
    if (!selectedTrend) return;
    setIsGenerating(true);
    window.setTimeout(() => {
      setScript(
        baseScriptTemplate(
          selectedTrend,
          tone,
          scriptLength,
          audience,
          hookStyle,
          callToAction,
        ),
      );
      setIsGenerating(false);
    }, 650);
  }, [audience, callToAction, hookStyle, scriptLength, selectedTrend, tone]);

  useEffect(() => {
    handleGenerateScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scriptSegments = useMemo(
    () => script.split("\n\n").filter(Boolean),
    [script],
  );

  const lovoStages = useMemo(() => {
    return [
      {
        id: "voice",
        label: "Voice Synthesis",
        description: voiceProfile,
        status: "complete",
      },
      {
        id: "visual",
        label: "Visual Assembly",
        description: visualMood,
        status: isGenerating ? "in-progress" : "complete",
      },
      {
        id: "captions",
        label: "Caption Styling",
        description: lovoCaptionStyle,
        status: isGenerating ? "pending" : "in-progress",
      },
      {
        id: "export",
        label: "Render & Export",
        description: "Rendering to 9:16 & 1:1 canvases",
        status: "pending",
      },
    ] as const;
  }, [isGenerating, lovoCaptionStyle, visualMood, voiceProfile]);

  const calendarDays = useMemo(() => {
    const today = new Date();
    const startMonth = startOfMonth(today);
    const endMonth = endOfMonth(today);
    const startCalendar = startOfWeek(startMonth, { weekStartsOn: 0 });
    const endCalendar = startOfWeek(addDays(endMonth, 7), { weekStartsOn: 0 });
    const days: Date[] = [];
    for (
      let cursor = startCalendar;
      cursor.getTime() <= endCalendar.getTime();
      cursor = addDays(cursor, 1)
    ) {
      days.push(cursor);
    }
    return days;
  }, []);

  const postsByDate = useMemo(() => {
    return scheduledPosts.reduce<Record<string, ScheduleItem[]>>((accumulator, post) => {
      const key = format(new Date(post.scheduledAt), "yyyy-MM-dd");
      accumulator[key] = accumulator[key] ? [...accumulator[key], post] : [post];
      return accumulator;
    }, {});
  }, [scheduledPosts]);

  const handleSort = (key: typeof sortKey) => {
    setSortOrder((previous) =>
      sortKey === key ? (previous === "asc" ? "desc" : "asc") : "desc",
    );
    setSortKey(key);
  };

  const handleSourceToggle = (source: Source) => {
    setSourceFilters((previous) =>
      previous.includes(source)
        ? previous.filter((item) => item !== source)
        : [...previous, source],
    );
  };

  const handleScheduleFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setScheduleForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleScheduleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!scheduleForm.date || !scheduleForm.time || !scheduleForm.title.trim()) return;
    const isoTimestamp = new Date(`${scheduleForm.date}T${scheduleForm.time}:00`).toISOString();

    const newPost: ScheduleItem = {
      id: createId(),
      platform: scheduleForm.platform,
      scheduledAt: isoTimestamp,
      title: scheduleForm.title.trim(),
      description: scheduleForm.description.trim(),
      tags: scheduleForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      thumbnail:
        scheduleForm.thumbnail.trim() ||
        "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=640&q=80",
      status: "Scheduled",
    };

    setScheduledPosts((previous) =>
      [...previous, newPost].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      ),
    );

    setScheduleForm({
      date: "",
      time: "10:00",
      platform: "TikTok",
      title: "",
      description: "",
      tags: "",
      thumbnail: "",
    });
  };

  const handleSyncSheets = () => {
    setSheetSyncing(true);
    window.setTimeout(() => {
      setLastSheetSync(new Date());
      setSheetSyncing(false);
    }, 900);
  };

  const handleAnalyzeTrend = (trendId: number) => {
    setSelectedTrendId(trendId);
    const contentSection = document.getElementById("content-creation");
    if (contentSection) {
      contentSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <aside className={styles.sidebar} aria-label="Primary navigation">
        <div className={styles.brand}>
          <span className={styles.brandAccent} aria-hidden="true" />
          <div>
            <p className={styles.brandTitle}>Agentic Studio</p>
            <p className={styles.brandSubtitle}>Video Automation OS</p>
          </div>
        </div>
        <nav className={styles.nav}>
          <p className={styles.navLabel}>
            <FaFilter aria-hidden="true" /> Workflow
          </p>
          <ul className={styles.navList}>
            {sections.map(({ id, label, Icon }) => (
              <li key={id}>
                <a
                  className={`${styles.navLink} ${
                    activeSection === id ? styles.navLinkActive : ""
                  }`}
                  href={`#${id}`}
                  aria-current={activeSection === id ? "page" : undefined}
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <section className={styles.sidebarCard} aria-label="Upload cadence">
          <p className={styles.sidebarCardTitle}>Publishing cadence</p>
          <p className={styles.sidebarMetric}>
            <strong>2 uploads/day</strong>
            <span>Synced to TikTok & YouTube Shorts</span>
          </p>
          <button type="button" className={styles.secondaryButton}>
            View automation rules
          </button>
        </section>
      </aside>

      <main id="main-content" className={styles.main} tabIndex={-1}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.headline}>Automation Control Center</h1>
            <p className={styles.subheadline}>
              Discover breakout trends, auto-generate scripts, clip long-form gold, and publish
              viral-ready shorts without leaving this workspace.
            </p>
          </div>
          <div className={styles.headerBadges} role="group" aria-label="Status overview">
            <div className={styles.headerBadge}>
              <FaRobot aria-hidden="true" />
              <span>
                GPT pipeline <strong>online</strong>
              </span>
            </div>
            <div className={styles.headerBadgeSuccess}>
              <FaCheckCircle aria-hidden="true" />
              <span>
                LovoArt sync <strong>ready</strong>
              </span>
            </div>
          </div>
        </header>

        <section id="trend-identification" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Trend Identification</h2>
              <p className={styles.sectionSubtitle}>
                Monitor pulses across Google Trends, TikTok, and YouTube, then jump straight into
                analysis.
              </p>
            </div>
            <div className={styles.sectionHeaderActions}>
              <button type="button" className={styles.primaryButton}>
                Refresh data
              </button>
              <button type="button" className={styles.ghostButton}>
                Export snapshot
              </button>
            </div>
          </div>

          <div className={styles.trendFilters} role="group" aria-label="Trend filters">
            <div className={styles.filterGroup}>
              <label htmlFor="region-filter">Region</label>
              <select
                id="region-filter"
                value={regionFilter}
                onChange={(event) =>
                  setRegionFilter(event.target.value as typeof regionFilter)
                }
              >
                <option value="All">All Regions</option>
                <option value="US">United States</option>
                <option value="EU">Europe</option>
                <option value="Global">Global</option>
              </select>
            </div>
            <fieldset className={styles.filterGroup} aria-label="Source platforms">
              <legend>Sources</legend>
              <div className={styles.sourceChips}>
                {(["Google Trends", "TikTok", "YouTube"] as Source[]).map((source) => {
                  const active = sourceFilters.includes(source);
                  return (
                    <button
                      key={source}
                      type="button"
                      className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                      onClick={() => handleSourceToggle(source)}
                      aria-pressed={active}
                    >
                      {source}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div className={styles.filterGroup}>
              <label htmlFor="sort-trends">Sort by</label>
              <select
                id="sort-trends"
                value={sortKey}
                onChange={(event) => handleSort(event.target.value as typeof sortKey)}
              >
                <option value="searchVolume">Search Volume</option>
                <option value="growth">Growth velocity</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>

          <div className={styles.trendTableWrapper}>
            <table className={styles.trendTable}>
              <caption className="sr-only">Trending topics summary table</caption>
              <thead>
                <tr>
                  <th scope="col">Trend</th>
                  <th scope="col">Region</th>
                  <th scope="col">Volume</th>
                  <th scope="col">Growth</th>
                  <th scope="col">Source</th>
                  <th scope="col" className={styles.tableActionColumn}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTrends.map((trend) => {
                  const volumeWidth = Math.max(
                    18,
                    Math.min(100, Math.round((trend.searchVolume / maxVolume) * 100)),
                  );
                  return (
                    <tr key={trend.id}>
                      <th scope="row">
                        <div className={styles.trendTitleCell}>
                          <span className={styles.trendTitle}>{trend.title}</span>
                          {trend.id === selectedTrendId ? (
                            <span className={styles.badgeCurrent}>In pipeline</span>
                          ) : null}
                        </div>
                      </th>
                      <td>{trend.region}</td>
                      <td>
                        <div className={styles.volumeBar} aria-label={`${trend.searchVolume} searches`}>
                          <div
                            className={styles.volumeBarFill}
                            style={{ width: `${volumeWidth}%` }}
                            aria-hidden="true"
                          />
                          <span className={styles.volumeValue}>
                            {trend.searchVolume.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.growthBadge} ${
                            trend.growth >= 0 ? styles.growthPositive : styles.growthNegative
                          }`}
                        >
                          {trend.growth >= 0 ? "+" : ""}
                          {trend.growth}%
                        </span>
                      </td>
                      <td>
                        <span className={styles.platformTag}>{trend.source}</span>
                      </td>
                      <td className={styles.tableActionColumn}>
                        <button
                          type="button"
                          className={styles.tableActionButton}
                          onClick={() => handleAnalyzeTrend(trend.id)}
                        >
                          Analyze
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section id="content-creation" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Content Creation</h2>
              <p className={styles.sectionSubtitle}>
                Feed the selected trend into GPT-driven scripting, fine-tune tone and audience, then
                visualize LovoArt automation.
              </p>
            </div>
            <div className={styles.sectionHeaderActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleGenerateScript}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating…" : "Generate script"}
              </button>
              <button type="button" className={styles.ghostButton}>
                Launch GPT editor
              </button>
            </div>
          </div>

          <div className={styles.contentCreationLayout}>
            <aside className={styles.parametersPanel} aria-label="Script configuration">
              <div className={styles.fieldGroup}>
                <label htmlFor="trend-select">Trend</label>
                <select
                  id="trend-select"
                  value={selectedTrendId}
                  onChange={(event) => setSelectedTrendId(Number.parseInt(event.target.value, 10))}
                >
                  {trendCatalog.map((trend) => (
                    <option key={trend.id} value={trend.id}>
                      {trend.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.fieldColumns}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="tone-select">Tone</label>
                  <select
                    id="tone-select"
                    value={tone}
                    onChange={(event) => setTone(event.target.value)}
                  >
                    <option value="Energetic Mentor">Energetic Mentor</option>
                    <option value="Data-Driven Analyst">Data-Driven Analyst</option>
                    <option value="Storyteller Entrepreneur">Storyteller Entrepreneur</option>
                    <option value="High-Energy Creator">High-Energy Creator</option>
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label htmlFor="audience-select">Target audience</label>
                  <select
                    id="audience-select"
                    value={audience}
                    onChange={(event) => setAudience(event.target.value)}
                  >
                    <option value="Growth-focused creators">Growth-focused creators</option>
                    <option value="Bootstrapped founders">Bootstrapped founders</option>
                    <option value="Busy agency owners">Busy agency owners</option>
                    <option value="Creator educators">Creator educators</option>
                  </select>
                </div>
              </div>
              <div className={styles.fieldColumns}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="length-input">Length (seconds)</label>
                  <input
                    id="length-input"
                    type="range"
                    min={30}
                    max={120}
                    step={5}
                    value={scriptLength}
                    onChange={(event) => setScriptLength(Number.parseInt(event.target.value, 10))}
                  />
                  <div className={styles.rangeValue}>{scriptLength}s</div>
                </div>
                <div className={styles.fieldGroup}>
                  <label htmlFor="hook-style">Hook style</label>
                  <select
                    id="hook-style"
                    value={hookStyle}
                    onChange={(event) => setHookStyle(event.target.value)}
                  >
                    <option value="Pattern Interrupt">Pattern Interrupt</option>
                    <option value="Curiosity Gap">Curiosity Gap</option>
                    <option value="Authority Drop">Authority Drop</option>
                    <option value="Before vs After">Before vs After</option>
                  </select>
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="cta-input">Call to action</label>
                <input
                  id="cta-input"
                  type="text"
                  value={callToAction}
                  onChange={(event) => setCallToAction(event.target.value)}
                  placeholder="Add your CTA"
                />
              </div>
            </aside>

            <div className={styles.scriptPanel}>
              <div className={styles.panelHeader}>
                <div>
                  <h3>GPT Script Output</h3>
                  <p>
                    {isGenerating
                      ? "Generating advanced script tailored to your parameters…"
                      : "Editable script ready for voice and visual orchestration."}
                  </p>
                </div>
                <span className={styles.statusIndicator}>
                  <FaRobot aria-hidden="true" /> GPT-4 Turbo
                </span>
              </div>
              <div className={styles.editorWrapper}>
                <Editor
                  value={script}
                  onValueChange={setScript}
                  highlight={highlightScript}
                  padding={24}
                  textareaId="script-editor"
                  aria-label="Generated script editor"
                  className={styles.editor}
                />
              </div>
              <div className={styles.scriptInsights} aria-live="polite">
                <div>
                  <h4>Scene Breakdown</h4>
                  <ul>
                    {scriptSegments.slice(0, 5).map((segment, index) => (
                      <li key={`segment-${index}`}>
                        <span className={styles.sceneIndex}>{index + 1}</span>
                        <p>{segment}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.visualPreview}>
                  <h4>Video Preview</h4>
                  <div className={styles.previewGrid}>
                    <div>
                      <span className={styles.previewLabel}>Voice profile</span>
                      <p>{voiceProfile}</p>
                    </div>
                    <div>
                      <span className={styles.previewLabel}>Visual mood</span>
                      <p>{visualMood}</p>
                    </div>
                    <div>
                      <span className={styles.previewLabel}>Caption style</span>
                      <p>{lovoCaptionStyle}</p>
                    </div>
                  </div>
                  <div className={styles.previewControls}>
                    <label className={styles.previewControl}>
                      Voice
                      <select
                        value={voiceProfile}
                        onChange={(event) => setVoiceProfile(event.target.value)}
                      >
                        <option value="LOVO Nova – Energetic Female">
                          LOVO Nova – Energetic Female
                        </option>
                        <option value="LOVO Atlas – Confident Male">
                          LOVO Atlas – Confident Male
                        </option>
                        <option value="LOVO Ember – Conversational">
                          LOVO Ember – Conversational
                        </option>
                      </select>
                    </label>
                    <label className={styles.previewControl}>
                      Visual mood
                      <select
                        value={visualMood}
                        onChange={(event) => setVisualMood(event.target.value)}
                      >
                        <option value="Dynamic studio with kinetic lighting">
                          Dynamic studio with kinetic lighting
                        </option>
                        <option value="Neon productivity bunker">
                          Neon productivity bunker
                        </option>
                        <option value="Minimal creator loft with plants">
                          Minimal creator loft with plants
                        </option>
                      </select>
                    </label>
                    <label className={styles.previewControl}>
                      Captions
                      <select
                        value={lovoCaptionStyle}
                        onChange={(event) => setLovoCaptionStyle(event.target.value)}
                      >
                        <option value="Kinetic captions with #3498db emphasis">
                          Kinetic captions with #3498db emphasis
                        </option>
                        <option value="Pop-in keywords with glow">
                          Pop-in keywords with glow
                        </option>
                        <option value="Minimal uppercase overlays">
                          Minimal uppercase overlays
                        </option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.lovoPipeline}>
            <h3>LovoArt Automation</h3>
            <div className={styles.pipelineGrid}>
              {lovoStages.map((stage) => (
                <article key={stage.id} className={styles.pipelineStage}>
                  <header>
                    <span
                      className={`${styles.pipelineStatus} ${
                        stage.status === "complete"
                          ? styles.pipelineStatusComplete
                          : stage.status === "in-progress"
                          ? styles.pipelineStatusProgress
                          : styles.pipelineStatusPending
                      }`}
                    >
                      {stage.status === "complete" ? "Complete" : stage.status === "in-progress" ? "In progress" : "Queued"}
                    </span>
                    <h4>{stage.label}</h4>
                  </header>
                  <p>{stage.description}</p>
                  {stage.id === "visual" && (
                    <ul className={styles.pipelineChecklist}>
                      <li>
                        <FaCheckCircle aria-hidden="true" />
                        Motion templates synced to hook beats
                      </li>
                      <li>
                        <FaCheckCircle aria-hidden="true" />
                        Quick B-roll swap suggestions
                      </li>
                    </ul>
                  )}
                  {stage.id === "captions" && (
                    <p className={styles.captionHint}>
                      Auto emphasis uses <span>#3498db</span> for power phrases and{" "}
                      <span className={styles.successText}>#2ecc71</span> for CTA moments.
                    </p>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="video-clipping" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Video Clipping</h2>
              <p className={styles.sectionSubtitle}>
                Surface relevant clips, trim with waveform precision, add captions, and enforce
                attribution automatically.
              </p>
            </div>
            <div className={styles.sectionHeaderActions}>
              <button type="button" className={styles.primaryButton}>
                Detect new source clips
              </button>
            </div>
          </div>

          <div className={styles.clipLayout}>
            <aside className={styles.clipSidebar}>
              <label className={styles.searchField} htmlFor="clip-search">
                <span className="sr-only">Search clips</span>
                <input
                  id="clip-search"
                  type="search"
                  placeholder="Search sources (e.g. MrBeast, podcasts)"
                  value={clipQuery}
                  onChange={(event) => setClipQuery(event.target.value)}
                />
              </label>
              <div className={styles.clipList} role="list">
                {clipResults.map((clip) => {
                  const isActive = clip.id === selectedClip?.id;
                  return (
                    <button
                      key={clip.id}
                      type="button"
                      className={`${styles.clipCard} ${isActive ? styles.clipCardActive : ""}`}
                      onClick={() => setSelectedClipId(clip.id)}
                      aria-pressed={isActive}
                    >
                      <div>
                        <h3>{clip.title}</h3>
                        <p>{clip.creator}</p>
                      </div>
                      <span>{Math.round(clip.duration / 60)}m</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className={styles.clipWorkspace}>
              <div className={styles.playerWrapper}>
                <video
                  src={selectedClip?.url}
                  controls
                  className={styles.videoPlayer}
                  aria-label="Clip preview player"
                />
                <div className={styles.waveform}>
                  {waveformTemplate.map((value, index) => (
                    <span
                      key={`wave-${index}`}
                      style={{ height: `${Math.round(value * 100)}%` }}
                    />
                  ))}
                </div>
                <div className={styles.trimControls}>
                  <div className={styles.trimRange}>
                    <label htmlFor="trim-start">Start</label>
                    <input
                      id="trim-start"
                      type="range"
                      min={0}
                      max={selectedClip?.duration ?? 120}
                      step={0.5}
                      value={trimStart}
                      onChange={(event) =>
                        setTrimStart(
                          Math.min(
                            Number.parseFloat(event.target.value),
                            trimEnd - 0.5,
                          ),
                        )
                      }
                    />
                    <span>{trimStart.toFixed(1)}s</span>
                  </div>
                  <div className={styles.trimRange}>
                    <label htmlFor="trim-end">End</label>
                    <input
                      id="trim-end"
                      type="range"
                      min={0}
                      max={selectedClip?.duration ?? 120}
                      step={0.5}
                      value={trimEnd}
                      onChange={(event) =>
                        setTrimEnd(
                          Math.max(
                            Number.parseFloat(event.target.value),
                            trimStart + 0.5,
                          ),
                        )
                      }
                    />
                    <span>{trimEnd.toFixed(1)}s</span>
                  </div>
                  <div className={styles.trimSummary}>
                    <FaPlayCircle aria-hidden="true" />
                    <p>
                      Output clip: <strong>{(trimEnd - trimStart).toFixed(1)}s</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.clipOptions}>
                <div className={styles.optionCard}>
                  <header>
                    <MdOutlineSubtitles aria-hidden="true" />
                    <h3>Captioning</h3>
                  </header>
                  <label className={styles.optionToggle}>
                    <input
                      type="checkbox"
                      checked={captionsEnabled}
                      onChange={(event) => setCaptionsEnabled(event.target.checked)}
                    />
                    Enable kinetic captions
                  </label>
                  <label className={styles.optionSelect}>
                    Style
                    <select
                      value={clipCaptionStyle}
                      onChange={(event) => setClipCaptionStyle(event.target.value)}
                      disabled={!captionsEnabled}
                    >
                      <option value="Dynamic word highlights">
                        Dynamic word highlights
                      </option>
                      <option value="Creator-style bounce">Creator-style bounce</option>
                      <option value="Minimal uppercase">Minimal uppercase</option>
                    </select>
                  </label>
                </div>
                <div className={styles.optionCard}>
                  <header>
                    <MdOutlineLibraryAdd aria-hidden="true" />
                    <h3>Visual FX</h3>
                  </header>
                  <label className={styles.optionToggle}>
                    <input
                      type="checkbox"
                      checked={visualEffectsEnabled}
                      onChange={(event) => setVisualEffectsEnabled(event.target.checked)}
                    />
                    Apply motion graphics pack
                  </label>
                  <p>Add automatic punch-ins, zooms, and background treatments.</p>
                </div>
                <div className={styles.optionCard}>
                  <header>
                    <MdOutlineTipsAndUpdates aria-hidden="true" />
                    <h3>Compliance</h3>
                  </header>
                  <p>{selectedClip?.complianceNotes}</p>
                  <label className={styles.optionToggle}>
                    <input
                      type="checkbox"
                      checked={attributionConfirmed}
                      onChange={(event) => setAttributionConfirmed(event.target.checked)}
                    />
                    Confirm attribution overlays
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="scheduling-uploading" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Scheduling & Uploading</h2>
              <p className={styles.sectionSubtitle}>
                Sync your content plan with Google Sheets, visualize cadence on the calendar, and
                prep metadata for TikTok and YouTube Shorts.
              </p>
            </div>
            <div className={styles.sectionHeaderActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleSyncSheets}
                disabled={sheetSyncing}
              >
                {sheetSyncing ? "Syncing…" : "Sync Google Sheets"}
              </button>
            </div>
          </div>

          <div className={styles.schedulingGrid}>
            <aside className={styles.sheetCard} aria-label="Google Sheets integration status">
              <header>
                <FaCloudUploadAlt aria-hidden="true" />
                <div>
                  <h3>Google Sheets Integration</h3>
                  <p>Content blueprint <strong>sheet-164-trends</strong></p>
                </div>
              </header>
              <ul>
                <li>
                  Status:{" "}
                  <strong className={sheetConnected ? styles.successText : styles.warningText}>
                    {sheetConnected ? "Connected" : "Disconnected"}
                  </strong>
                </li>
                <li>
                  Last sync: <time>{format(lastSheetSync, "PPPpp")}</time>
                </li>
                <li>Columns mapped: Trend, Script URL, Asset Links, CTA, Tags</li>
              </ul>
              <button type="button" className={styles.secondaryButton}>
                Open Sheets workspace
              </button>
            </aside>

            <div className={styles.calendarWrapper}>
              <div className={styles.calendarHeader}>
                <div>
                  <h3>Upload Calendar</h3>
                  <p>Targeting twice daily cadence across TikTok & Shorts</p>
                </div>
                <div className={styles.calendarLegend}>
                  <span className={styles.legendDotTikTok} /> TikTok
                  <span className={styles.legendDotYt} /> YouTube Shorts
                </div>
              </div>
              <div className={styles.calendarGrid} role="grid">
                <div className={styles.calendarWeekday}>Sun</div>
                <div className={styles.calendarWeekday}>Mon</div>
                <div className={styles.calendarWeekday}>Tue</div>
                <div className={styles.calendarWeekday}>Wed</div>
                <div className={styles.calendarWeekday}>Thu</div>
                <div className={styles.calendarWeekday}>Fri</div>
                <div className={styles.calendarWeekday}>Sat</div>
                {calendarDays.map((day, index) => {
                  const key = format(day, "yyyy-MM-dd");
                  const posts = postsByDate[key] ?? [];
                  const isCurrentMonth = day.getMonth() === new Date().getMonth();
                  return (
                    <div
                      key={`${key}-${index}`}
                      className={`${styles.calendarCell} ${
                        isCurrentMonth ? "" : styles.calendarCellMuted
                      }`}
                      role="gridcell"
                      aria-label={`${format(day, "PPP")} ${posts.length} scheduled uploads`}
                    >
                      <header>
                        <span>{format(day, "d")}</span>
                        {isSameDay(day, new Date()) ? (
                          <span className={styles.todayBadge}>Today</span>
                        ) : null}
                      </header>
                      <div className={styles.calendarCellContent}>
                        {posts.map((post) => (
                          <span
                            key={post.id}
                            className={`${styles.calendarBadge} ${
                              post.platform === "TikTok"
                                ? styles.calendarBadgeTikTok
                                : styles.calendarBadgeYt
                            }`}
                          >
                            {format(new Date(post.scheduledAt), "HH:mm")}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.scheduleBottom}>
            <form className={styles.scheduleForm} onSubmit={handleScheduleSubmit}>
              <h3>Schedule New Upload</h3>
              <div className={styles.formRow}>
                <label>
                  Platform
                  <select
                    name="platform"
                    value={scheduleForm.platform}
                    onChange={handleScheduleFormChange}
                  >
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                  </select>
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    name="date"
                    value={scheduleForm.date}
                    onChange={handleScheduleFormChange}
                    required
                  />
                </label>
                <label>
                  Time
                  <input
                    type="time"
                    name="time"
                    value={scheduleForm.time}
                    onChange={handleScheduleFormChange}
                    required
                  />
                </label>
              </div>
              <label>
                Video title
                <input
                  type="text"
                  name="title"
                  placeholder="AI agents built my channel in 30 days"
                  value={scheduleForm.title}
                  onChange={handleScheduleFormChange}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Add context, credits, and CTA"
                  value={scheduleForm.description}
                  onChange={handleScheduleFormChange}
                />
              </label>
              <div className={styles.formRow}>
                <label>
                  Tags
                  <input
                    type="text"
                    name="tags"
                    placeholder="#AIAgents, #CreatorAutomation"
                    value={scheduleForm.tags}
                    onChange={handleScheduleFormChange}
                  />
                </label>
                <label>
                  Thumbnail URL
                  <input
                    type="url"
                    name="thumbnail"
                    placeholder="https://"
                    value={scheduleForm.thumbnail}
                    onChange={handleScheduleFormChange}
                  />
                </label>
              </div>
              <button type="submit" className={styles.primaryButton}>
                Add to calendar
              </button>
            </form>

            <aside className={styles.upcomingList} aria-label="Upcoming uploads">
              <h3>Upcoming Uploads</h3>
              <ul>
                {scheduledPosts.slice(0, 4).map((post) => (
                  <li key={post.id}>
                    <div>
                      <p className={styles.upcomingTitle}>{post.title}</p>
                      <p className={styles.upcomingMeta}>
                        {format(new Date(post.scheduledAt), "MMM d • HH:mm")} · {post.platform}
                      </p>
                      <p className={styles.upcomingTags}>
                        {post.tags.map((tag) => (
                          <span key={`${post.id}-${tag}`}>{tag}</span>
                        ))}
                      </p>
                    </div>
                    <span
                      className={`${styles.statusPill} ${
                        post.status === "Scheduled"
                          ? styles.statusPillScheduled
                          : post.status === "Ready"
                          ? styles.statusPillReady
                          : styles.statusPillDraft
                      }`}
                    >
                      {post.status}
                    </span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section id="viral-optimization" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Viral Optimization</h2>
              <p className={styles.sectionSubtitle}>
                Apply keyword insights, hashtag analysis, and creative A/B testing to push each clip
                toward virality.
              </p>
            </div>
            <div className={styles.sectionHeaderActions}>
              <button type="button" className={styles.primaryButton}>
                Apply recommendations
              </button>
            </div>
          </div>

          <div className={styles.optimizationGrid}>
            <article className={styles.optimizationPanel}>
              <header>
                <h3>Recommendations</h3>
                <span className={styles.panelHint}>Data-backed opportunities</span>
              </header>
              <ul className={styles.recommendationsList}>
                {recommendations.map((recommendation) => (
                  <li key={recommendation.id}>
                    <div>
                      <p className={styles.recommendationCategory}>
                        {recommendation.category}
                      </p>
                      <h4>{recommendation.title}</h4>
                      <p>{recommendation.description}</p>
                      <p className={styles.recommendationAction}>
                        <strong>Action:</strong> {recommendation.action}
                      </p>
                    </div>
                    <div className={styles.recommendationMeta}>
                      <span>
                        +{recommendation.metricLift}% projected lift
                      </span>
                      <button
                        type="button"
                        className={`${styles.secondaryButton} ${
                          recommendation.ready ? "" : styles.secondaryButtonDisabled
                        }`}
                        disabled={!recommendation.ready}
                      >
                        {recommendation.ready ? "Implement" : "Queued"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className={styles.optimizationPanel}>
              <header>
                <h3>Performance Intelligence</h3>
                <span className={styles.panelHint}>Views, likes, shares</span>
              </header>
              <div className={styles.chartRow}>
                <div className={styles.chartCard}>
                  <h4>Strategy comparison</h4>
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={performanceMetrics}>
                        <CartesianGrid vertical={false} stroke="#e4e9f2" />
                        <XAxis dataKey="strategy" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="views" fill="#3498db" name="Views" radius={[8, 8, 8, 8]} />
                        <Bar dataKey="likes" fill="#2ecc71" name="Likes" radius={[8, 8, 8, 8]} />
                        <Bar dataKey="shares" fill="#f2994a" name="Shares" radius={[8, 8, 8, 8]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className={styles.chartCard}>
                  <h4>Velocity curve</h4>
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={velocitySeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e9f2" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="views" stroke="#3498db" strokeWidth={3} dot />
                        <Line type="monotone" dataKey="likes" stroke="#2ecc71" strokeWidth={3} dot />
                        <Line type="monotone" dataKey="shares" stroke="#f2994a" strokeWidth={3} dot />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </article>

            <article className={styles.optimizationPanel}>
              <header>
                <h3>Hashtag Analysis</h3>
                <span className={styles.panelHint}>Trending combos</span>
              </header>
              <table className={styles.hashtagTable}>
                <caption className="sr-only">Hashtag performance table</caption>
                <thead>
                  <tr>
                    <th scope="col">Hashtag</th>
                    <th scope="col">Lift</th>
                    <th scope="col">Average views</th>
                  </tr>
                </thead>
                <tbody>
                  {hashtagMetrics.map((metric) => (
                    <tr key={metric.hashtag}>
                      <th scope="row">{metric.hashtag}</th>
                      <td>
                        <span className={styles.growthPositive}>+{metric.lift}%</span>
                      </td>
                      <td>{metric.avgViews.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <article className={styles.optimizationPanel}>
              <header>
                <h3>A/B Testing Lab</h3>
                <span className={styles.panelHint}>Titles & thumbnails</span>
              </header>
              <div className={styles.abTesting}>
                <div>
                  <h4>Title experiment</h4>
                  <div className={styles.abList} role="radiogroup" aria-label="Title variants">
                    {abTitleTests.map((test) => (
                      <label
                        key={test.variant}
                        className={`${styles.abOption} ${
                          test.winner ? styles.abWinner : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="title-variant"
                          value={test.variant}
                          checked={selectedTitleVariant === test.variant}
                          onChange={(event) =>
                            setSelectedTitleVariant(event.target.value)
                          }
                        />
                        <div>
                          <p>{test.variant}</p>
                          <span>CTR {test.ctr}% · {test.views.toLocaleString()} views</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4>Thumbnail experiment</h4>
                  <div className={styles.abList} role="radiogroup" aria-label="Thumbnail variants">
                    {abThumbnailTests.map((test) => (
                      <label
                        key={test.variant}
                        className={`${styles.abOption} ${
                          test.winner ? styles.abWinner : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="thumbnail-variant"
                          value={test.variant}
                          checked={selectedThumbnailVariant === test.variant}
                          onChange={(event) =>
                            setSelectedThumbnailVariant(event.target.value)
                          }
                        />
                        <div>
                          <p>{test.variant}</p>
                          <span>CTR {test.ctr}% · {test.watchTime}% watch time</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
