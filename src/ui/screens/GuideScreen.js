import { el } from '../dom.js';
import { KNOWLEDGE, SOURCE_LABELS, BOOK } from '../../data/knowledge.js';

/**
 * Bilgi bankası — tüm eğitim kartları, kaynak etiketleriyle birlikte.
 */
export function guideScreen() {
  const wrap = el('div');

  wrap.append(el('div', { class: 'knowledge' }, [
    el('strong', { text: 'Kaynak Kitap' }),
    el('p', { text:
      `${BOOK.title}. ${BOOK.editor}. ${BOOK.publisher}. ` +
      `E-ISBN ${BOOK.isbn}, ${BOOK.year}.` }),
    el('p', { text:
      'Aşağıdaki kartların büyük bölümü doğrudan bu kitaptan üretilmiştir ve her birinin ' +
      'yanında bölüm/sayfa referansı verilmiştir. "Kitapta yer almayan genel bilgi" ve ' +
      '"Oyun tasarımı kararı" etiketli kartlar kitaba atfedilmez.' }),
    el('span', { class: 'src', text: 'Ayrıntı için depodaki docs/KAYNAK.md dosyasına bakın.' })
  ]));

  const groups = { general: [], game: [], book: [] };
  for (const k of Object.values(KNOWLEDGE)) groups[k.source].push(k);

  const titles = {
    book: 'Kaynak Kitaptan Alınan İçerik',
    general: 'Kitapta Yer Almayan Genel Bilgi',
    game: 'Oyun Tasarımı Kararları'
  };

  for (const key of ['book', 'general', 'game']) {
    const items = groups[key];
    wrap.append(el('h3', { text: `${titles[key]} (${items.length})` }));
    if (!items.length) {
      wrap.append(el('p', { class: 'hint', text: 'Bu kategoride kart yok.' }));
      continue;
    }
    for (const k of items) {
      wrap.append(el('div', { class: 'list-item' }, [
        el('h4', { text: k.title }),
        el('p', { text: k.text }),
        el('span', { class: 'src', text: k.ref
          ? `Kaynak: ${BOOK.title} — ${k.ref}`
          : SOURCE_LABELS[k.source] })
      ]));
    }
  }

  return wrap;
}
