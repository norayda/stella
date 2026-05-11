/**
 * @krisspy-file
 * @type page
 * @name "StellaVehicleHealth"
 * @title "STELLA — Santé Véhicule"
 * @description "Diagnostic véhicule en temps réel : mode simulation (données génériques) et mode OBD2 Live (Bluetooth BLE via iOS-VLink / ELM327)."
 * @routes ["/vehicle-health"]
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bluetooth, BluetoothOff, Activity, Thermometer,
  Gauge, Fuel, Zap, Wind, AlertTriangle, CheckCircle2, RefreshCw,
  FlaskConical, Radio,
} from 'lucide-react';
import { OBD2Client } from '../lib/obd2';
import type { OBD2Data, BLEStatus } from '../lib/obd2';

type Mode = 'simulation' | 'live';
type Lang = 'fr' | 'en';
type FuelCategory = 'electric' | 'hybrid' | 'ice';

function detectFuelCategory(fuel: string | undefined): FuelCategory {
  if (!fuel) return 'ice';
  const f = fuel.toLowerCase();
  if (f.includes('électrique') || f.includes('electrique') || f.includes('electric') || f.includes('ev') || f.includes('bev')) return 'electric';
  if (f.includes('hybride') || f.includes('hybrid') || f.includes('phev') || f.includes('hev') || f.includes('rechargeable')) return 'hybrid';
  return 'ice';
}

const I18N = {
  fr: {
    back: 'Retour',
    title: 'Santé véhicule',
    sim_tab: 'Simulation',
    live_tab: 'OBD2 Live',
    connect: 'Connecter le boîtier OBD2',
    disconnect: 'Déconnecter',
    retry: 'Réessayer',
    status_disconnected: 'Non connecté',
    status_scanning: 'Recherche Bluetooth…',
    status_connecting: 'Connexion en cours…',
    status_initializing: 'Initialisation ELM327…',
    status_connected: 'Connecté — lecture en cours',
    status_error: 'Erreur de connexion',
    ble_warning: 'Nécessite Chrome sur PC ou Android. Non supporté sur Safari / iOS.',
    rpm: 'Régime moteur',
    speed: 'Vitesse',
    coolant: 'Temp. liquide refroid.',
    load_ice: 'Charge moteur',
    load_ev: 'Puissance moteur',
    fuel: 'Carburant',
    voltage: 'Tension batterie',
    intake: 'Temp. admission',
    throttle: 'Accélérateur',
    unit_rpm: 'tr/min',
    unit_kmh: 'km/h',
    unit_c: '°C',
    unit_pct: '%',
    unit_v: 'V',
    alerts_title: 'Alertes',
    alert_overheat: 'Moteur en surchauffe',
    alert_fuel_low: 'Niveau carburant faible',
    alert_voltage_low: 'Tension batterie faible',
    alert_load_high: 'Charge moteur élevée',
    all_ok: 'Tous les systèmes sont nominaux',
    sim_note: 'Données simulées — illustre le fonctionnement de STELLA.',
    live_note: (car: string) => `Données OBD2 en temps réel — affichées pour ${car}`,
    reading: 'Lecture…',
    no_data: '—',
    not_detected: 'Non détecté',
  },
  en: {
    back: 'Back',
    title: 'Vehicle Health',
    sim_tab: 'Simulation',
    live_tab: 'OBD2 Live',
    connect: 'Connect OBD2 dongle',
    disconnect: 'Disconnect',
    retry: 'Retry',
    status_disconnected: 'Not connected',
    status_scanning: 'Searching Bluetooth…',
    status_connecting: 'Connecting…',
    status_initializing: 'Initializing ELM327…',
    status_connected: 'Connected — reading data',
    status_error: 'Connection error',
    ble_warning: 'Requires Chrome on PC or Android. Not supported on Safari / iOS.',
    rpm: 'Motor RPM',
    speed: 'Speed',
    coolant: 'Coolant temp.',
    load_ice: 'Engine load',
    load_ev: 'Motor power',
    fuel: 'Fuel level',
    voltage: 'Battery voltage',
    intake: 'Intake temp.',
    throttle: 'Throttle',
    unit_rpm: 'rpm',
    unit_kmh: 'km/h',
    unit_c: '°C',
    unit_pct: '%',
    unit_v: 'V',
    alerts_title: 'Alerts',
    alert_overheat: 'Engine overheating',
    alert_fuel_low: 'Low fuel level',
    alert_voltage_low: 'Low battery voltage',
    alert_load_high: 'High engine load',
    all_ok: 'All systems nominal',
    sim_note: 'Simulated data — shows how STELLA works.',
    live_note: (car: string) => `Real-time OBD2 data — displayed for ${car}`,
    reading: 'Reading…',
    no_data: '—',
    not_detected: 'Not detected',
  },
} as const;

const SIM_BASE: OBD2Data = {
  rpm: 820, speed: 0, coolantTemp: 87, engineLoad: 24,
  intakeTemp: 32, throttle: 9, fuelLevel: 68, voltage: 12.6,
};

function jitter(base: number, range: number): number {
  return Math.round((base + (Math.random() - 0.5) * range * 2) * 10) / 10;
}

function simTick(base: OBD2Data): OBD2Data {
  return {
    rpm:         Math.round(jitter(base.rpm ?? 820, 120)),
    speed:       0,
    coolantTemp: Math.round(jitter(base.coolantTemp ?? 87, 3)),
    engineLoad:  Math.round(jitter(base.engineLoad ?? 24, 8)),
    intakeTemp:  Math.round(jitter(base.intakeTemp ?? 32, 2)),
    throttle:    Math.round(jitter(base.throttle ?? 9, 4)),
    fuelLevel:   base.fuelLevel,
    voltage:     Math.round(jitter(base.voltage ?? 12.6, 0.15) * 100) / 100,
  };
}

function statusColor(status: BLEStatus): string {
  if (status === 'connected')    return '#10b981';
  if (status === 'error')        return '#ef4444';
  if (status === 'disconnected') return '#94a3b8';
  return '#f59e0b';
}

type MetricStatus = 'ok' | 'warn' | 'critical';

function metricStatus(key: keyof OBD2Data, val: number | null): MetricStatus {
  if (val === null) return 'ok';
  if (key === 'coolantTemp') return val > 110 ? 'critical' : val > 100 ? 'warn' : 'ok';
  if (key === 'fuelLevel')   return val < 10  ? 'critical' : val < 20  ? 'warn' : 'ok';
  if (key === 'voltage')     return val < 11  ? 'critical' : val < 11.8 ? 'warn' : 'ok';
  if (key === 'engineLoad')  return val > 90  ? 'critical' : val > 80  ? 'warn' : 'ok';
  return 'ok';
}

const STATUS_COLOR: Record<MetricStatus, string> = {
  ok: '#10b981', warn: '#f59e0b', critical: '#ef4444',
};

const obd2 = new OBD2Client();

type MetricDef = {
  key:      keyof OBD2Data;
  pid:      string; // OBD2 PID or 'ATRV' — used for isSkipped() check in live mode
  label:    string;
  unit:     string;
  icon:     React.ReactNode;
  dec?:     number;
  onlyFor?: FuelCategory[]; // if set, metric only shows for listed fuel categories
};

const StellaVehicleHealth: React.FC = () => {
  const navigate = useNavigate();
  const [lang] = useState<Lang>('fr');
  const [mode, setMode] = useState<Mode>('simulation');
  const [bleStatus, setBleStatus] = useState<BLEStatus>('disconnected');
  const [bleError, setBleError] = useState<string | null>(null);
  const [data, setData] = useState<OBD2Data>(SIM_BASE);
  const pollRef = useRef<number | null>(null);

  const t = I18N[lang];

  const vehicle = (() => {
    try {
      const raw = window.sessionStorage.getItem('stella:vehicle');
      if (raw) return JSON.parse(raw) as { brand?: string; model?: string; fuel?: string };
    } catch { /* noop */ }
    return { brand: 'Véhicule', model: '', fuel: '' };
  })();

  const vehicleName    = [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Véhicule';
  const fuelCategory   = detectFuelCategory(vehicle.fuel);
  const isElectric     = fuelCategory === 'electric';

  // Full metric definitions — some filtered by fuel category
  const allMetrics: MetricDef[] = [
    { key: 'rpm',         pid: '010C', label: t.rpm,                    unit: t.unit_rpm, icon: <Activity size={18} strokeWidth={2.5} />,    dec: 0 },
    { key: 'speed',       pid: '010D', label: t.speed,                  unit: t.unit_kmh, icon: <Gauge size={18} strokeWidth={2.5} />,        dec: 0 },
    { key: 'coolantTemp', pid: '0105', label: t.coolant,                unit: t.unit_c,   icon: <Thermometer size={18} strokeWidth={2.5} />,  dec: 0 },
    { key: 'engineLoad',  pid: '0104', label: isElectric ? t.load_ev : t.load_ice, unit: t.unit_pct, icon: <RefreshCw size={18} strokeWidth={2.5} />, dec: 0 },
    { key: 'fuelLevel',   pid: '012F', label: t.fuel,                   unit: t.unit_pct, icon: <Fuel size={18} strokeWidth={2.5} />,         dec: 0, onlyFor: ['ice', 'hybrid'] },
    { key: 'voltage',     pid: 'ATRV', label: t.voltage,                unit: t.unit_v,   icon: <Zap size={18} strokeWidth={2.5} />,          dec: 1 },
    { key: 'intakeTemp',  pid: '010F', label: t.intake,                 unit: t.unit_c,   icon: <Wind size={18} strokeWidth={2.5} />,         dec: 0, onlyFor: ['ice', 'hybrid'] },
    { key: 'throttle',    pid: '0111', label: t.throttle,               unit: t.unit_pct, icon: <Activity size={18} strokeWidth={2.5} />,    dec: 0 },
  ];

  const metrics = allMetrics.filter(m =>
    !m.onlyFor || m.onlyFor.includes(fuelCategory)
  );

  // Simulation ticker
  useEffect(() => {
    if (mode !== 'simulation') return;
    setData(SIM_BASE);
    const id = window.setInterval(() => setData(prev => simTick(prev)), 2000);
    return () => window.clearInterval(id);
  }, [mode]);

  const startPolling = useCallback(() => {
    const tick = async () => {
      const d = await obd2.readAll();
      setData(d);
    };
    tick();
    pollRef.current = window.setInterval(tick, 2500);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const handleConnect = useCallback(async () => {
    setBleError(null);
    obd2.onStatus = (s) => {
      setBleStatus(s);
      if (s === 'connected') startPolling();
    };
    try {
      await obd2.connect();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setBleStatus('error');
      setBleError(msg);
    }
  }, [startPolling]);

  const handleDisconnect = useCallback(() => {
    stopPolling();
    obd2.disconnect();
    setBleStatus('disconnected');
    setData(SIM_BASE);
  }, [stopPolling]);

  useEffect(() => {
    if (mode === 'simulation') {
      stopPolling();
      obd2.disconnect();
      setBleStatus('disconnected');
      setBleError(null);
    }
  }, [mode, stopPolling]);

  useEffect(() => () => { stopPolling(); obd2.disconnect(); }, [stopPolling]);

  // Build alerts — skip fuel alert for electric vehicles
  const alerts: string[] = [];
  if ((data.coolantTemp ?? 0) > 100) alerts.push(t.alert_overheat);
  if (!isElectric && (data.fuelLevel ?? 100) < 20) alerts.push(t.alert_fuel_low);
  if ((data.voltage ?? 14) < 11.8)   alerts.push(t.alert_voltage_low);
  if ((data.engineLoad ?? 0) > 80)   alerts.push(t.alert_load_high);

  const fmt = (v: number | null, dec = 0) =>
    v === null ? t.no_data : dec > 0 ? v.toFixed(dec) : String(Math.round(v));

  const isReading = mode === 'live' && bleStatus === 'connected';

  // Force re-render each poll cycle so isSkipped() reflects latest skip state
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (!isReading) return;
    const id = window.setInterval(() => forceUpdate(n => n + 1), 2500);
    return () => window.clearInterval(id);
  }, [isReading]);

  return (
    <>
      <style>{`
        .vh-root * { box-sizing: border-box; }
        .vh-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center;
          -webkit-font-smoothing: antialiased;
        }
        .vh-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 20px 20px 40px;
          display: flex; flex-direction: column; gap: 16px;
          position: relative; z-index: 1;
        }
        .vh-top {
          display: flex; align-items: center; gap: 12px;
        }
        .vh-back {
          display: inline-flex; align-items: center; gap: 6px;
          border: none; background: rgba(255,255,255,0.7);
          color: #1A1A2E; font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px; cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06); backdrop-filter: blur(8px);
          transition: background 150ms;
        }
        .vh-back:hover { background: #FFF; }
        .vh-car-banner {
          background: #FFF;
          border-radius: 16px;
          padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: 0 4px 16px rgba(26,26,46,0.07);
        }
        .vh-car-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #FF7A70, #6B4E9B);
          display: flex; align-items: center; justify-content: center;
          color: #FFF; flex-shrink: 0;
        }
        .vh-car-name { font-size: 16px; font-weight: 800; color: #1A1A2E; }
        .vh-car-sub  { font-size: 12px; font-weight: 500; color: #8A7A7A; margin-top: 1px; }
        .vh-mode-toggle {
          display: flex; gap: 0; background: rgba(255,255,255,0.7);
          border-radius: 50px; padding: 4px;
          border: 1.5px solid rgba(107,78,155,0.12);
          backdrop-filter: blur(8px);
        }
        .vh-mode-btn {
          flex: 1; border: none; cursor: pointer; font-family: inherit;
          font-size: 13px; font-weight: 700; padding: 9px 12px;
          border-radius: 50px; transition: all 200ms ease;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          background: transparent; color: #8A7A7A;
        }
        .vh-mode-btn.active {
          background: #FF7A70; color: #FFF;
          box-shadow: 0 4px 12px rgba(255,122,112,0.35);
        }
        .vh-ble-card {
          background: #FFF; border-radius: 16px; padding: 16px;
          box-shadow: 0 4px 16px rgba(26,26,46,0.07);
          display: flex; flex-direction: column; gap: 10px;
        }
        .vh-ble-row {
          display: flex; align-items: center; gap: 10px;
        }
        .vh-ble-dot {
          width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
          transition: background 300ms;
        }
        .vh-ble-status { font-size: 13px; font-weight: 600; color: #1A1A2E; flex: 1; }
        .vh-ble-btn {
          border: none; cursor: pointer; font-family: inherit;
          font-size: 13px; font-weight: 700; padding: 9px 18px;
          border-radius: 50px; transition: all 150ms;
          display: flex; align-items: center; gap: 6px;
        }
        .vh-ble-btn.connect    { background: #6B4E9B; color: #FFF; }
        .vh-ble-btn.connect:hover { background: #5a3f88; }
        .vh-ble-btn.disconnect { background: #FFE6E3; color: #E04A42; }
        .vh-ble-btn.disconnect:hover { background: #ffd0cb; }
        .vh-ble-btn:disabled   { opacity: 0.5; cursor: not-allowed; }
        .vh-ble-error {
          font-size: 12px; font-weight: 600; color: #E04A42;
          background: #FFE8E6; border-radius: 10px; padding: 8px 12px;
          line-height: 1.4;
        }
        .vh-ble-warning {
          font-size: 11px; font-weight: 500; color: #8A7A7A;
          display: flex; gap: 6px; align-items: flex-start;
        }
        .vh-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        .vh-metric {
          background: #FFF; border-radius: 14px; padding: 14px;
          box-shadow: 0 4px 14px rgba(26,26,46,0.06);
          display: flex; flex-direction: column; gap: 8px;
          transition: box-shadow 200ms, opacity 300ms;
        }
        .vh-metric.skipped { opacity: 0.45; }
        .vh-metric-head {
          display: flex; align-items: center; gap: 8px;
        }
        .vh-metric-icon {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          background: #FFE6E3; color: #FF7A70; flex-shrink: 0;
          transition: background 300ms;
        }
        .vh-metric-label { font-size: 11px; font-weight: 700; color: #8A7A7A; line-height: 1.3; }
        .vh-metric-value {
          font-size: 26px; font-weight: 900; letter-spacing: -0.5px;
          transition: color 300ms;
        }
        .vh-metric-unit { font-size: 12px; font-weight: 600; color: #B8ACAC; margin-left: 2px; }
        .vh-bar-track {
          height: 4px; background: rgba(26,26,46,0.07); border-radius: 4px; overflow: hidden;
        }
        .vh-bar-fill { height: 100%; border-radius: 4px; transition: width 600ms ease, background 300ms; }
        .vh-alerts {
          background: #FFF; border-radius: 16px; padding: 16px;
          box-shadow: 0 4px 16px rgba(26,26,46,0.06);
          display: flex; flex-direction: column; gap: 8px;
        }
        .vh-alerts-title { font-size: 13px; font-weight: 800; color: #1A1A2E; }
        .vh-alert-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 600; color: #E04A42;
          background: #FFE8E6; border-radius: 10px; padding: 8px 12px;
        }
        .vh-all-ok {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 600; color: #10b981;
        }
        .vh-note {
          font-size: 11.5px; font-weight: 500; color: #B8ACAC;
          text-align: center; padding: 0 8px;
        }
        @keyframes vh-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .vh-pulse { animation: vh-pulse 1.5s ease-in-out infinite; }
      `}</style>

      <div className="vh-root">
        <main className="vh-app">
          {/* Top bar */}
          <div className="vh-top">
            <button type="button" className="vh-back" onClick={() => navigate(-1)}>
              <ArrowLeft size={15} strokeWidth={2.5} />
              {t.back}
            </button>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1A2E' }}>{t.title}</span>
          </div>

          {/* Vehicle identity */}
          <div className="vh-car-banner">
            <div className="vh-car-icon">
              <Gauge size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="vh-car-name">{vehicleName}</div>
              <div className="vh-car-sub">
                {vehicle.fuel || 'Véhicule sélectionné'}
                {mode === 'live' && bleStatus === 'connected' && ' · OBD2 connecté'}
              </div>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="vh-mode-toggle">
            <button
              type="button"
              className={`vh-mode-btn ${mode === 'simulation' ? 'active' : ''}`}
              onClick={() => setMode('simulation')}
            >
              <FlaskConical size={14} strokeWidth={2.5} />
              {t.sim_tab}
            </button>
            <button
              type="button"
              className={`vh-mode-btn ${mode === 'live' ? 'active' : ''}`}
              onClick={() => setMode('live')}
            >
              <Radio size={14} strokeWidth={2.5} />
              {t.live_tab}
            </button>
          </div>

          {/* BLE connection card (live mode only) */}
          {mode === 'live' && (
            <div className="vh-ble-card">
              <div className="vh-ble-row">
                <div
                  className={`vh-ble-dot ${['scanning', 'connecting', 'initializing'].includes(bleStatus) ? 'vh-pulse' : ''}`}
                  style={{ background: statusColor(bleStatus) }}
                />
                <span className="vh-ble-status">
                  {t[`status_${bleStatus}` as keyof typeof t] as string}
                </span>
                {bleStatus === 'connected' ? (
                  <button type="button" className="vh-ble-btn disconnect" onClick={handleDisconnect}>
                    <BluetoothOff size={14} strokeWidth={2.5} />
                    {t.disconnect}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="vh-ble-btn connect"
                    onClick={handleConnect}
                    disabled={['scanning', 'connecting', 'initializing'].includes(bleStatus)}
                  >
                    {bleStatus === 'error' ? (
                      <><RefreshCw size={14} strokeWidth={2.5} />{t.retry}</>
                    ) : (
                      <><Bluetooth size={14} strokeWidth={2.5} />{t.connect}</>
                    )}
                  </button>
                )}
              </div>

              {bleError && <div className="vh-ble-error">{bleError}</div>}

              <div className="vh-ble-warning">
                <AlertTriangle size={12} strokeWidth={2.5} style={{ marginTop: 1, flexShrink: 0, color: '#f59e0b' }} />
                {t.ble_warning}
              </div>
            </div>
          )}

          {/* Metrics grid */}
          <div className="vh-grid">
            {metrics.map(m => {
              const val        = data[m.key];
              const skipped    = mode === 'live' && obd2.isSkipped(m.pid);
              const ms         = skipped ? 'ok' : metricStatus(m.key, val);
              const color      = skipped ? '#94a3b8' : STATUS_COLOR[ms];
              const hasBar     = !skipped && ['engineLoad', 'throttle', 'fuelLevel'].includes(m.key) && val !== null;
              const barPct     = hasBar ? Math.min(Math.max(val as number, 0), 100) : 0;
              const displayVal = skipped
                ? t.not_detected
                : isReading && val === null
                  ? t.reading
                  : fmt(val, m.dec ?? 0);

              return (
                <div key={m.key} className={`vh-metric${skipped ? ' skipped' : ''}`}>
                  <div className="vh-metric-head">
                    <div
                      className="vh-metric-icon"
                      style={{
                        background: skipped ? '#f1f5f9' : ms !== 'ok' ? '#FFE8E6' : '#F0FDF4',
                        color,
                      }}
                    >
                      {m.icon}
                    </div>
                    <span className="vh-metric-label">{m.label}</span>
                  </div>
                  <div>
                    <span className="vh-metric-value" style={{ color, fontSize: skipped ? 13 : undefined, fontWeight: skipped ? 600 : undefined }}>
                      {displayVal}
                    </span>
                    {!skipped && val !== null && (
                      <span className="vh-metric-unit">{m.unit}</span>
                    )}
                  </div>
                  {hasBar && (
                    <div className="vh-bar-track">
                      <div
                        className="vh-bar-fill"
                        style={{ width: `${barPct}%`, background: color }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Alerts */}
          <div className="vh-alerts">
            <span className="vh-alerts-title">{t.alerts_title}</span>
            {alerts.length === 0 ? (
              <div className="vh-all-ok">
                <CheckCircle2 size={16} strokeWidth={2.5} />
                {t.all_ok}
              </div>
            ) : (
              alerts.map((a, i) => (
                <div key={i} className="vh-alert-item">
                  <AlertTriangle size={14} strokeWidth={2.5} />
                  {a}
                </div>
              ))
            )}
          </div>

          {/* Note */}
          <p className="vh-note">
            {mode === 'simulation' ? t.sim_note : t.live_note(vehicleName)}
          </p>
        </main>
      </div>
    </>
  );
};

export default StellaVehicleHealth;
