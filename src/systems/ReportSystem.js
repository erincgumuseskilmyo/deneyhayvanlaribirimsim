import { avg } from '../core/utils.js';

/**
 * GÜNLÜK / HAFTALIK / AYLIK RAPORLAR
 */
export class ReportSystem {
  constructor(bus, state) {
    this.bus = bus;
    this.state = state;
    this.daily = null;
    this.weekly = null;
    this.monthly = null;
  }

  snapshot() {
    const st = this.state;
    const animals = st.livingAnimals;
    return {
      day: st.day,
      money: Math.round(st.money),
      animals: animals.length,
      pregnant: animals.filter((a) => a.reproductiveStatus === 'pregnant').length,
      diseased: animals.filter((a) => a.diseased).length,
      welfare: Math.round(st.animalWelfare),
      biosecurity: Math.round(st.biosecurity),
      ethics: Math.round(st.ethics),
      reputation: Math.round(st.scientificReputation),
      morale: Math.round(st.staffMorale),
      hygiene: Math.round(st.hygiene),
      meanHealth: Math.round(avg(animals, (a) => a.health)),
      rooms: st.rooms.length,
      cages: st.cages.length,
      staff: st.staff.length,
      runningProjects: st.projects.filter((p) => p.status === 'running').length,
      pendingApplications: st.applications.length
    };
  }

  dailyTick() {
    const snap = this.snapshot();
    this.daily = snap;
    this.state.dailyHistory.push(snap);
    if (this.state.dailyHistory.length > 720) this.state.dailyHistory.shift();
  }

  periodSummary(days) {
    const st = this.state;
    const from = st.day - days;
    const entries = st.ledger.filter((l) => l.day > from);
    const income = entries.filter((e) => e.amount > 0);
    const expense = entries.filter((e) => e.amount < 0);

    const byType = {};
    for (const e of entries) {
      byType[e.type] = (byType[e.type] ?? 0) + e.amount;
    }

    const hist = st.dailyHistory.filter((h) => h.day > from);
    return {
      days,
      totalIncome: Math.round(income.reduce((s, e) => s + e.amount, 0)),
      totalExpense: Math.round(-expense.reduce((s, e) => s + e.amount, 0)),
      net: Math.round(entries.reduce((s, e) => s + e.amount, 0)),
      byType,
      avgWelfare: Math.round(avg(hist, (h) => h.welfare)),
      avgBiosecurity: Math.round(avg(hist, (h) => h.biosecurity)),
      animalDelta: hist.length ? hist[hist.length - 1].animals - hist[0].animals : 0
    };
  }

  weeklyTick() {
    this.weekly = this.periodSummary(7);
    this.bus.emit('report:weekly', this.weekly);
  }

  monthlyTick() {
    this.monthly = this.periodSummary(30);
    this.bus.emit('report:monthly', this.monthly);
  }
}
