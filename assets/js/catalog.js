(() => {
  const page = document.querySelector('[data-platform]');
  const platform = page.dataset.platform;
  const header = document.querySelector('.site-header');
  const filter = document.querySelector('.catalog-filter');
  const updateStickyOffsets = () => {
    const headerHeight = header?.getBoundingClientRect().height || 0;
    const filterHeight = filter?.getBoundingClientRect().height || 0;
    document.documentElement.style.setProperty('--catalog-header-height', `${headerHeight}px`);
    document.documentElement.style.setProperty('--catalog-scroll-offset', `${headerHeight + filterHeight + 24}px`);
  };
  const layoutObserver = new ResizeObserver(updateStickyOffsets);
  if (header) layoutObserver.observe(header);
  if (filter) layoutObserver.observe(filter);
  updateStickyOffsets();
  const items = [...window.siteContent.apps, ...window.siteContent.games.map(item => ({ platform: 'browser', ...item })), ...window.siteContent.console.map(item => ({ platform: 'console', ...item }))].filter(item => item.platform === platform);
  const buttons = [...document.querySelectorAll('[data-tag]')];
  const pcFilter = document.querySelector('[data-filter-pc]');
  const filterButtons = pcFilter ? [...buttons, pcFilter] : buttons;
  const toggleAll = document.getElementById('toggle-all-filters');
  const list = document.getElementById('catalog-list');
  let reservedHeight = 0;
  let listWidth = 0;
  const reserveListSpace = () => {
    const width = list.getBoundingClientRect().width;
    if (width !== listWidth) {
      reservedHeight = 0;
      listWidth = width;
    }
    const children = [...list.children];
    const gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    const heights = children.map(child => child.getBoundingClientRect().height);
    const cardHeight = Math.max(280, ...children.filter(child => child.matches('.catalog-card')).map(child => child.getBoundingClientRect().height));
    // Keep room for at least two cards, and retain the height before filtering.
    reservedHeight = Math.max(reservedHeight, cardHeight * 2 + gap, heights.reduce((sum, height) => sum + height, 0) + gap * Math.max(0, children.length - 1));
    list.style.minHeight = `${Math.ceil(reservedHeight)}px`;
  };
  const listObserver = new ResizeObserver(reserveListSpace);
  listObserver.observe(list);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const render = () => {
    reserveListSpace();
    const selected = buttons.filter(button => button.getAttribute('aria-pressed') === 'true').map(button => button.dataset.tag);
    const includePC = !pcFilter || pcFilter.getAttribute('aria-pressed') === 'true';
    toggleAll.textContent = selected.length === buttons.length && includePC ? '全てOFF' : '全てON';
    const visible = items.filter(item => item.tags.some(tag => selected.includes(tag)) && (includePC || !item.tags.includes('PC推奨')));
    document.getElementById('result-count').textContent = `${visible.length} / ${items.length} 件の作品`;
    list.innerHTML = visible.length ? visible.map(item => `<article class="detail-card detail-app-card catalog-card${item.catalogArtwork ? ' catalog-card--illustrated' : ''}">
      ${item.catalogArtwork ? `<div class="catalog-artwork" aria-hidden="true"><img src="../${escape(item.catalogArtwork)}" alt="" loading="lazy" width="1200" height="800" /></div>` : ''}
      ${item.catalogIcon && item.catalogArtwork ? `<div class="catalog-image-icon catalog-image-icon--${escape(item.catalogIcon)}" aria-hidden="true"><img src="../${escape(item.catalogArtwork)}" alt="" width="1200" height="800" /></div>` : item.image ? `<img src="${/^(?:https?:|data:)/.test(item.image) ? escape(item.image) : `../${escape(item.image)}`}" alt="" width="92" height="92" />` : `<div class="gacha-app-icon" aria-hidden="true">${escape(item.symbol || '✦')}</div>`}
      <div class="catalog-copy"><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p>${item.url ? `<a class="button primary" href="../${escape(item.url)}">${escape(item.actionLabel || '詳しく見る')} <span aria-hidden="true">→</span></a>` : `<button class="button" disabled>${escape(item.status || '公開準備中')}</button>`}</div>
      <ul class="tag-list catalog-tags">${item.tags.map(tag => `<li>${escape(tag)}</li>`).join('')}</ul>
    </article>`).join('') : `<div class="catalog-empty"><span class="empty-spark" aria-hidden="true">✦</span><p class="eyebrow">${items.length ? 'No matches' : 'Coming soon'}</p><h2>${!selected.length ? 'タグをONにして、作品を探そう。' : items.length ? 'このタグの作品は、まだありません。' : '次の楽しみを、ここから。'}</h2><p>${!selected.length ? 'ゲーム・ツールから、気になるタグを選んでください。' : items.length ? '別のタグをONにすると、公開中の作品が表示されます。' : '作品の公開準備が整い次第、このページでお知らせします。'}</p></div>`;
    reserveListSpace();
  };
  filterButtons.forEach(button => button.addEventListener('click', () => {
    button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    render();
  }));
  toggleAll.addEventListener('click', () => {
    const allSelected = filterButtons.every(button => button.getAttribute('aria-pressed') === 'true');
    filterButtons.forEach(button => button.setAttribute('aria-pressed', String(!allSelected)));
    render();
  });
  document.getElementById('year').textContent = new Date().getFullYear();
  render();
})();
