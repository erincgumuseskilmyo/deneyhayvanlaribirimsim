/**
 * Oyun saati. Gerçek zamanlı değil: hız çarpanına göre gün ilerletir.
 * 1 oyun günü = baseDayDuration / speed saniye.
 */
export class TimeSystem {
  constructor(bus, state, { baseDayDuration = 4 } = {}) {
    this.bus = bus;
    this.state = state;
    this.baseDayDuration = baseDayDuration;
    this.speed = 1;          // 0 = duraklat
    this.accumulator = 0;
    this.speeds = [0, 1, 2, 4];
  }

  setSpeed(speed) {
    this.speed = speed;
    this.bus.emit('time:speedChanged', speed);
  }

  pause() { this.setSpeed(0); }
  isPaused() { return this.speed === 0; }

  /** Her kareden çağrılır. dt saniye. */
  update(dt) {
    if (this.speed === 0 || this.state.gameOver) return;
    this.accumulator += dt * this.speed;
    const dayLen = this.baseDayDuration;
    let guard = 0;
    while (this.accumulator >= dayLen && guard < 20) {
      this.accumulator -= dayLen;
      guard += 1;
      this.tickDay();
    }
  }

  /** Bir oyun gününü ilerletir; testlerden doğrudan çağrılabilir. */
  tickDay() {
    this.state.day += 1;
    const day = this.state.day;
    this.bus.emit('time:day', day);
    if (day % 7 === 0) this.bus.emit('time:week', day);
    if (day % 30 === 0) this.bus.emit('time:month', day);
  }
}
