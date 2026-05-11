import React, { useState, useEffect } from 'react';
import { Settings, Check } from 'lucide-react';
import { themePresets, type ThemePreset } from './theme-presets';

interface ThemeVars {
  '--primary': string;
  '--primary-hover': string;
  '--secondary': string;
  '--bg-primary': string;
  '--bg-secondary': string;
  '--bg-tertiary': string;
  '--text-primary': string;
  '--text-secondary': string;
  '--border': string;
  '--font-size-base': string;
  '--border-radius': string;
}

const readThemeVars = (): ThemeVars => {
  const cs = getComputedStyle(document.documentElement);
  const get = (v: string, fallback: string) => cs.getPropertyValue(v).trim() || fallback;
  return {
    '--primary': get('--primary', '#3b82f6'),
    '--primary-hover': get('--primary-hover', '#2563eb'),
    '--secondary': get('--secondary', '#64748b'),
    '--bg-primary': get('--bg-primary', '#ffffff'),
    '--bg-secondary': get('--bg-secondary', '#f7f7f7'),
    '--bg-tertiary': get('--bg-tertiary', '#e0e0e0'),
    '--text-primary': get('--text-primary', '#1e293b'),
    '--text-secondary': get('--text-secondary', '#64748b'),
    '--border': get('--border', '#e2e8f0'),
    '--font-size-base': get('--font-size-base', '16px'),
    '--border-radius': get('--border-radius', '8px'),
  };
};

const presetToVars = (p: ThemePreset): ThemeVars => ({
  '--primary': p.primary,
  '--primary-hover': p.primaryHover,
  '--secondary': p.secondary,
  '--bg-primary': p.bgPrimary,
  '--bg-secondary': p.bgSecondary,
  '--bg-tertiary': p.bgTertiary,
  '--text-primary': p.textPrimary,
  '--text-secondary': p.textSecondary,
  '--border': p.border,
  '--font-size-base': p.fontSize,
  '--border-radius': p.radius,
});

const LS_VISIBLE = 'te-visible';
const LS_OPEN = 'te-open';

export const ThemeEditor: React.FC = () => {
  const [visible, setVisible] = useState(() => localStorage.getItem(LS_VISIBLE) === '1');
  const [isOpen, setIsOpen] = useState(() => localStorage.getItem(LS_OPEN) !== '0');
  const [values, setValues] = useState<ThemeVars>(readThemeVars);
  const [toast, setToast] = useState<string | null>(null);
  const savedRef = React.useRef<ThemeVars>(readThemeVars());

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const v = e.detail?.open ?? true;
      setVisible(v);
      localStorage.setItem(LS_VISIBLE, v ? '1' : '0');
    };
    window.addEventListener('storyloop-theme-editor-toggle', handler as EventListener);
    return () => window.removeEventListener('storyloop-theme-editor-toggle', handler as EventListener);
  }, []);

  useEffect(() => {
    if (isOpen) setValues(readThemeVars());
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) { setIsOpen(false); localStorage.setItem(LS_OPEN, '0'); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'STORYLOOP_FILE_EDITS_SAVED') {
        // Small delay so Sandpack applies the new CSS before we snapshot
        setTimeout(() => { savedRef.current = readThemeVars(); }, 300);
        setToast('Saved');
        setTimeout(() => setToast(null), 2000);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!visible) return null;

  const setVar = (name: keyof ThemeVars, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    document.documentElement.style.setProperty(name, value);
  };

  const applyPreset = (preset: ThemePreset) => {
    const vars = presetToVars(preset);
    Object.entries(vars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
    setValues(vars);
  };

  const handleSave = () => {
    window.parent.postMessage({
      type: 'STORYLOOP_FILE_EDITS_SAVE',
      requestId: 'theme-save-' + Date.now(),
      edits: Object.entries(values).map(([name, value]) => ({
        type: 'css-var',
        file: 'src/style/theme.css',
        name,
        value,
      })),
    }, '*');
  };

  const fontSizePx = parseInt(values['--font-size-base']) || 16;
  const radiusPx = parseInt(values['--border-radius']) || 8;
  const fontPct = Math.round((fontSizePx / 16) * 100);
  const radiusPct = Math.round((radiusPx / 24) * 100);

  const isPresetActive = (p: ThemePreset) =>
    values['--primary'] === p.primary && values['--bg-primary'] === p.bgPrimary;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(o => { localStorage.setItem(LS_OPEN, o ? '0' : '1'); return !o; })}
        style={{
          position: 'fixed', top: '12px', right: '12px', width: '36px', height: '36px',
          borderRadius: '10px', background: isOpen ? 'var(--primary)' : 'white',
          border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10001, transition: 'all 0.2s',
        }}
      >
        <Settings size={18} color={isOpen ? 'white' : '#9ca3af'} />
      </button>

      {/* Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed', top: '56px', right: '12px', width: '300px',
          backgroundColor: 'white', borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid #f0f0f0',
          zIndex: 9999, overflow: 'hidden', animation: 'slideIn 0.15s ease-out',
        }}>
          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Presets */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px', marginBottom: '12px', display: 'block' }}>
                THEME
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* Actual — shows current theme, click to restore */}
                {(() => {
                  const saved = savedRef.current;
                  const noMatch = !themePresets.some(p => isPresetActive(p));
                  const actualColor = saved['--primary'];
                  const resetToActual = () => {
                    Object.entries(saved).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
                    setValues({ ...saved });
                  };
                  return (
                    <button onClick={resetToActual} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', background: actualColor,
                        border: noMatch ? '2px solid #1e1b4b' : '2px solid transparent',
                        boxShadow: noMatch ? `0 0 0 2px white, 0 0 0 4px ${actualColor}` : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                      }}>
                        {noMatch && <Check size={14} color="white" strokeWidth={3} />}
                      </div>
                      <span style={{ fontSize: '10px', color: noMatch ? '#1e1b4b' : '#9ca3af', fontWeight: noMatch ? 600 : 400 }}>Actual</span>
                    </button>
                  );
                })()}
                {themePresets.map(preset => {
                  const active = isPresetActive(preset);
                  return (
                    <button key={preset.name} onClick={() => applyPreset(preset)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: preset.primary,
                        border: active ? '2px solid #1e1b4b' : '2px solid transparent',
                        boxShadow: active ? `0 0 0 2px white, 0 0 0 4px ${preset.primary}` : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                      }}>
                        {active && <Check size={14} color="white" strokeWidth={3} />}
                      </div>
                      <span style={{ fontSize: '10px', color: active ? '#1e1b4b' : '#9ca3af', fontWeight: active ? 600 : 400 }}>
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px', marginBottom: '12px', display: 'block' }}>
                TYPOGRAPHY
              </span>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#374151' }}>Font size</span>
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>{fontPct}%</span>
                </div>
                <input type="range" min="14" max="20" value={fontSizePx}
                  onChange={e => setVar('--font-size-base', e.target.value + 'px')}
                  style={{
                    width: '100%', height: '4px', borderRadius: '2px',
                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((fontSizePx - 14) / 6) * 100}%, #e5e7eb ${((fontSizePx - 14) / 6) * 100}%, #e5e7eb 100%)`,
                    appearance: 'none', cursor: 'pointer',
                  }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#374151' }}>Border radius</span>
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>{radiusPct}%</span>
                </div>
                <input type="range" min="0" max="24" value={radiusPx}
                  onChange={e => setVar('--border-radius', e.target.value + 'px')}
                  style={{
                    width: '100%', height: '4px', borderRadius: '2px',
                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(radiusPx / 24) * 100}%, #e5e7eb ${(radiusPx / 24) * 100}%, #e5e7eb 100%)`,
                    appearance: 'none', cursor: 'pointer',
                  }}
                />
              </div>
            </div>

            {/* Custom colors */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.5px', marginBottom: '10px', display: 'block' }}>
                CUSTOM
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <ColorDot label="Primary" name="--primary" value={values['--primary']} onChange={setVar} />
                <ColorDot label="Secondary" name="--secondary" value={values['--secondary']} onChange={setVar} />
                <ColorDot label="Background" name="--bg-primary" value={values['--bg-primary']} onChange={setVar} />
                <ColorDot label="Text" name="--text-primary" value={values['--text-primary']} onChange={setVar} />
              </div>
            </div>
          </div>

          {/* Save */}
          <div style={{ padding: '12px 18px 16px' }}>
            <button onClick={handleSave}
              style={{
                width: '100%', padding: '10px', background: 'var(--primary)', color: 'white',
                border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Save theme
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', display: 'flex',
          alignItems: 'center', gap: '6px', backgroundColor: '#10b981', color: 'white',
          padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', zIndex: 10002,
          animation: 'slideUp 0.2s ease-out',
        }}>
          <Check size={14} />
          {toast}
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%;
          background: white; border: 2px solid var(--primary); cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      `}</style>
    </>
  );
};

const ColorDot: React.FC<{
  label: string;
  name: keyof ThemeVars;
  value: string;
  onChange: (name: keyof ThemeVars, value: string) => void;
}> = ({ label, name, value, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
    <div style={{ position: 'relative' }}>
      <input type="color" value={value} onChange={e => onChange(name, e.target.value)}
        style={{ width: '24px', height: '24px', padding: 0, border: 'none', borderRadius: '50%', cursor: 'pointer', opacity: 0, position: 'absolute', inset: 0 }}
      />
      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: value, border: '2px solid #e5e7eb' }} />
    </div>
    <span style={{ fontSize: '12px', color: '#6b7280' }}>{label}</span>
  </label>
);

export default ThemeEditor;
