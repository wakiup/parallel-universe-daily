// src/lib/markdown.ts
// Simple Markdown -> HTML converter

/** 转义 HTML 实体，防止 XSS */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** 行内格式化：粗体、斜体、行内代码 */
function inlineFormat(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

/**
 * 简易 Markdown -> HTML 转换
 * 支持: 标题(#)、粗体(**)、斜体(*)、引用(>)、列表(-)、段落、换行
 */
export function formatMarkdown(markdown: string): string {
  const lines = markdown.split("\n");
  let html = "";
  let inBlockquote = false;
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // 空行：结束当前块级元素
    if (line.trim() === "") {
      if (inBlockquote) {
        html += "</blockquote>";
        inBlockquote = false;
      }
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      continue;
    }

    // 引用块
    if (line.startsWith("> ")) {
      if (!inBlockquote) {
        html += "<blockquote>";
        inBlockquote = true;
      }
      html += `<p>${inlineFormat(line.slice(2))}</p>`;
      continue;
    } else if (inBlockquote) {
      html += "</blockquote>";
      inBlockquote = false;
    }

    // 无序列表
    if (line.startsWith("- ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${inlineFormat(line.slice(2))}</li>`;
      continue;
    } else if (inList) {
      html += "</ul>";
      inList = false;
    }

    // 分隔线
    if (line.match(/^---+$/)) {
      html += "<hr />";
      continue;
    }

    // 标题
    const h3Match = line.match(/^### (.+)$/);
    if (h3Match) {
      html += `<h3>${inlineFormat(h3Match[1])}</h3>`;
      continue;
    }
    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      html += `<h2>${inlineFormat(h2Match[1])}</h2>`;
      continue;
    }
    const h1Match = line.match(/^# (.+)$/);
    if (h1Match) {
      html += `<h1>${inlineFormat(h1Match[1])}</h1>`;
      continue;
    }

    // 普通段落
    html += `<p>${inlineFormat(line)}</p>`;
  }

  // 关闭未关闭的块级元素
  if (inBlockquote) html += "</blockquote>";
  if (inList) html += "</ul>";

  return html;
}
