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
  target.innerHTML = items
    .map(
      (item) => `
        <article class="card">
          <div class="card-visual ${item.theme || ""}">
            <span class="visual-label">${item.status}</span>
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

renderCards(content.apps, "apps-list");
renderCards(content.games, "games-list");
renderNews();

document.getElementById("app-count").textContent = content.apps.length;
document.getElementById("game-count").textContent = content.games.length;
document.getElementById("news-count").textContent = content.news.length;
document.getElementById("year").textContent = new Date().getFullYear();
