const state = { selectedId: modules[0].id, query: '', filter: 'all' };

const moduleFilter = document.querySelector('#moduleFilter');
const searchInput = document.querySelector('#searchInput');
const resetBtn = document.querySelector('#resetBtn');
const overviewGrid = document.querySelector('#overviewGrid');
const moduleNav = document.querySelector('#moduleNav');
const moduleDetails = document.querySelector('#moduleDetails');

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function moduleMatches(module) {
  const haystack = [module.title, module.theme, module.page, ...Object.values(module.outline), ...module.focus, ...module.difficulty, ...module.grammar, ...module.words.flat(), ...module.exercises, ...module.writing.analysis, ...module.writing.exercises].join(' ').toLowerCase();
  const matchesQuery = !state.query || haystack.includes(state.query.toLowerCase());
  const matchesFilter = state.filter === 'all' || module.id === state.filter;
  return matchesQuery && matchesFilter;
}

function renderFilters() {
  moduleFilter.insertAdjacentHTML('beforeend', modules.map(module => `<option value="${module.id}">${module.title}</option>`).join(''));
}

function renderOverview(visibleModules) {
  overviewGrid.innerHTML = visibleModules.map(module => `
    <button class="overview-card" type="button" data-select="${module.id}">
      <h3>${escapeHtml(module.title)}</h3>
      <p>${escapeHtml(module.theme)}</p>
    </button>
  `).join('') || '<p class="no-results">没有匹配的模块，请更换关键词。</p>';
}

function renderNav(visibleModules) {
  moduleNav.innerHTML = visibleModules.map(module => `
    <button class="nav-btn ${module.id === state.selectedId ? 'active' : ''}" type="button" data-select="${module.id}">
      ${escapeHtml(module.title)} <span class="page-tag">${escapeHtml(module.page)}</span><br><small>${escapeHtml(module.theme)}</small>
    </button>
  `).join('');
}

function list(items) {
  return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderModule(module) {
  return `
    <article>
      <div class="module-head">
        <span class="badge">${escapeHtml(module.id.toUpperCase())}</span>
        <h2>${escapeHtml(module.title)}</h2>
      </div>
      <p><strong>主题：</strong>${escapeHtml(module.theme)}</p>
      <section class="panel outline-panel">
        <h4>教材大纲定位</h4>
        <dl class="outline-list">
          <dt>Understanding ideas · Reading</dt><dd>${escapeHtml(module.outline.understanding)}</dd>
          <dt>Understanding ideas · Grammar</dt><dd>${escapeHtml(module.outline.grammar)}</dd>
          <dt>Developing ideas · Listening and speaking</dt><dd>${escapeHtml(module.outline.listening)}</dd>
          <dt>Developing ideas · Reading for writing</dt><dd>${escapeHtml(module.outline.writing)}</dd>
          <dt>Presenting ideas</dt><dd>${escapeHtml(module.outline.presenting)}</dd>
        </dl>
      </section>
      <div class="section-grid">
        <section class="panel"><h4>教学重点</h4>${list(module.focus)}</section>
        <section class="panel"><h4>教学难点</h4>${list(module.difficulty)}</section>
        <section class="panel"><h4>语法点与语法习题</h4>${list(module.grammar)}</section>
      </div>
      <section class="panel">
        <h4>生词表：中英释义 + 音标 + 例句</h4>
        <table class="word-table">
          <thead><tr><th>单词/短语</th><th>音标</th><th>释义</th><th>原创例句</th></tr></thead>
          <tbody>${module.words.map(([word, phonetic, meaning, example]) => `
            <tr><td><strong>${escapeHtml(word)}</strong></td><td>${escapeHtml(phonetic)}</td><td>${escapeHtml(meaning)}</td><td>${escapeHtml(example)}</td></tr>
          `).join('')}</tbody>
        </table>
      </section>
      <section class="panel">
        <h4>基础与综合习题</h4>
        ${module.exercises.map((exercise, index) => `<div class="exercise"><strong>${index + 1}.</strong> ${escapeHtml(exercise)}<br><span class="answer">参考答案：</span>${escapeHtml(module.answers[index])}</div>`).join('')}
      </section>
      <section class="panel writing-panel">
        <h4>作文解析与习题</h4>
        <h5>写作解析</h5>${list(module.writing.analysis)}
        <h5>写作习题</h5>${list(module.writing.exercises)}
        <div class="exercise"><strong>示范表达：</strong>${escapeHtml(module.writing.sample)}</div>
      </section>
    </article>
  `;
}

function render() {
  const visibleModules = modules.filter(moduleMatches);
  if (!visibleModules.some(module => module.id === state.selectedId)) {
    state.selectedId = visibleModules[0]?.id || modules[0].id;
  }
  renderOverview(visibleModules);
  renderNav(visibleModules);
  const selected = modules.find(module => module.id === state.selectedId);
  moduleDetails.innerHTML = visibleModules.length ? renderModule(selected) : '<article class="no-results">没有可展示内容。</article>';
}

document.addEventListener('click', event => {
  const target = event.target.closest('[data-select]');
  if (!target) return;
  state.selectedId = target.dataset.select;
  render();
  moduleDetails.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

searchInput.addEventListener('input', event => { state.query = event.target.value.trim(); render(); });
moduleFilter.addEventListener('change', event => { state.filter = event.target.value; render(); });
resetBtn.addEventListener('click', () => { state.query = ''; state.filter = 'all'; searchInput.value = ''; moduleFilter.value = 'all'; render(); });

renderFilters();
render();
