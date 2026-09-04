import { el } from '../dom.js';
import { KNOWLEDGE, SOURCE_LABELS } from '../../data/knowledge.js';

/**
 * Bilgi bankası — tüm eğitim kartları, kaynak etiketleriyle birlikte.
 */
export function guideScreen() {
  const wrap = el('div');

  wrap.append(el('div', { class: 'knowledge' }, [
    el('strong', { text: 'Kaynak Kullanımı Hakkında' }),
    el('p', { text:
      'Bu simülasyonun eğitim içeriği "LABORATUVAR HAYVANLARINI YETİŞTİRME VE SAĞLIĞI" ' +
      'kaynak kitabına dayandırılmak üzere tasarlanmıştır. Kitap dosyası depoya henüz ' +
      'eklenmediği için hiçbir cümle doğrudan kitaba atfedilmemiştir. Aşağıdaki kartlar ' +
      'kaynak etiketleriyle ayrılmıştır: "Genel bilgi" kartları kitapla doğrulanmalı, ' +
      '"Oyun tasarımı kararı" kartları ise bilimsel iddia içermez.' }),
    el('span', { class: 'src', text: 'Ayrıntı için depodaki docs/KAYNAK.md dosyasına bakın.' })
  ]));

  const groups = { general: [], game: [], book: [] };
  for (const k of Object.values(KNOWLEDGE)) groups[k.source].push(k);

  const titles = {
    book: 'Kaynak Kitaptan Alınan İçerik',
    general: 'Genel Bilgi (kaynak kitapla doğrulanmalı)',
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
        el('span', { class: 'src', text: `Kaynak: ${SOURCE_LABELS[k.source]}` })
      ]));
    }
  }

  return wrap;
}
