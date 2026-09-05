import { EventBus } from './EventBus.js';
import { GameState } from './GameState.js';
import { TimeSystem } from './TimeSystem.js';
import { RNG } from './RNG.js';

import { FacilitySystem, GRID_SIZE } from '../systems/FacilitySystem.js';
import { CorridorSystem } from '../systems/CorridorSystem.js';
import { HusbandrySystem } from '../systems/HusbandrySystem.js';
import { WelfareSystem } from '../systems/WelfareSystem.js';
import { BreedingSystem } from '../systems/BreedingSystem.js';
import { StaffSystem } from '../systems/StaffSystem.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { BiosecuritySystem } from '../systems/BiosecuritySystem.js';
import { DiseaseSystem } from '../systems/DiseaseSystem.js';
import { ResearchSystem } from '../systems/ResearchSystem.js';
import { EthicsSystem } from '../systems/EthicsSystem.js';
import { CertificationSystem } from '../systems/CertificationSystem.js';
import { GeneticsSystem } from '../systems/GeneticsSystem.js';
import { EventSystem } from '../systems/EventSystem.js';
import { ScoringSystem } from '../systems/ScoringSystem.js';
import { ReportSystem } from '../systems/ReportSystem.js';

export const END_DAY = 720; // 2 oyun yılı

/**
 * Oyunun çekirdeği: tüm sistemleri kurar ve günlük döngüyü yönetir.
 * UI ve 3B katmanı bu sınıfa bağlanır; sistemler UI'dan bağımsızdır.
 */
export class Game {
  constructor({ seed = 20240101 } = {}) {
    this.bus = new EventBus();
    this.state = new GameState();
    this.rng = new RNG(seed);
    this.time = new TimeSystem(this.bus, this.state, { baseDayDuration: 4 });
    this.gridSize = GRID_SIZE;

    const bus = this.bus; const st = this.state; const rng = this.rng;

    const facility = new FacilitySystem(bus, st, rng);
    const corridors = new CorridorSystem(bus, st);
    const husbandry = new HusbandrySystem(bus, st, rng);
    const welfare = new WelfareSystem(bus, st, husbandry);
    const breeding = new BreedingSystem(bus, st, rng);
    const staff = new StaffSystem(bus, st, rng);
    const economy = new EconomySystem(bus, st);
    const biosecurity = new BiosecuritySystem(bus, st, rng);
    biosecurity.corridors = corridors;
    const disease = new DiseaseSystem(bus, st, rng, biosecurity);
    const research = new ResearchSystem(bus, st, rng);
    const ethics = new EthicsSystem(bus, st);
    const certification = new CertificationSystem(bus, st, rng);
    const genetics = new GeneticsSystem(bus, st, rng);
    const scoring = new ScoringSystem(st);
    const report = new ReportSystem(bus, st);
    const events = new EventSystem(bus, st, rng, { economy, disease, biosecurity });

    this.systems = {
      facility, corridors, husbandry, welfare, breeding, staff, economy, biosecurity,
      disease, research, ethics, certification, genetics, events, scoring, report
    };

    this.bus.on('time:day', () => this.onDay());
    this.bus.on('time:week', () => this.onWeek());
    this.bus.on('time:month', () => this.onMonth());
    this.bus.on('economy:bankrupt', () => this.endGame('Tesis mali olarak sürdürülemez hâle geldi.'));
  }

  /** Günlük simülasyon sırası — bağımlılık yönüne göre sabittir. */
  onDay() {
    const s = this.systems;
    s.facility.dailyTick();      // iklimlendirme
    s.husbandry.dailyTick();     // besleme, temizlik, zenginleştirme
    s.staff.dailyTick();         // yorgunluk, moral
    s.welfare.dailyTick();       // refah, sağlık, yaşlanma
    s.breeding.dailyTick();      // gebelik, doğum, ölüm
    s.disease.checkClosedRooms();
    s.disease.dailyTick();
    s.biosecurity.dailyTick();
    s.genetics.dailyTick();
    s.ethics.dailyTick();
    s.research.dailyTick();
    s.certification.dailyTick();
    s.economy.dailyTick();
    s.events.dailyTick();
    s.scoring.dailyTick();
    s.report.dailyTick();

    if (this.state.day >= END_DAY && !this.state.gameOver) {
      this.endGame('İki oyun yılı tamamlandı. Dönem değerlendirmesi:');
    }
  }

  onWeek() {
    this.systems.economy.weeklyTick();
    this.systems.report.weeklyTick();
  }

  onMonth() {
    this.systems.staff.monthlyTick();
    this.systems.report.monthlyTick();
  }

  endGame(reason) {
    if (this.state.gameOver) return;
    this.state.gameOver = true;
    this.time.pause();
    this.bus.emit('game:over', { reason, report: this.systems.scoring.finalReport() });
  }

  /** Yeni oyuncuya küçük bir başlangıç: arsa ve bir miktar nakit hazır. */
  bootstrap() {
    this.state.addLog('Arsa satın alındı. İnşaata başlayabilirsiniz.', 'good');
  }
}
