function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("opendih-theme", next);
}

(function () {
  const saved = localStorage.getItem("opendih-theme");
  if (saved) {
    document.documentElement.setAttribute("data-theme", saved);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

const blogFiles = [
  "23-03-2026.json",
  "10-02-2026.json",
  "01-01-2026.json",
];
let isDescending = true;
let blogCache = {};

function parseDate(filename) {
  const parts = filename.replace(".json", "").split("-");
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

function formatDate(filename) {
  const date = parseDate(filename);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function renderBlogs() {
  const container = document.getElementById("blog-container");
  container.innerHTML =
    '<div style="padding: 20px; text-align:center; color: #888;">Loading publications...</div>';

  const sorted = [...blogFiles].sort((a, b) =>
    isDescending
      ? parseDate(b) - parseDate(a)
      : parseDate(a) - parseDate(b),
  );

  let html = "";
  for (const file of sorted) {
    try {
      if (!blogCache[file]) {
        const res = await fetch(`src/blogs/${file}`);
        if (!res.ok) continue;
        blogCache[file] = await res.json();
      }
      const data = blogCache[file];

      html += `
        <div class="blog-item" onclick="openBlog('${file}')">
          <div class="blog-date">${formatDate(file)}</div>
          <h3 class="blog-title">${data.title}</h3>
          <p class="blog-excerpt">${data.excerpt}</p>
        </div>`;
    } catch (e) {
      console.warn("Failed to load blog:", file);
    }
  }
  container.innerHTML =
    html ||
    '<div style="padding: 20px; text-align:center;">No publications found.</div>';
}

function openBlog(file) {
  const data = blogCache[file];
  document.getElementById("modal-content").innerHTML = `
    <h2 class="modal-title">${data.title}</h2>
        <div class="modal-content" style="padding-bottom: 10em;">${data.content}</div>`;

  document.getElementById("modal-overlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeBlog() {
  document.getElementById("modal-overlay").classList.remove("active");
  document.body.style.overflow = "auto";
}

function handleOverlayClick(e) {
  if (e.target.id === "modal-overlay") closeBlog();
}

function toggleSort() {
  isDescending = !isDescending;
  document.getElementById("sort-btn").innerText = isDescending
    ? "Newest First"
    : "Oldest First";
  renderBlogs();
}

renderBlogs();
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeBlog();
});
