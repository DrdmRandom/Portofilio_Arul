import { useEffect, useState } from "react";
import { fallbackIgContent, fallbackWorkExperience, profile } from "./data/fallbackData";
import { fetchCmsArulContent } from "./services/strapi";

const THEME_KEY = "fachruly-portfolio-theme";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  const savedTheme = window.localStorage.getItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

const formatDate = (value) => {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return null;
  }
};

const resolveSocialMeta = (item) => {
  const platform = `${item?.platform || ""}`.toLowerCase();
  const url = `${item?.postUrl || ""}`.toLowerCase();

  if (platform.includes("instagram") || url.includes("instagram.com")) {
    return { key: "instagram", label: "Instagram", shortLabel: "IG" };
  }
  if (platform.includes("linkedin") || url.includes("linkedin.com")) {
    return { key: "linkedin", label: "LinkedIn", shortLabel: "in" };
  }
  if (platform.includes("tiktok") || url.includes("tiktok.com")) {
    return { key: "tiktok", label: "TikTok", shortLabel: "TT" };
  }
  if (platform.includes("youtube") || url.includes("youtube.com") || url.includes("youtu.be")) {
    return { key: "youtube", label: "YouTube", shortLabel: "YT" };
  }
  return { key: "social", label: item?.platform || "Social", shortLabel: "SM" };
};

function App() {
  const [igContent, setIgContent] = useState(fallbackIgContent);
  const [workExperience, setWorkExperience] = useState(fallbackWorkExperience);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    let isMounted = true;

    const loadCms = async () => {
      try {
        const result = await fetchCmsArulContent();
        if (!isMounted) return;

        const hasIg = Array.isArray(result.igContent) && result.igContent.length > 0;
        const hasWork = Array.isArray(result.workExperience) && result.workExperience.length > 0;

        if (hasIg) setIgContent(result.igContent);
        if (hasWork) setWorkExperience(result.workExperience);
      } catch {
        if (!isMounted) return;
      }
    };

    loadCms();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <main className="page-shell">
      <div className="bg-shape bg-shape-1" />
      <div className="bg-shape bg-shape-2" />
      <div className="bg-grid" />

      <section className="hero section">
        <div className="hero-copy">
          <div className="hero-topbar">
            <p className="eyebrow">PORTOFOLIO KOMUNIKASI</p>
            <button type="button" className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
          <h1>
            {profile.name}
            <span>{profile.role}</span>
          </h1>
          <p className="lead">{profile.bio}</p>

          <div className="hero-metadata">
            <span>{profile.major}</span>
            <span>{profile.city}</span>
          </div>

          <div className="hero-actions">
            {profile.socials?.map((social) => (
              <a href={social.url} target="_blank" rel="noreferrer" className="social-action" key={social.label}>
                <span className="social-tag">{social.shortLabel}</span>
                <span>{social.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <img src={profile.profileAltImage} alt={`${profile.name} portrait`} className="hero-portrait" />
        </div>
      </section>

      <section className="section section-ig" id="ig-content">
        <div className="section-heading">
          <p className="eyebrow">SOCIAL CONTENT</p>
          <h2>Konten Buatan Saya</h2>
        </div>

        <div className="content-list">
          {igContent.map((item) => {
            const socialMeta = resolveSocialMeta(item);
            return (
              <a
                className="content-card"
                key={item.id}
                href={item.postUrl || "https://instagram.com/"}
                target="_blank"
                rel="noreferrer"
              >
                <div className="content-side">
                  <span className={`social-logo ${socialMeta.key}`}>{socialMeta.shortLabel}</span>
                  <span className="social-name">{socialMeta.label}</span>
                </div>
                <div className="content-main">
                  <div className="content-head">
                    <h3>{item.title}</h3>
                    <span>{formatDate(item.publishedAt) || "Tanggal fleksibel"}</span>
                  </div>
                  <p>{item.caption}</p>
                  <div className="content-foot">
                    <span className="metric-pill">{item.metric || "Brand Awareness"}</span>
                    <span className="open-post">Buka konten</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="section section-work" id="work-experience">
        <div className="section-heading">
          <p className="eyebrow">WORK EXPERIENCE</p>
          <h2>Pengalaman Kerja</h2>
        </div>

        <div className="work-timeline">
          {workExperience.map((item) => (
            <article className="work-item" key={item.id}>
              <div className="work-line">
                <span />
              </div>
              <div className="work-panel">
                <div className="work-top">
                  <h3>{item.role}</h3>
                  <p>{item.period}</p>
                </div>
                <p className="work-company">{item.company}</p>
                {item.summary ? <p className="work-summary">{item.summary}</p> : null}
                {item.highlights?.length > 0 ? (
                  <ul className="work-tags">
                    {item.highlights.map((point) => (
                      <li key={`${item.id}-${point}`}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
