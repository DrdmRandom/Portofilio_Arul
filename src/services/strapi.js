const DEFAULT_STRAPI_URL = "https://strapi.cihuy-familly.my.id";

const ENDPOINT_CANDIDATES = [
  "/api/cms-aruls?populate=*",
  "/api/cms-arul?populate=*",
  "/api/cms_aruls?populate=*",
];

const IG_KEYWORDS = ["ig", "instagram", "content", "post", "social"];
const WORK_KEYWORDS = ["work", "experience", "career", "job", "pengalaman"];

const flattenStrapiData = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((item) => item?.attributes || item).filter(Boolean);
  }
  return [data?.attributes || data].filter(Boolean);
};

const toIsoDate = (value) => {
  if (!value) return null;
  const asDate = new Date(value);
  if (Number.isNaN(asDate.getTime())) return null;
  return asDate.toISOString();
};

const mediaUrlFromValue = (value, baseUrl) => {
  if (!value) return null;
  if (typeof value === "string") {
    if (value.startsWith("http")) return value;
    if (value.startsWith("/")) return `${baseUrl}${value}`;
    return value;
  }

  const nested = value?.data?.attributes || value?.attributes || value?.data || value;
  const url = nested?.url || nested?.formats?.large?.url || nested?.formats?.medium?.url;
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  return url;
};

const findFieldByKeywords = (source, keywords) => {
  if (!source || typeof source !== "object") return [];

  const entries = Object.entries(source);
  const match = entries.find(([key, value]) => {
    const keyLower = key.toLowerCase();
    return keywords.some((keyword) => keyLower.includes(keyword)) && (Array.isArray(value) || value?.data);
  });

  if (!match) return [];

  const value = match[1];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (value?.data) return [value.data];
  return [];
};

const normalizeIgItem = (item, index, baseUrl) => {
  const data = item?.attributes || item || {};
  return {
    id: data.id || data.documentId || `ig-${index + 1}`,
    title:
      data.title ||
      data.judul ||
      data.name ||
      data.headline ||
      `Instagram Content ${index + 1}`,
    caption: data.caption || data.description || data.copy || "",
    platform: data.platform || "Instagram",
    metric: data.metric || data.result || data.insight || "Brand Awareness",
    publishedAt: toIsoDate(
      data.publishedAt || data.publishedat || data.publish_date || data.publishDate || data.date,
    ),
    thumbnail:
      mediaUrlFromValue(data.thumbnail, baseUrl) ||
      mediaUrlFromValue(data.thumbnailUrl, baseUrl) ||
      mediaUrlFromValue(data.thumbnail_url, baseUrl) ||
      mediaUrlFromValue(data.image, baseUrl) ||
      mediaUrlFromValue(data.cover, baseUrl),
    postUrl:
      data.postUrl ||
      data.postURL ||
      data.post_url ||
      data.url ||
      data.link ||
      "https://instagram.com/",
  };
};

const normalizeWorkItem = (item, index) => {
  const data = item?.attributes || item || {};

  const highlightsRaw = data.highlights || data.points || data.achievements;
  const highlights = Array.isArray(highlightsRaw)
    ? highlightsRaw
        .map((entry) => {
          if (typeof entry === "string") return entry;
          if (entry && typeof entry === "object") {
            return entry.text || entry.title || entry.label || "";
          }
          return "";
        })
        .filter(Boolean)
    : typeof highlightsRaw === "string"
      ? highlightsRaw
          .split("\n")
          .map((point) => point.trim())
          .filter(Boolean)
      : [];

  const start = data.startDate || data.start_date;
  const end = data.endDate || data.end_date;
  const periodFromDates = start
    ? `${start}${end ? ` - ${end}` : " - Sekarang"}`
    : "Periode belum diisi";

  return {
    id: data.id || data.documentId || `work-${index + 1}`,
    role: data.role || data.position || data.job_title || "Communication Role",
    company: data.company || data.organization || data.client || "Company",
    period: data.period || data.duration || data.timeline || periodFromDates,
    summary: data.summary || data.description || "",
    highlights,
  };
};

const fromTypedRows = (rows, baseUrl) => {
  const igRows = [];
  const workRows = [];

  rows.forEach((row, index) => {
    const data = row?.attributes || row || {};
    const type = `${data.type || data.content_type || data.category || ""}`.toLowerCase();
    if (type.includes("ig") || type.includes("instagram")) {
      igRows.push(normalizeIgItem(data, index, baseUrl));
    }
    if (type.includes("work") || type.includes("experience")) {
      workRows.push(normalizeWorkItem(data, index));
    }
  });

  return { igRows, workRows };
};

const pickMainRecord = (records) => {
  if (!records.length) return null;
  if (records.length === 1) return records[0];

  const featured = records.find((record) => {
    const flag = record.featured || record.isFeatured || record.is_main;
    return flag === true;
  });

  return featured || records[0];
};

const parseCmsResponse = (payload, baseUrl) => {
  const records = flattenStrapiData(payload?.data);
  const mainRecord = pickMainRecord(records);

  if (!mainRecord) return { igContent: [], workExperience: [] };

  const igByField = findFieldByKeywords(mainRecord, IG_KEYWORDS).map((item, index) =>
    normalizeIgItem(item, index, baseUrl),
  );
  const workByField = findFieldByKeywords(mainRecord, WORK_KEYWORDS).map((item, index) =>
    normalizeWorkItem(item, index),
  );

  const { igRows, workRows } = fromTypedRows(records, baseUrl);

  return {
    igContent: igByField.length ? igByField : igRows,
    workExperience: workByField.length ? workByField : workRows,
  };
};

const fetchFromEndpoint = async (baseUrl, endpoint) => {
  const response = await fetch(`${baseUrl}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
};

export const fetchCmsArulContent = async () => {
  const baseUrl = (import.meta.env.VITE_STRAPI_URL || DEFAULT_STRAPI_URL).replace(/\/+$/, "");

  let lastError = null;
  for (const endpoint of ENDPOINT_CANDIDATES) {
    try {
      const payload = await fetchFromEndpoint(baseUrl, endpoint);
      const parsed = parseCmsResponse(payload, baseUrl);
      return {
        ...parsed,
        source: `${baseUrl}${endpoint}`,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Unable to load CMS_Arul");
};
