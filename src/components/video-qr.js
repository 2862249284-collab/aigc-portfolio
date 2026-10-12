import qrcode from '../../vendor/qrcode/qrcode.js';
import { escapeHTML as e } from '../lib/dom.js';
import { uniqueBilibiliURL } from '../lib/bilibili.js';

export function qrSVG(url) {
  const qr = qrcode(0, 'M');
  qr.addData(url, 'Byte'); qr.make();
  return qr.createSvgTag({ cellSize: 8, margin: 32, scalable: true });
}

export function videoQRMarkup(work, works) {
  if (work.mediaType !== 'video') return '';
  const url = uniqueBilibiliURL(work, works);
  if (!url) return `<p class="qr-unavailable">${work.bilibili ? 'B站链接格式错误或与其他作品重复，请检查配置。' : 'B站观看链接尚未配置'}</p>`;
  return `<div class="video-qr" data-video-qr data-url="${e(url)}" data-title="${e(work.title)}">
    <button class="qr-trigger" type="button" aria-expanded="false" aria-controls="video-qr-panel" aria-label="展开${e(work.title)}的观看二维码"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM20 14v4h-3v3M21 21h-1M12 3v8H3M12 14v7"/></svg><span>扫码观看</span></button>
    <section class="qr-panel" id="video-qr-panel" aria-label="作品观看二维码" inert>
      <div class="qr-heading"><strong>${e(work.title)}</strong><button type="button" data-qr-close aria-label="关闭二维码">×</button></div>
      <div class="qr-image" role="img" aria-label="${e(work.title)}的B站视频二维码">${qrSVG(url)}</div>
      <p>扫码观看完整作品</p><a class="qr-watch" href="${e(url)}" target="_blank" rel="noopener noreferrer">前往B站观看 ↗</a>
      <div class="qr-downloads"><button type="button" data-qr-download="png">下载高清 PNG</button><button type="button" data-qr-download="svg">下载 SVG</button></div><small data-qr-status role="status"></small>
    </section></div>`;
}

export function mountVideoQR(root) {
  const controller = new AbortController(), { signal } = controller;
  const objectURLs = new Set();
  root.querySelectorAll('[data-video-qr]').forEach(host => {
    const trigger = host.querySelector('.qr-trigger'), panel = host.querySelector('.qr-panel');
    let pinned = false;
    const show = open => { host.classList.toggle('is-open', open); trigger.setAttribute('aria-expanded', String(open)); panel.inert = !open; };
    const close = () => { pinned = false; show(false); };
    host.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') show(true); }, { signal });
    host.addEventListener('pointerleave', () => { if (!pinned && !host.contains(document.activeElement)) show(false); }, { signal });
    trigger.addEventListener('click', () => { pinned = !pinned; show(pinned); }, { signal });
    host.addEventListener('focusout', event => { if (!host.contains(event.relatedTarget)) close(); }, { signal });
    host.querySelector('[data-qr-close]').addEventListener('click', () => { close(); trigger.focus(); }, { signal });
    document.addEventListener('pointerdown', event => { if (!host.contains(event.target)) close(); }, { signal });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && host.classList.contains('is-open')) { close(); trigger.focus(); } }, { signal });
    host.querySelectorAll('[data-qr-download]').forEach(button => button.addEventListener('click', async () => {
      const status = host.querySelector('[data-qr-status]');
      try {
        const format = button.dataset.qrDownload;
        let blob = new Blob([qrSVG(host.dataset.url)], { type: 'image/svg+xml' });
        if (format === 'png') {
          const image = new Image(), url = URL.createObjectURL(blob); objectURLs.add(url);
          try {
            await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
            const canvas = document.createElement('canvas'); canvas.width = canvas.height = 2048;
            const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 2048, 2048); ctx.drawImage(image, 0, 0, 2048, 2048);
            blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error('PNG encoding failed');
          } finally { URL.revokeObjectURL(url); objectURLs.delete(url); }
        }
        if (signal.aborted) return;
        const url = URL.createObjectURL(blob); objectURLs.add(url);
        const link = document.createElement('a'); link.href = url; link.download = `${host.dataset.title.replace(/[\\/:*?"<>|]/g, '-')}-B站二维码.${format}`;
        document.body.append(link); link.click(); link.remove();
        status.textContent = '已开始下载';
      } catch { status.textContent = '下载失败，请重试或使用另一种格式。'; }
    }, { signal }));
  });
  return () => { controller.abort(); objectURLs.forEach(url => URL.revokeObjectURL(url)); };
}
