import fs from "node:fs";
import path from "node:path";

const eventPath = process.argv[2];

if (!eventPath) {
  throw new Error("Usage: node issue-to-post.mjs <github-event-path>");
}

const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
const issue = event.issue;

if (!issue) {
  throw new Error("This workflow must be triggered by an issue event.");
}

const labels = (issue.labels || []).map((label) => label.name);

if (!labels.includes("blog")) {
  console.log(`Issue #${issue.number} does not have the blog label. Skipping.`);
  process.exit(0);
}

const sections = parseSections(issue.body || "");
const title = cleanTitle(issue.title || `Issue ${issue.number}`);
const summary = firstNonEmpty(sections.get("summary"), sections.get("description"));
const slug = firstNonEmpty(sections.get("slug"), slugify(title), `issue-${issue.number}`);
const body = firstNonEmpty(sections.get("post body"), sections.get("body"), issue.body || "");
const tags = unique([
  ...parseTags(firstNonEmpty(sections.get("tags"), "")),
  ...labels.filter((label) => !["blog", "published"].includes(label.toLowerCase())),
]);

const createdAt = new Date(issue.created_at);
const datePart = createdAt.toISOString().slice(0, 10);
const postDir = "_posts";
const fileName = `${datePart}-${slug}.md`;
let targetPath = path.join(postDir, fileName);

fs.mkdirSync(postDir, { recursive: true });

const existingPath = findExistingPost(postDir, issue.number);

if (existingPath && path.normalize(existingPath) !== path.normalize(targetPath)) {
  if (fs.existsSync(targetPath)) {
    targetPath = path.join(postDir, `${datePart}-${slug}-issue-${issue.number}.md`);
  }

  fs.renameSync(existingPath, targetPath);
}

const content = renderPost({
  title,
  date: issue.created_at,
  summary,
  tags,
  issueNumber: issue.number,
  issueUrl: issue.html_url,
  body,
});

fs.writeFileSync(targetPath, content, "utf8");
console.log(`Wrote ${targetPath}`);

function parseSections(markdown) {
  const sectionsByName = new Map();
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let currentName = null;
  let currentLines = [];

  function saveCurrentSection() {
    if (!currentName) {
      return;
    }

    sectionsByName.set(normalizeSectionName(currentName), currentLines.join("\n").trim());
  }

  for (const line of lines) {
    const match = line.match(/^###\s+(.+?)\s*$/);

    if (match) {
      saveCurrentSection();
      currentName = match[1];
      currentLines = [];
      continue;
    }

    if (currentName) {
      currentLines.push(line);
    }
  }

  saveCurrentSection();
  return sectionsByName;
}

function normalizeSectionName(name) {
  return name.trim().toLowerCase();
}

function cleanTitle(title) {
  return title.replace(/^\s*\[blog\]\s*/i, "").trim();
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseTags(value) {
  return value
    .split(/[\n,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => !/^_no response_$/i.test(tag));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function findExistingPost(postDir, issueNumber) {
  if (!fs.existsSync(postDir)) {
    return null;
  }

  const issuePattern = new RegExp(`^github_issue_number:\\s*${issueNumber}\\s*$`, "m");

  for (const entry of fs.readdirSync(postDir)) {
    if (!entry.endsWith(".md")) {
      continue;
    }

    const candidate = path.join(postDir, entry);
    const content = fs.readFileSync(candidate, "utf8");

    if (issuePattern.test(content)) {
      return candidate;
    }
  }

  return null;
}

function renderPost({ title, date, summary, tags, issueNumber, issueUrl, body }) {
  const tagBlock = tags.length
    ? tags.map((tag) => `  - ${yamlString(tag)}`).join("\n")
    : "[]";

  return `---\nlayout: post\ntitle: ${yamlString(title)}\ndate: ${yamlString(date)}\ndescription: ${yamlString(summary)}\ncategory: null\npublished: true\ntags: ${tags.length ? `\n${tagBlock}` : tagBlock}\ngithub_issue_number: ${issueNumber}\ngithub_issue_url: ${yamlString(issueUrl)}\n---\n\n${body.trim()}\n`;
}

function yamlString(value) {
  return JSON.stringify(String(value || ""));
}
