export function downloadFile(filename, text, mime = "text/plain") {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const safeName = (s) =>
  (s || "study-notes").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "study-notes";

export function notesToMarkdown(notes) {
  const lines = [`# ${notes.title}`, "", notes.summary, ""];
  (notes.sections ?? []).forEach((s) => {
    lines.push(`## ${s.heading}`, "");
    (s.points ?? []).forEach((p) => lines.push(`- ${p}`));
    lines.push("");
  });
  return lines.join("\n");
}

// Anki: File > Import. Tab-separated, "front<TAB>back"
export function flashcardsToAnki(cards) {
  const clean = (t) => String(t ?? "").replace(/\t/g, " ").replace(/\r?\n/g, "<br>");
  return ["#separator:tab", "#html:true", ...cards.map((c) => `${clean(c.front)}\t${clean(c.back)}`)].join("\n");
}

export function flashcardsToCsv(cards) {
  const q = (t) => `"${String(t ?? "").replace(/"/g, '""')}"`;
  return ["front,back", ...cards.map((c) => `${q(c.front)},${q(c.back)}`)].join("\n");
}

const esc = (t) =>
  String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Opens a clean printable page; the user picks "Save as PDF" in the print dialog
export function printNotes(notes) {
  const w = window.open("", "_blank");
  if (!w) return false; // popup blocked
  const body = (notes.sections ?? [])
    .map((s) => `<h2>${esc(s.heading)}</h2><ul>${(s.points ?? []).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`)
    .join("");
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(notes.title)}</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;color:#111;line-height:1.55}
h1{font-size:26px}h2{font-size:18px;margin-top:26px;color:#1d4ed8}.sum{background:#f3f4f6;padding:12px 14px;border-radius:8px}
li{margin:4px 0}</style></head><body><h1>${esc(notes.title)}</h1><p class="sum">${esc(notes.summary)}</p>${body}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
  return true;
}