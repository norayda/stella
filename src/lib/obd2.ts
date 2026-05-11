// ELM327 BLE profiles — tried in order until one succeeds
const PROFILES = [
  {
    // iOS-Vlink / Viecar (most common cheap adapters)
    service: 'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
    write:   'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
    notify:  'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
  },
  {
    // Nordic UART Service (some ELM327 clones)
    service: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    write:   '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
    notify:  '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
  },
  {
    // Generic FFF0 (older ELM327 clones)
    service: '0000fff0-0000-1000-8000-00805f9b34fb',
    write:   '0000fff2-0000-1000-8000-00805f9b34fb',
    notify:  '0000fff1-0000-1000-8000-00805f9b34fb',
  },
];

export type OBD2Data = {
  rpm:         number | null;
  speed:       number | null;
  coolantTemp: number | null;
  engineLoad:  number | null;
  intakeTemp:  number | null;
  throttle:    number | null;
  fuelLevel:   number | null;
  voltage:     number | null;
};

export type BLEStatus =
  | 'disconnected'
  | 'scanning'
  | 'connecting'
  | 'initializing'
  | 'connected'
  | 'error';

function parseOBD2(pid: string, raw: string): number | null {
  const clean = raw.replace(/[\r\n\s]/g, '').toUpperCase();
  const pidHex = pid.substring(2).toUpperCase();
  const prefix = '41' + pidHex;
  const idx = clean.indexOf(prefix);
  if (idx === -1) return null;

  const bytes = (clean.substring(idx + prefix.length).match(/.{1,2}/g) ?? [])
    .map(b => parseInt(b, 16));

  switch (pidHex) {
    case '0C': return bytes.length >= 2 ? (bytes[0] * 256 + bytes[1]) / 4 : null;
    case '0D': return bytes.length >= 1 ? bytes[0] : null;
    case '05': return bytes.length >= 1 ? bytes[0] - 40 : null;
    case '04': return bytes.length >= 1 ? Math.round(bytes[0] * 100 / 255) : null;
    case '0F': return bytes.length >= 1 ? bytes[0] - 40 : null;
    case '11': return bytes.length >= 1 ? Math.round(bytes[0] * 100 / 255) : null;
    case '2F': return bytes.length >= 1 ? Math.round(bytes[0] * 100 / 255) : null;
    default:   return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BT = any;

const FAIL_THRESHOLD = 3;

export class OBD2Client {
  private device:    BT = null;
  private writeChar: BT = null;
  private buffer = '';
  private pendingResolve: ((v: string) => void) | null = null;

  // Track consecutive null responses per PID; skip after FAIL_THRESHOLD misses
  private failCounts = new Map<string, number>();
  private skipped    = new Set<string>();
  private voltageFailCount = 0;
  private voltageSkipped   = false;

  onStatus?: (s: BLEStatus) => void;
  onError?:  (msg: string) => void;

  private emit(s: BLEStatus) { this.onStatus?.(s); }

  /** Returns true if the PID (or 'ATRV') has been permanently skipped. */
  isSkipped(pid: string): boolean {
    if (pid === 'ATRV') return this.voltageSkipped;
    return this.skipped.has(pid);
  }

  async connect(): Promise<void> {
    const nav = navigator as BT;
    if (!nav.bluetooth) {
      throw new Error('Web Bluetooth non supporté. Utilise Chrome sur PC ou Android.');
    }

    // Reset skip tracking on every new connection
    this.failCounts.clear();
    this.skipped.clear();
    this.voltageFailCount = 0;
    this.voltageSkipped   = false;

    this.emit('scanning');

    this.device = await nav.bluetooth.requestDevice({
      filters: [
        { namePrefix: 'IOS-Vlink' },
        { namePrefix: 'OBDII' },
        { namePrefix: 'OBD' },
        { namePrefix: 'ELM327' },
        { namePrefix: 'Viecar' },
        { namePrefix: 'ELM' },
        { namePrefix: 'Link' },
      ],
      optionalServices: PROFILES.map(p => p.service),
    });

    this.emit('connecting');
    const server = await this.device.gatt.connect();

    let writeChar: BT = null;
    let notifyChar: BT = null;

    for (const profile of PROFILES) {
      try {
        const svc = await server.getPrimaryService(profile.service);
        writeChar  = await svc.getCharacteristic(profile.write);
        notifyChar = await svc.getCharacteristic(profile.notify);
        break;
      } catch {
        continue;
      }
    }

    if (!writeChar || !notifyChar) {
      throw new Error('Profil OBD2 non reconnu sur cet adaptateur.');
    }

    this.writeChar = writeChar;

    await notifyChar.startNotifications();
    notifyChar.addEventListener('characteristicvaluechanged', (e: BT) => {
      this.buffer += new TextDecoder().decode(e.target.value as DataView);
      if (this.buffer.includes('>') && this.pendingResolve) {
        const res = this.buffer;
        this.buffer = '';
        this.pendingResolve(res);
        this.pendingResolve = null;
      }
    });

    this.emit('initializing');

    for (const cmd of ['ATZ', 'ATE0', 'ATL0', 'ATH0', 'ATSP0']) {
      await this.send(cmd, cmd === 'ATZ' ? 2500 : 800);
    }

    this.emit('connected');
  }

  private send(command: string, timeoutMs = 1200): Promise<string> {
    return new Promise(resolve => {
      const timer = window.setTimeout(() => {
        this.pendingResolve = null;
        resolve('');
      }, timeoutMs);

      this.pendingResolve = v => {
        clearTimeout(timer);
        resolve(v);
      };

      const data = new TextEncoder().encode(command + '\r');
      (this.writeChar as BT).writeValue(data).catch(() => resolve(''));
    });
  }

  async readPID(pid: string): Promise<number | null> {
    if (!this.writeChar) return null;
    // Skip permanently unsupported PIDs to avoid infinite null polls
    if (this.skipped.has(pid)) return null;
    try {
      const val = parseOBD2(pid, await this.send(pid, 1500));
      if (val === null) {
        const count = (this.failCounts.get(pid) ?? 0) + 1;
        this.failCounts.set(pid, count);
        if (count >= FAIL_THRESHOLD) this.skipped.add(pid);
      } else {
        this.failCounts.set(pid, 0);
      }
      return val;
    } catch {
      return null;
    }
  }

  async readVoltage(): Promise<number | null> {
    if (this.voltageSkipped) return null;
    try {
      const raw = await this.send('ATRV', 800);
      const m = raw.match(/(\d+\.?\d*)V/i);
      const val = m ? parseFloat(m[1]) : null;
      if (val === null) {
        this.voltageFailCount++;
        if (this.voltageFailCount >= FAIL_THRESHOLD) this.voltageSkipped = true;
      } else {
        this.voltageFailCount = 0;
      }
      return val;
    } catch {
      return null;
    }
  }

  async readAll(): Promise<OBD2Data> {
    return {
      rpm:         await this.readPID('010C'),
      speed:       await this.readPID('010D'),
      coolantTemp: await this.readPID('0105'),
      engineLoad:  await this.readPID('0104'),
      intakeTemp:  await this.readPID('010F'),
      throttle:    await this.readPID('0111'),
      fuelLevel:   await this.readPID('012F'),
      voltage:     await this.readVoltage(),
    };
  }

  disconnect(): void {
    try { this.device?.gatt?.disconnect(); } catch { /* noop */ }
    this.device    = null;
    this.writeChar = null;
    this.emit('disconnected');
  }
}
