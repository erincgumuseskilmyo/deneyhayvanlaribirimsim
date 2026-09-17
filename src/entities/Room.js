import { nextId } from '../core/RNG.js';
import { clamp } from '../core/utils.js';
import { getRoomType } from '../data/rooms.js';

export class Room {
  constructor({ type, x, z }) {
    const def = getRoomType(type);
    this.id = nextId('rm');
    this.type = type;
    this.x = x;               // grid sol-üst köşe
    this.z = z;
    this.w = def.size[0];
    this.d = def.size[1];
    this.name = def.name;

    // Çalışma anındaki fiziki koşullar (sistemler günceller)
    this.temperature = 22;
    this.humidity = 55;
    this.ventilation = 70;    // 0-100 etkinlik
    this.hygiene = 80;
    this.noise = 25;
    this.lightCycleOk = true;

    this.operational = true;      // arıza / kapatma durumunda false
    this.quarantined = false;
    this.diseaseLevel = 0;        // 0-100 hastalık baskısı
    this.assignedStaff = [];      // staff id
    this.species = null;          // odaya atanmış tür (hayvan odaları)
  }

  get def() { return getRoomType(this.type); }
  get area() { return this.w * this.d; }

  contains(gx, gz) {
    return gx >= this.x && gx < this.x + this.w && gz >= this.z && gz < this.z + this.d;
  }

  overlaps(other) {
    return !(
      this.x + this.w <= other.x || other.x + other.w <= this.x ||
      this.z + this.d <= other.z || other.z + other.d <= this.z
    );
  }

  /** Fiziki koşulların türe uygunluğu 0-1 */
  environmentScore(speciesData) {
    if (!speciesData) return 1;
    const [tMin, tMax] = speciesData.tempOptimum;
    const [hMin, hMax] = speciesData.humidityOptimum;
    const tempDev = this.temperature < tMin ? tMin - this.temperature
      : this.temperature > tMax ? this.temperature - tMax : 0;
    const humDev = this.humidity < hMin ? hMin - this.humidity
      : this.humidity > hMax ? this.humidity - hMax : 0;
    const tScore = clamp(100 - tempDev * 14, 0, 100) / 100;
    const hScore = clamp(100 - humDev * 3, 0, 100) / 100;
    const vScore = this.ventilation / 100;
    const nScore = clamp(100 - this.noise, 0, 100) / 100;
    return clamp(tScore * 0.35 + hScore * 0.2 + vScore * 0.3 + nScore * 0.15, 0, 1);
  }
}
