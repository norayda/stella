/**
 * @krisspy-file
 * @type page
 * @name "DesignSystemTest"
 * @title "Design System"
 * @description "Live design system — all elements respond to ThemeEditor in real time"
 * @routes ["/design-system"]
 * @design "template"
 * @requiresAuth false
 */

import { useState } from 'react';
import { ChevronRight, Star, Bell, Search, Check, AlertTriangle, X, Info } from 'lucide-react';

const v = {
  r: 'var(--border-radius)',
  primary: 'var(--primary)',
  primaryHover: 'var(--primary-hover)',
  secondary: 'var(--secondary)',
  bg: 'var(--bg-primary)',
  bgSurface: 'var(--bg-secondary)',
  bgMuted: 'var(--bg-tertiary)',
  text: 'var(--text-primary)',
  textSub: 'var(--text-secondary)',
  border: 'var(--border)',
  fontSize: 'var(--font-size-base)',
};

const TABS = ['Colors', 'Typography', 'Buttons', 'Components'];

export default function DesignSystemTest() {
  const [active, setActive] = useState('Colors');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: v.bg, color: v.text, fontSize: v.fontSize, fontFamily: 'inherit' }}>

      {/* Sticky nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: v.bg, borderBottom: `1px solid ${v.border}`, backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 32px', display: 'flex', gap: 0 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActive(t)} style={{
              padding: '16px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '0.875em', fontWeight: active === t ? 600 : 400,
              color: active === t ? v.primary : v.textSub,
              borderBottom: `2px solid ${active === t ? v.primary : 'transparent'}`,
              transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>{t}</button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 32px 80px' }}>

        {/* ── COLORS ── */}
        {active === 'Colors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            <Section title="Main" subtitle="Primary and secondary brand colors">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <ColorCard name="Primary" cssVar="--primary" color={v.primary} />
                <ColorCard name="Secondary" cssVar="--secondary" color={v.secondary} />
              </div>
            </Section>

            <Section title="Backgrounds" subtitle="Surface hierarchy">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <ColorCard name="Background" cssVar="--bg-primary" color={v.bg} bordered />
                <ColorCard name="Surface" cssVar="--bg-secondary" color={v.bgSurface} bordered />
                <ColorCard name="Muted" cssVar="--bg-tertiary" color={v.bgMuted} bordered />
              </div>
            </Section>

            <Section title="Text" subtitle="Text color tokens">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Primary', color: v.text, sample: 'The quick brown fox jumps over the lazy dog' },
                  { label: 'Secondary', color: v.textSub, sample: 'Subtitles, captions, and helper text' },
                  { label: 'Accent', color: v.primary, sample: 'Links, actions, and highlights' },
                ].map(({ label, color, sample }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 20, paddingBottom: 16, borderBottom: `1px solid ${v.border}` }}>
                    <span style={{ fontSize: '0.72em', fontWeight: 600, color: v.textSub, width: 72, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                    <span style={{ color, fontSize: '0.95em' }}>{sample}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Alerts" subtitle="Semantic status colors">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <AlertSwatch label="Success" bg="#10b981" light="#d1fae5" icon={<Check size={14} />} />
                <AlertSwatch label="Warning" bg="#f59e0b" light="#fef3c7" icon={<AlertTriangle size={14} />} />
                <AlertSwatch label="Error"   bg="#ef4444" light="#fee2e2" icon={<X size={14} />} />
              </div>
            </Section>

            <Section title="Border Radius" subtitle="Live — drag the ThemeEditor slider">
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                {[['0px', 'Square'], [v.r, 'Current ↑'], ['9999px', 'Pill']].map(([val, label]) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: val, backgroundColor: v.primary }} />
                    <span style={{ fontSize: '0.72em', color: v.textSub }}>{label}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* ── TYPOGRAPHY ── */}
        {active === 'Typography' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            <Section title="Typography" subtitle="Scale — all sizes relative to font-size-base token">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Heading 1', size: '2.25em', weight: 800, sub: 'Bold / 36px' },
                  { label: 'Heading 2', size: '1.75em', weight: 700, sub: 'Bold / 28px' },
                  { label: 'Heading 3', size: '1.375em', weight: 600, sub: 'SemiBold / 22px' },
                  { label: 'Heading 4', size: '1.125em', weight: 600, sub: 'SemiBold / 18px' },
                  { label: 'Heading 5', size: '1em', weight: 600, sub: 'SemiBold / 16px' },
                  { label: 'Heading 6', size: '0.875em', weight: 600, sub: 'SemiBold / 14px' },
                ].map(({ label, size, weight, sub }) => (
                  <div key={label} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, padding: '20px 0', borderBottom: `1px solid ${v.border}`, alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: '0.875em', fontWeight: 600, color: v.text }}>{label}</div>
                      <div style={{ fontSize: '0.72em', color: v.textSub, marginTop: 2 }}>{sub}</div>
                    </div>
                    <span style={{ fontSize: size, fontWeight: weight, color: v.text, lineHeight: 1.15 }}>{label}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Body" subtitle="Body text variants">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Body XLarge', size: '1.125em', weight: 400 },
                  { label: 'Body Large', size: '1em', weight: 400 },
                  { label: 'Body Medium', size: '0.875em', weight: 400 },
                  { label: 'Body Small', size: '0.8em', weight: 400 },
                  { label: 'Caption', size: '0.72em', weight: 500 },
                ].map(({ label, size, weight }) => (
                  <div key={label} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, padding: '16px 0', borderBottom: `1px solid ${v.border}`, alignItems: 'center' }}>
                    <div style={{ fontSize: '0.72em', color: v.textSub, fontWeight: 500 }}>{label} / {size}</div>
                    <span style={{ fontSize: size, fontWeight: weight, color: v.text }}>The quick brown fox jumps over the lazy dog</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* ── BUTTONS ── */}
        {active === 'Buttons' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <Section title="Buttons" subtitle="Border radius and colors update live with ThemeEditor">

              <BtnGroup label="Primary">
                <Btn bg={v.primary} color="white">Get started</Btn>
                <Btn bg={v.primary} color="white" icon={<Star size={14} />}>Favourite</Btn>
                <Btn bg={v.primary} color="white" icon={<ChevronRight size={14} />} iconRight>Continue</Btn>
                <Btn bg={v.primary} color="white" disabled>Disabled</Btn>
              </BtnGroup>

              <BtnGroup label="Secondary">
                <Btn bg={v.bgSurface} color={v.text} border={v.border}>Cancel</Btn>
                <Btn bg={v.bgSurface} color={v.text} border={v.border} icon={<Bell size={14} />}>Notify</Btn>
                <Btn bg={v.bgSurface} color={v.text} border={v.border} disabled>Disabled</Btn>
              </BtnGroup>

              <BtnGroup label="Ghost">
                <Btn bg="transparent" color={v.primary} border={v.primary}>Learn more</Btn>
                <Btn bg="transparent" color={v.textSub} border={v.border}>Skip</Btn>
                <Btn bg="transparent" color="#ef4444" border="#ef4444">Delete</Btn>
              </BtnGroup>

              <BtnGroup label="Sizes">
                <Btn bg={v.primary} color="white" size="sm">Small</Btn>
                <Btn bg={v.primary} color="white">Medium</Btn>
                <Btn bg={v.primary} color="white" size="lg">Large</Btn>
              </BtnGroup>

              <BtnGroup label="Icon buttons">
                {[
                  { icon: <Star size={16} />, bg: v.primary, color: 'white' },
                  { icon: <Bell size={16} />, bg: v.bgSurface, color: v.textSub, border: v.border },
                  { icon: <Search size={16} />, bg: v.bgSurface, color: v.textSub, border: v.border },
                  { icon: <Check size={16} />, bg: '#10b981', color: 'white' },
                ].map((p, i) => (
                  <div key={i} style={{ width: 40, height: 40, borderRadius: v.r, backgroundColor: p.bg, border: p.border ? `1px solid ${p.border}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: p.color }}>
                    {p.icon}
                  </div>
                ))}
              </BtnGroup>
            </Section>
          </div>
        )}

        {/* ── COMPONENTS ── */}
        {active === 'Components' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

            <Section title="Badges" subtitle="Status indicators">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { label: 'Primary', bg: v.primary + '20', color: v.primary },
                  { label: 'Success', bg: '#d1fae5', color: '#065f46' },
                  { label: 'Warning', bg: '#fef3c7', color: '#92400e' },
                  { label: 'Error',   bg: '#fee2e2', color: '#991b1b' },
                  { label: 'Info',    bg: '#dbeafe', color: '#1e40af' },
                ].map(({ label, bg, color }) => (
                  <span key={label} style={{ padding: '4px 12px', borderRadius: '9999px', backgroundColor: bg, color, fontSize: '0.78em', fontWeight: 600 }}>{label}</span>
                ))}
              </div>
            </Section>

            <Section title="Cards" subtitle="Use border-radius token">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                <div style={{ backgroundColor: v.bg, border: `1px solid ${v.border}`, borderRadius: v.r, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: '100%', height: 80, borderRadius: v.r, backgroundColor: v.bgMuted, marginBottom: 14 }} />
                  <p style={{ fontWeight: 600, color: v.text, margin: '0 0 6px' }}>Basic Card</p>
                  <p style={{ fontSize: '0.82em', color: v.textSub, margin: '0 0 14px', lineHeight: 1.5 }}>A card with border and soft shadow.</p>
                  <Btn bg={v.primary} color="white" full>Action</Btn>
                </div>
                <div style={{ backgroundColor: v.bg, border: `1px solid ${v.primary}40`, borderRadius: v.r, padding: 20, boxShadow: `0 4px 24px ${v.primary}18` }}>
                  <div style={{ width: 36, height: 36, borderRadius: v.r, backgroundColor: v.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Star size={16} color="white" />
                  </div>
                  <p style={{ fontWeight: 700, color: v.text, margin: '0 0 6px' }}>Featured Card</p>
                  <p style={{ fontSize: '0.82em', color: v.textSub, margin: '0 0 14px', lineHeight: 1.5 }}>Accent border and primary glow.</p>
                  <span style={{ fontSize: '0.82em', fontWeight: 600, color: v.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>Learn more <ChevronRight size={13} /></span>
                </div>
                <div style={{ backgroundColor: v.bgSurface, border: `1px solid ${v.border}`, borderRadius: v.r, padding: 20 }}>
                  <p style={{ fontSize: '0.72em', fontWeight: 600, color: v.textSub, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Revenue</p>
                  <p style={{ fontSize: '2em', fontWeight: 800, color: v.text, margin: '0 0 4px' }}>$12,840</p>
                  <p style={{ fontSize: '0.8em', color: '#10b981', fontWeight: 500, margin: 0 }}>↑ 18% this month</p>
                </div>
              </div>
            </Section>

            <Section title="Alerts" subtitle="Status messages">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: <Check size={16} />, title: 'Success', msg: 'Your changes were saved.', bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' },
                  { icon: <Info size={16} />, title: 'Info', msg: 'A new update is available.', bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
                  { icon: <AlertTriangle size={16} />, title: 'Warning', msg: 'Your trial expires in 3 days.', bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
                  { icon: <X size={16} />, title: 'Error', msg: 'Something went wrong.', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
                ].map(({ icon, title, msg, bg, color, border }) => (
                  <div key={title} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderRadius: v.r, backgroundColor: bg, border: `1px solid ${border}` }}>
                    <span style={{ color, marginTop: 1, flexShrink: 0 }}>{icon}</span>
                    <div>
                      <p style={{ fontWeight: 600, color, margin: '0 0 2px', fontSize: '0.875em' }}>{title}</p>
                      <p style={{ color, margin: 0, fontSize: '0.82em', opacity: 0.85 }}>{msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Progress" subtitle="Uses primary color token">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
                {[['Uploading', 72], ['Processing', 45], ['Complete', 100]].map(([label, pct]) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82em' }}>
                      <span style={{ color: v.text }}>{label}</span>
                      <span style={{ color: v.textSub }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: '9999px', backgroundColor: v.bgMuted, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: '9999px', backgroundColor: pct === 100 ? '#10b981' : v.primary, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Forms" subtitle="Inputs use border-radius token">
              <div style={{ maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[['Full name', 'John Appleseed', 'text'], ['Email', 'john@example.com', 'email']].map(([label, ph, type]) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontSize: '0.82em', fontWeight: 500, color: v.text, marginBottom: 6 }}>{label}</label>
                    <input type={type} placeholder={ph} style={{ width: '100%', padding: '10px 14px', borderRadius: v.r, border: `1px solid ${v.border}`, backgroundColor: v.bg, color: v.text, fontSize: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <Btn bg={v.primary} color="white" full>Submit</Btn>
              </div>
            </Section>

          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: '1.25em', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: '0.82em', color: 'var(--text-secondary)', margin: '0 0 20px' }}>{subtitle}</p>}
      {children}
    </div>
  );
}

function ColorCard({ name, cssVar, color, bordered }: { name: string; cssVar: string; color: string; bordered?: boolean }) {
  return (
    <div>
      <div style={{ height: 100, borderRadius: 'var(--border-radius)', backgroundColor: color, border: bordered ? '1px solid var(--border)' : 'none', marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontWeight: 600, fontSize: '0.875em', color: 'var(--text-primary)' }}>{name}</span>
        <span style={{ fontSize: '0.72em', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{cssVar}</span>
      </div>
    </div>
  );
}

function AlertSwatch({ label, bg, light, icon }: { label: string; bg: string; light: string; icon: React.ReactNode }) {
  return (
    <div>
      <div style={{ height: 80, borderRadius: 'var(--border-radius)', backgroundColor: bg, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'white', opacity: 0.7 }}>{icon}</span>
      </div>
      <div style={{ height: 32, borderRadius: 'var(--border-radius)', backgroundColor: light, marginBottom: 8 }} />
      <span style={{ fontSize: '0.82em', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
    </div>
  );
}

function BtnGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: '0.72em', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>{children}</div>
    </div>
  );
}

function Btn({ children, bg, color, border, icon, iconRight, size = 'md', full, disabled }: {
  children: React.ReactNode; bg: string; color: string; border?: string;
  icon?: React.ReactNode; iconRight?: boolean; size?: 'sm' | 'md' | 'lg'; full?: boolean; disabled?: boolean;
}) {
  const pad = size === 'sm' ? '6px 14px' : size === 'lg' ? '13px 28px' : '9px 20px';
  const fs = size === 'sm' ? '0.8em' : size === 'lg' ? '1em' : '0.875em';
  return (
    <button disabled={disabled} style={{
      padding: pad, borderRadius: 'var(--border-radius)', fontSize: fs, fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
      display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'opacity 0.15s',
      backgroundColor: bg, color, border: border ? `1px solid ${border}` : 'none',
      width: full ? '100%' : undefined, justifyContent: full ? 'center' : undefined,
      flexDirection: iconRight ? 'row-reverse' : 'row',
    }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.opacity = '0.82'; }}
      onMouseLeave={e => { if (!disabled) (e.currentTarget as HTMLElement).style.opacity = '1'; }}
    >
      {icon}{children}
    </button>
  );
}