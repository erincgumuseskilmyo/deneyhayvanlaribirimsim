import { clamp } from '../core/utils.js';

/**
 * RASTGELE OLAY SİSTEMİ
 * Olaylar tesis durumuna göre ağırlıklandırılır: kötü koşullar
 * kötü olayların olasılığını yükseltir.
 * Her olayın seçenekleri ana istatistikleri farklı biçimde etkiler.
 */
export class EventSystem {
  constructor(bus, state, rng, deps) {
    this.bus = bus;
    this.state = state;
    this.rng = rng;
    this.deps = deps; // { economy, disease, biosecurity }
    this.pending = null;
    this.cooldown = 0;
    this.history = [];
    this.definitions = this.buildDefinitions();
  }

  buildDefinitions() {
    return [
      {
        id: 'power_outage',
        title: 'Elektrik Kesintisi',
        text: 'Bölgesel elektrik kesintisi yaşanıyor. Havalandırma ve iklimlendirme etkilendi.',
        knowledge: 'environment',
        weight: (st) => 3 + (st.hasRoom('utility') ? -1.5 : 2),
        options: [
          {
            label: 'Jeneratör devreye al', cost: 15000,
            effects: { biosecurity: 2, animalWelfare: 1 },
            result: 'Jeneratör devreye alındı, oda koşulları korundu.'
          },
          {
            label: 'Kesinti geçene kadar bekle', cost: 0,
            effects: { animalWelfare: -9, biosecurity: -5, scientificReputation: -2 },
            result: 'Sıcaklık ve havalandırma dalgalandı; hayvanlarda stres arttı.'
          }
        ]
      },
      {
        id: 'ventilation_fault',
        title: 'Havalandırma Arızası',
        text: 'Hayvan odalarından birinin havalandırma ünitesi arızalandı.',
        knowledge: 'environment',
        weight: (st) => 2.5 + (st.staffOfRole('technician').length ? -1 : 1.5),
        options: [
          {
            label: 'Acil teknik servis çağır', cost: 22000,
            effects: { animalWelfare: 2, biosecurity: 3 },
            result: 'Ünite aynı gün onarıldı.'
          },
          {
            label: 'Kendi teknisyenimiz baksın', cost: 4000,
            effects: { animalWelfare: -2, staffMorale: -3 },
            result: 'Onarım gecikti ancak maliyet düşük kaldı.',
            requiresStaff: 'technician'
          },
          {
            label: 'Ertele', cost: 0,
            effects: { animalWelfare: -11, biosecurity: -7 },
            result: 'Hava kalitesi bozuldu; amonyak birikimi refahı düşürdü.'
          }
        ]
      },
      {
        id: 'water_cut',
        title: 'Su Kesintisi',
        text: 'Şebeke suyu kesildi. Otomatik sulama sistemi çalışmıyor.',
        knowledge: 'welfare_five',
        weight: () => 2,
        options: [
          {
            label: 'Tanker su tedarik et', cost: 9000,
            effects: { animalWelfare: 1 },
            result: 'Su ihtiyacı karşılandı.'
          },
          {
            label: 'Şişe suyla manuel sula', cost: 3000,
            effects: { staffMorale: -5, animalWelfare: -2 },
            result: 'Personel yoğun mesai yaptı; sulama aksadı.'
          },
          {
            label: 'Bekle', cost: 0,
            effects: { animalWelfare: -14, ethics: -6 },
            result: 'Hayvanlar susuz kaldı. Refah ciddi biçimde düştü.'
          }
        ]
      },
      {
        id: 'feed_price',
        title: 'Yem Fiyatlarında Artış',
        text: 'Tedarikçi yem fiyatlarını artırdı.',
        knowledge: null,
        weight: () => 2.5,
        options: [
          {
            label: 'Uzun vadeli sözleşme yap', cost: 30000,
            effects: {},
            apply: (sys) => { sys.deps.economy.foodPriceIndex = 1.0; },
            result: 'Fiyat sabitlendi; nakit çıkışı yüksek oldu.'
          },
          {
            label: 'Fiyat artışını kabul et', cost: 0,
            effects: {},
            apply: (sys) => { sys.deps.economy.foodPriceIndex = 1.45; },
            result: 'Günlük yem gideri arttı.'
          },
          {
            label: 'Daha ucuz yeme geç', cost: 0,
            effects: { animalWelfare: -7, scientificReputation: -3 },
            apply: (sys) => { sys.deps.economy.foodPriceIndex = 0.8; },
            result: 'Maliyet düştü ancak beslenme kalitesi ve veri güvenilirliği zarar gördü.'
          }
        ]
      },
      {
        id: 'staff_shortage',
        title: 'Personel Eksikliği',
        text: 'Bakıcı personelin bir bölümü hastalık nedeniyle işe gelemiyor.',
        knowledge: null,
        weight: (st) => 2 + (st.staffMorale < 45 ? 2 : 0),
        options: [
          {
            label: 'Fazla mesai ödemesi yap', cost: 12000,
            effects: { staffMorale: -2, animalWelfare: 1 },
            result: 'Bakım aksamadan sürdürüldü.'
          },
          {
            label: 'Geçici destek personeli al', cost: 20000,
            effects: { biosecurity: -4 },
            result: 'Bakım sürdü, ancak eğitimsiz personel biyogüvenlik riski oluşturdu.'
          },
          {
            label: 'Mevcut ekiple idare et', cost: 0,
            effects: { staffMorale: -10, animalWelfare: -6 },
            result: 'Ekip tükendi; günlük bakım aksadı.'
          }
        ]
      },
      {
        id: 'ethics_audit',
        title: 'Etik Denetim',
        text: 'Tesis, hayvan refahı ve kayıt sistemleri açısından denetleniyor.',
        knowledge: 'records',
        weight: (st) => (st.hadyekEstablished ? 2.5 : 0.5),
        options: [
          {
            label: 'Tüm kayıtları eksiksiz sun', cost: 5000,
            effects: {},
            dynamic: (st) => {
              const good = st.animalWelfare > 60 && st.ethics > 60;
              return good
                ? { effects: { ethics: 8, scientificReputation: 6 }, result: 'Denetim olumlu sonuçlandı.' }
                : { effects: { ethics: -8, scientificReputation: -6 }, result: 'Denetimde refah ve kayıt eksiklikleri tespit edildi.' };
            }
          },
          {
            label: 'Denetimi ertelemeyi talep et', cost: 0,
            effects: { ethics: -6, scientificReputation: -4 },
            result: 'Erteleme talebi kurum güvenilirliğini zedeledi.'
          }
        ]
      },
      {
        id: 'equipment_failure',
        title: 'Ekipman Arızası',
        text: 'Otoklav / yıkama ekipmanı arızalandı.',
        knowledge: 'hygiene',
        weight: (st) => 2 + (st.hasRoom('cleaning') ? 0 : 1),
        options: [
          { label: 'Onar', cost: 26000, effects: { biosecurity: 2 }, result: 'Ekipman onarıldı.' },
          {
            label: 'Dış hizmet al', cost: 14000,
            effects: { biosecurity: -3 },
            result: 'Ekipman dışarıda yıkandı; bariyer bir süre zayıfladı.'
          },
          {
            label: 'Şimdilik ertele', cost: 0,
            effects: { biosecurity: -9, animalWelfare: -4 },
            result: 'Hijyen düştü, bulaşma riski arttı.'
          }
        ]
      },
      {
        id: 'unexpected_death',
        title: 'Beklenmeyen Ölüm',
        text: 'Bir kafeste beklenmeyen hayvan kaybı bildirildi.',
        knowledge: 'welfare_five',
        weight: (st) => (st.animalWelfare < 55 ? 3 : 1),
        options: [
          {
            label: 'Nekropsi ve inceleme yap', cost: 11000,
            effects: { ethics: 5, scientificReputation: 3, biosecurity: 3 },
            result: 'Kayıp nedeni araştırıldı; kayıtlara işlendi.',
            requiresStaff: 'veterinarian'
          },
          {
            label: 'Kayda geç, işleme devam et', cost: 0,
            effects: { ethics: -4, scientificReputation: -2 },
            result: 'Neden araştırılmadı; benzer kayıplar tekrarlayabilir.'
          }
        ]
      },
      {
        id: 'welfare_alarm',
        title: 'Hayvan Refahı Alarmı',
        text: 'Bakıcı ekip, bazı kafeslerde davranış bozukluğu ve stres belirtileri bildirdi.',
        knowledge: 'enrichment',
        weight: (st) => (st.animalWelfare < 50 ? 4 : 0.6),
        options: [
          {
            label: 'Zenginleştirme programını genişlet', cost: 16000,
            effects: { animalWelfare: 8, ethics: 4 },
            apply: (sys) => { for (const c of sys.state.cages) c.enrichment = clamp(c.enrichment + 25); },
            result: 'Yuva malzemesi ve saklanma alanları eklendi; stres göstergeleri geriledi.'
          },
          {
            label: 'Kafes yoğunluğunu azalt', cost: 22000,
            effects: { animalWelfare: 6, biosecurity: 2 },
            result: 'Ek kafes alımıyla yoğunluk düşürüldü.'
          },
          {
            label: 'Şimdilik izle', cost: 0,
            effects: { animalWelfare: -5, ethics: -5 },
            result: 'Müdahale edilmedi; belirtiler derinleşti.'
          }
        ]
      },
      {
        id: 'researcher_visit',
        title: 'Araştırmacı Görüşmesi',
        text: 'Bir araştırma grubu tesisi ziyaret edip iş birliği görüşmesi yapmak istiyor.',
        knowledge: null,
        weight: (st) => 1.5 + st.scientificReputation / 50,
        options: [
          {
            label: 'Tesis turu düzenle', cost: 4000,
            effects: { scientificReputation: 5, biosecurity: -2 },
            result: 'İş birliği ilgisi arttı; ziyaret bariyeri bir miktar zorladı.'
          },
          {
            label: 'Çevrimiçi sunum yap', cost: 1000,
            effects: { scientificReputation: 2 },
            result: 'Görüşme uzaktan tamamlandı; biyogüvenlik korundu.'
          },
          { label: 'Reddet', cost: 0, effects: { scientificReputation: -2 }, result: 'Görüşme yapılmadı.' }
        ]
      }
    ];
  }

  dailyTick() {
    if (this.pending) return;
    if (this.cooldown > 0) { this.cooldown -= 1; return; }
    const st = this.state;
    if (st.rooms.length < 2) return;

    // Günlük olay olasılığı: kötü tesis -> daha sık olay
    const risk = clamp(
      0.06 + (60 - st.animalWelfare) * 0.001 + (60 - st.biosecurity) * 0.001, 0.04, 0.22
    );
    if (!this.rng.chance(risk)) return;

    const entries = this.definitions
      .map((def) => ({ item: def, weight: def.weight(st) }))
      .filter((e) => e.weight > 0);
    const def = this.rng.weighted(entries);
    if (!def) return;
    this.trigger(def);
  }

  trigger(def) {
    const st = this.state;
    const options = def.options.map((o) => ({
      ...o,
      available:
        (!o.requiresStaff || st.staffOfRole(o.requiresStaff).length > 0) &&
        (o.cost === 0 || st.canAfford(o.cost))
    }));
    this.pending = { def, options };
    this.bus.emit('event:triggered', this.pending);
  }

  resolve(optionIndex) {
    if (!this.pending) return null;
    const { def, options } = this.pending;
    const opt = options[optionIndex];
    this.pending = null;
    this.cooldown = 6;
    if (!opt) return null;

    const st = this.state;
    if (opt.cost) st.spend(opt.cost, `Olay: ${def.title}`, 'event');

    let effects = opt.effects ?? {};
    let result = opt.result ?? '';
    if (opt.dynamic) {
      const d = opt.dynamic(st);
      effects = d.effects; result = d.result;
    }
    st.applyEffects(effects);
    if (opt.apply) opt.apply(this);

    this.history.push({ day: st.day, event: def.id, option: opt.label });
    st.addLog(`${def.title}: ${opt.label}`);
    return { def, option: opt, effects, result, knowledge: def.knowledge };
  }
}
