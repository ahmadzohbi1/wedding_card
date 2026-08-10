import { getCsrfToken } from '../../lib/csrf';

const shell: React.CSSProperties = {
  minHeight: '100svh',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px 20px',
  background: 'linear-gradient(160deg, oklch(0.96 0.02 300) 0%, oklch(0.94 0.03 320) 100%)',
};

const card: React.CSSProperties = {
  width: 'min(360px, 100%)',
  background: 'oklch(0.99 0.005 320)',
  border: '1px solid oklch(0.85 0.02 320)',
  borderRadius: 14,
  padding: '36px 30px',
  boxShadow: '0 12px 32px oklch(0.3 0.03 320 / 0.12)',
};

const label: React.CSSProperties = {
  fontFamily: "'Jost',sans-serif",
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'oklch(0.45 0.05 320)',
  display: 'block',
  margin: '0 0 6px',
};

const input: React.CSSProperties = {
  width: '100%',
  fontFamily: "'Jost',sans-serif",
  fontSize: 15,
  padding: '11px 14px',
  borderRadius: 8,
  border: '1px solid oklch(0.82 0.02 320)',
  marginBottom: 18,
  boxSizing: 'border-box',
  background: 'oklch(1 0 0)',
  color: 'oklch(0.25 0.03 320)',
};

export default function AdminLogin({ errors, oldEmail }: { errors: string[]; oldEmail: string }) {
  return (
    <div style={shell}>
      <div style={card}>
        <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'oklch(0.45 0.07 310)', margin: '0 0 6px', textAlign: 'center' }}>
          Admin
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: 30, color: 'oklch(0.3 0.03 320)', margin: '0 0 26px', textAlign: 'center' }}>
          Sign in
        </h1>

        {errors.length > 0 && (
          <div style={{ background: 'oklch(0.95 0.05 25)', border: '1px solid oklch(0.75 0.1 25)', borderRadius: 8, padding: '10px 14px', marginBottom: 18 }}>
            {errors.map((err) => (
              <p key={err} style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, color: 'oklch(0.4 0.15 25)', margin: 0 }}>{err}</p>
            ))}
          </div>
        )}

        <form method="POST" action="/admin/getin">
          <input type="hidden" name="_token" value={getCsrfToken()} />

          <label style={label} htmlFor="email">Email</label>
          <input style={input} id="email" name="email" type="email" required autoFocus defaultValue={oldEmail} />

          <label style={label} htmlFor="password">Password</label>
          <input style={input} id="password" name="password" type="password" required />

          <button
            type="submit"
            style={{ width: '100%', fontFamily: "'Jost',sans-serif", fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'oklch(0.55 0.08 325)', color: 'oklch(0.99 0.005 0)', border: 'none', borderRadius: 30, padding: '13px 0', cursor: 'pointer' }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
