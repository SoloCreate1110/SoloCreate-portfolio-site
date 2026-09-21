const content = window.siteContent;

const createTagList = (tags) =>
  `<ul class="tag-list">${tags.map((tag) => `<li>${tag}</li>`).join("")}</ul>`;

const createLinks = (links) => {
  if (!links.length) {
    return '<span class="text-link" aria-disabled="true">準備中</span>';
  }

  return links
    .map(
      (link) =>
        `<a class="text-link" href="${link.url}" ${
          link.url.startsWith("http") ? 'target="_blank" rel="noreferrer"' : ""
        }>${link.label}</a>`,
    )
    .join("");
};

const renderCards = (items, targetId) => {
  const target = document.getElementById(targetId);
  if (!items.length) {
    target.innerHTML = `
      <article class="games-coming-soon">
        <p class="eyebrow">Coming soon</p>
        <h3>次のひと遊びを、お楽しみに。</h3>
        <p>新しいゲームは、準備ができ次第こちらに公開します。</p>
        <span class="visual-label">公開準備中</span>
      </article>
    `;
    return;
  }
  target.innerHTML = items
    .map(
      (item) => `
        <article class="card">
          <div class="card-visual ${item.theme || ""}">
            <span class="visual-label">${item.status}</span>
            <span class="game-wordmark" aria-hidden="true">${item.title}</span>
          </div>
          <div class="card-body">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            ${createTagList(item.tags)}
            <div class="card-links">${createLinks(item.links)}</div>
          </div>
        </article>
      `,
    )
    .join("");
};

const renderAppCards = (items, targetId) => {
  const target = document.getElementById(targetId);
  target.innerHTML = items
    .map((item) => {
      const cardContent = `
        <div class="card-visual ${item.theme || ""}">
          <span class="visual-label">${item.status}</span>
          ${item.image ? `<img class="app-card-icon" src="${item.image}" alt="" loading="lazy" width="62" height="62" />` : `<span class="next-project-mark" aria-hidden="true">${item.symbol || "＋"}</span>`}
        </div>
        <div class="card-body">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          ${createTagList(item.tags)}
          <span class="card-cta">${item.url ? "紹介を見る" : "準備中"}</span>
        </div>
      `;

      if (!item.url) {
        return `<article class="card app-card is-disabled">${cardContent}</article>`;
      }

      return `
        <a class="card app-card" href="${item.url}" aria-label="${item.title}の紹介ページを見る">
          ${cardContent}
        </a>
      `;
    })
    .join("");
};

const renderNews = () => {
  const target = document.getElementById("news-list");
  target.innerHTML = content.news
    .map(
      (item) => `
        <article class="news-item">
          <time class="news-date" datetime="${item.date}">${item.date}</time>
          <div>
            <h3>${item.title}</h3>
            <p>${item.body}</p>
          </div>
        </article>
      `,
    )
    .join("");
};

const renderBlog = () => {
  const target = document.getElementById("blog-list");
  if (target.dataset.rendered === "jekyll") return;
  target.innerHTML = content.blog
    .map(
      (item) => `
        <a class="blog-card" href="${item.url}" aria-label="${item.title}を読む">
          <article>
            <time datetime="${item.date}">${item.date}</time>
            <h3>${item.title}</h3>
            <p>${item.excerpt}</p>
            ${createTagList(item.tags)}
            <span class="blog-card-cta">記事を読む <span aria-hidden="true">→</span></span>
          </article>
        </a>
      `,
    )
    .join("");
};

const projects = [...content.apps, ...content.games.map(item => ({ platform: "browser", ...item })), ...content.console.map(item => ({ platform: "console", ...item }))];
renderAppCards(projects.filter((item) => item.platform === "mobile"), "mobile-list");
renderAppCards(projects.filter((item) => item.platform === "browser"), "browser-list");
const consoleProjects = projects.filter(item => item.platform === "console");
if (consoleProjects.length) {
  renderAppCards(consoleProjects, "console-list");
} else {
  document.getElementById("console-list").innerHTML = '<article class="console-preview"><span class="eyebrow">Coming soon</span><h3>次の楽しみを、ここから。</h3><p>コンソール向けの作品は、公開準備が整い次第お知らせします。</p></article>';
}
renderNews();
renderBlog();

document.getElementById("year").textContent = new Date().getFullYear();
