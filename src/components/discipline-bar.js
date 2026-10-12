import { categories } from '../data/categories.js';
import { escapeHTML as e } from '../lib/dom.js';

// Persistent discipline switcher shared by every work surface. It never returns
// home and never replays the opening sequence — links resolve through app.js.
export function disciplineBarMarkup(activeId){
  return `<nav class="discipline-bar" aria-label="作品分类切换">
    <div class="discipline-bar-track">
      <span class="discipline-bar-label micro" aria-hidden="true">DISCIPLINE</span>
      ${categories.map(category=>`<a class="discipline-link${category.id===activeId?' is-active':''}" data-route href="/works/${category.id}"${category.id===activeId?' aria-current="page"':''}><span>${e(category.name)}</span><small>${e(category.english.split(' ')[0])}</small></a>`).join('')}
    </div>
  </nav>`;
}
