export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const clamp = (value,min=0,max=1) => Math.max(min,Math.min(max,value));
export const wrap = (value,length) => ((value%length)+length)%length;
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export function assetURL(value) {
  if(!value)return '';
  const url=String(value);
  return (/^\/(?!\/)/.test(url)||/^https?:\/\//.test(url)) ? url : '';
}
export function routeFor(work) { return `/works/${encodeURIComponent(work.category)}/${encodeURIComponent(work.id)}`; }
export const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" stroke="currentColor" stroke-width="1.4"/></svg>';
