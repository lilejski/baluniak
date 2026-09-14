/**
 * Opens a pull request with new content.
 *
 * The draft never lands on the site directly. It arrives as a PR, which is the
 * review gate: unreviewed AI content published on a schedule is precisely what
 * Google's scaled-content-abuse policy targets, and a penalty would cost more
 * than the articles are worth. A PR also means the diff is readable, the
 * history is kept, and rejecting a bad draft is one click.
 */

const OWNER = "lilejski";
const REPO = "baluniak";
const BASE_BRANCH = "main";
const API = "https://api.github.com";

export type NewFile = { path: string; content: string };

function headers(token: string) {
  return {
    authorization: `Bearer ${token}`,
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "content-type": "application/json",
  };
}

async function gh<T>(
  token: string,
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: init?.method ?? "GET",
    headers: headers(token),
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`GitHub ${init?.method ?? "GET"} ${path} → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

export function hasToken(): boolean {
  return Boolean(process.env.GITHUB_TOKEN);
}

/**
 * Creates a branch, commits the files to it and opens a pull request.
 * Returns the PR's URL.
 */
export async function openContentPullRequest(opts: {
  branchName: string;
  title: string;
  body: string;
  files: NewFile[];
}): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");

  // Point the new branch at whatever main currently is.
  const base = await gh<{ object: { sha: string } }>(
    token,
    `/repos/${OWNER}/${REPO}/git/ref/heads/${BASE_BRANCH}`
  );
  const baseSha = base.object.sha;

  await gh(token, `/repos/${OWNER}/${REPO}/git/refs`, {
    method: "POST",
    body: { ref: `refs/heads/${opts.branchName}`, sha: baseSha },
  });

  // One commit per file keeps this simple; drafts are only ever a file or two.
  for (const file of opts.files) {
    await gh(token, `/repos/${OWNER}/${REPO}/contents/${encodeURI(file.path)}`, {
      method: "PUT",
      body: {
        message: `content: draft ${file.path.split("/").pop()}`,
        content: Buffer.from(file.content, "utf8").toString("base64"),
        branch: opts.branchName,
      },
    });
  }

  const pr = await gh<{ html_url: string }>(token, `/repos/${OWNER}/${REPO}/pulls`, {
    method: "POST",
    body: {
      title: opts.title,
      body: opts.body,
      head: opts.branchName,
      base: BASE_BRANCH,
    },
  });

  return pr.html_url;
}
