(() => {
  const page = document.querySelector('[data-platform]');
  const platform = page.dataset.platform;
  const items = [...window.siteContent.apps, ...window.siteContent.games.map(item => ({ platform: 'browser', ...item })), ...window.siteContent.console.map(item => ({ platform: 'console', ...item }))].filter(item => item.platform === platform);
  const buttons = [...document.querySelectorAll('[data-tag]')];
  const toggleAll = document.getElementById('toggle-all-filters');
  const list = document.getElementById('catalog-list');
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const render = () => {
    const selected = buttons.filter(button => button.getAttribute('aria-pressed') === 'true').map(button => button.dataset.tag);
    toggleAll.textContent = selected.length === buttons.length ? '全てOFF' : '全てON';
    const visible = items.filter(item => item.tags.some(tag => selected.includes(tag)));
    document.getElementById('result-count').textContent = `${visible.length} / ${items.length} 件の作品`;
    list.innerHTML = visible.length ? visible.map(item => `<article class="detail-card detail-app-card catalog-card">
      ${item.image ? `<img src="${escape(item.image)}" alt="" width="92" height="92" />` : `<div class="gacha-app-icon" aria-hidden="true">${escape(item.symbol || '✦')}</div>`}
      <div><span class="catalog-status">${escape(item.status)}</span><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p><ul class="tag-list">${item.tags.map(tag => `<li>${escape(tag)}</li>`).join('')}</ul>${item.url ? `<a class="button primary" href="../${escape(item.url)}">詳しく見る <span aria-hidden="true">→</span></a>` : '<span class="catalog-status">公開準備中</span>'}</div>
    </article>`).join('') : `<div class="catalog-empty"><span class="empty-spark" aria-hidden="true">✦</span><p class="eyebrow">${items.length ? 'No matches' : 'Coming soon'}</p><h2>${!selected.length ? 'タグをONにして、作品を探そう。' : items.length ? 'このタグの作品は、まだありません。' : '次の楽しみを、ここから。'}</h2><p>${!selected.length ? 'ゲーム・ツールから、気になるタグを選んでください。' : items.length ? '別のタグをONにすると、公開中の作品が表示されます。' : '作品の公開準備が整い次第、このページでお知らせします。'}</p></div>`;
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    render();
  }));
  toggleAll.addEventListener('click', () => {
    const allSelected = buttons.every(button => button.getAttribute('aria-pressed') === 'true');
    buttons.forEach(button => button.setAttribute('aria-pressed', String(!allSelected)));
    render();
  });
  document.getElementById('year').textContent = new Date().getFullYear();
  render();
})();
