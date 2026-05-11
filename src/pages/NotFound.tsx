/**
 * @krisspy-file
 * @type page
 * @name "NotFound"
 * @title "404 — Not Found"
 * @description "Fallback 404 page for unmatched routes"
 * @routes ["*","/404"]
 * @design "template"
 * @requiresAuth false
 */

import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const v = {
  r: 'var(--border-radius)',
  primary: 'var(--primary)',
  primaryHover: 'var(--primary-hover)',
  bg: 'var(--bg-primary)',
  bgSurface: 'var(--bg-secondary)',
  text: 'var(--text-primary)',
  textSub: 'var(--text-secondary)',
  border: 'var(--border)',
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: v.bg,
      color: v.text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: v.r,
          background: 'color-mix(in srgb, var(--primary) 12%, white)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Compass size={32} color={v.primary as string} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          404
        </h1>
        <p style={{ color: v.textSub, fontSize: '1.0625rem', margin: '0 0 32px', lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or was moved.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: v.primary,
            color: 'white',
            fontWeight: 600,
            borderRadius: v.r,
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = v.primaryHover as string)}
          onMouseLeave={e => (e.currentTarget.style.background = v.primary as string)}
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
