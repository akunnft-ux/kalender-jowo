/* Utilitas DOM — ringan, tanpa dependensi */

/** Buat elemen: h('tag', {attr}, child1, child2, ...) */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') {
      el.className = v;
    } else if (k === 'innerText' || k === 'textContent') {
      el.textContent = v;
    } else if (k.startsWith('on') && typeof v === 'function') {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    } else {
      el.setAttribute(k, v);
    }
  }
  for (const child of children) {
    if (child === null || child === undefined) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else if (Array.isArray(child)) {
      child.forEach((c) => el.appendChild(c));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  }
  return el;
}

export function qs(sel, root = document) {
  return root.querySelector(sel);
}

export function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

export function on(el, ev, cb) {
  el.addEventListener(ev, cb);
  return { remove: () => el.removeEventListener(ev, cb) };
}

export function delegate(root, sel, ev, cb) {
  return on(root, ev, (e) => {
    let target = e.target;
    while (target && target !== root) {
      if (target.matches(sel)) {
        cb.call(target, e);
        return;
      }
      target = target.parentElement;
    }
  });
}

export function escapeHtml(teks) {
  const div = document.createElement('div');
  div.textContent = teks;
  return div.innerHTML;
}

export function hapusIsi(el) {
  el.innerHTML = '';
}
