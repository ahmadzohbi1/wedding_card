import { useEffect, useState } from 'react';
import { getCsrfToken } from '../../lib/csrf';
import BrandMark from '../../components/BrandMark';

type RsvpStatus = 'pending' | 'yes' | 'no';

type Side = 'groom' | 'bride';

type Gender = 'male' | 'female';

type Member = {
  id: number;
  name: string;
  is_primary: boolean;
  rsvp_status: RsvpStatus;
};

type GuestGroup = {
  id: number;
  name: string;
  slug: string;
  side: Side;
  gender: Gender;
  url: string;
  members: Member[];
  counts: { accepted: number; declined: number; pending: number; total: number };
};

type SideFilter = Side | 'total';

const SIDE_LABEL: Record<Side, string> = { groom: 'Groom', bride: 'Bride' };

const SIDE_BADGE_COLOR: Record<Side, { bg: string; fg: string }> = {
  groom: { bg: 'oklch(from var(--brand) 0.9 0.03 h)', fg: 'oklch(from var(--brand) 0.4 0.06 h)' },
  bride: { bg: 'oklch(0.92 0.04 20)', fg: 'oklch(0.5 0.12 20)' },
};

const GENDER_LABEL: Record<Gender, string> = { male: 'Male', female: 'Female' };

type NavKey = 'overview' | 'invitations' | 'settings';

const NAV_ITEMS: { key: NavKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'invitations', label: 'Invitations' },
  { key: 'settings', label: 'Settings' },
];

const STATUS_COLOR: Record<RsvpStatus, { bg: string; fg: string }> = {
  yes: { bg: 'oklch(var(--color-success-bg))', fg: 'oklch(var(--color-success))' },
  no: { bg: 'oklch(var(--color-danger-bg))', fg: 'oklch(var(--color-danger))' },
  pending: { bg: 'oklch(from var(--brand) 0.93 0.01 h)', fg: 'oklch(from var(--brand) 0.5 0.02 h)' },
};

async function api(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-TOKEN': getCsrfToken(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Request failed');
  }
  return res.status === 204 ? null : res.json();
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  fontFamily: "'Jost',sans-serif",
  fontSize: 14,
  padding: '9px 12px',
  borderRadius: 8,
  border: '1px solid oklch(from var(--brand) 0.82 0.02 h)',
  boxSizing: 'border-box',
};

const removeBtnStyle: React.CSSProperties = {
  width: 34,
  fontFamily: "'Jost',sans-serif",
  fontSize: 16,
  border: '1px solid oklch(from var(--brand) 0.82 0.02 h)',
  borderRadius: 8,
  background: 'none',
  color: 'oklch(from var(--brand) 0.5 0.05 h)',
  cursor: 'pointer',
};

const addBtnStyle: React.CSSProperties = {
  fontFamily: "'Jost',sans-serif",
  fontSize: 12,
  letterSpacing: '0.05em',
  border: '1px dashed oklch(from var(--brand) 0.6 0.06 h)',
  borderRadius: 20,
  background: 'none',
  color: 'oklch(from var(--brand) 0.45 0.08 h)',
  padding: '7px 16px',
  cursor: 'pointer',
};

const solidBtnStyle: React.CSSProperties = {
  ...addBtnStyle,
  borderStyle: 'solid',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  textDecoration: 'none',
};

const primaryBtnStyle: React.CSSProperties = {
  fontFamily: "'Jost',sans-serif",
  fontSize: 13,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  background: 'oklch(from var(--brand) 0.55 0.08 h)',
  color: 'oklch(var(--color-paper))',
  border: 'none',
  borderRadius: 30,
  padding: '11px 26px',
  cursor: 'pointer',
};

const sideTabStyle = (active: boolean): React.CSSProperties => ({
  fontFamily: "'Jost',sans-serif",
  fontSize: 13,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  border: '1px solid oklch(from var(--brand) 0.6 0.06 h)',
  borderRadius: 20,
  padding: '8px 18px',
  cursor: 'pointer',
  background: active ? 'oklch(from var(--brand) 0.55 0.08 h)' : 'none',
  color: active ? 'oklch(var(--color-paper))' : 'oklch(from var(--brand) 0.4 0.06 h)',
});

const sideSelectorBtnStyle = (active: boolean): React.CSSProperties => ({
  fontFamily: "'Jost',sans-serif",
  fontSize: 12,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  border: '1px solid oklch(from var(--brand) 0.6 0.06 h)',
  borderRadius: 20,
  padding: '7px 16px',
  cursor: 'pointer',
  background: active ? 'oklch(from var(--brand) 0.55 0.08 h)' : 'none',
  color: active ? 'oklch(var(--color-paper))' : 'oklch(from var(--brand) 0.4 0.06 h)',
});

const labelStyle: React.CSSProperties = {
  fontFamily: "'Jost',sans-serif",
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'oklch(from var(--brand) 0.45 0.05 h)',
  display: 'block',
  marginBottom: 6,
};

function StatTile({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ background: 'oklch(from var(--brand) 0.99 0.005 h)', border: '1px solid oklch(from var(--brand) 0.87 0.015 h)', borderRadius: 12, padding: '16px 18px' }}>
      <p style={{ ...labelStyle, marginBottom: 6 }}>{label}</p>
      <p style={{ fontFamily: "'Jost',sans-serif", fontWeight: 600, fontSize: 30, color: color ?? 'oklch(from var(--brand) 0.3 0.03 h)', margin: 0 }}>{value}</p>
    </div>
  );
}

function MemberInputList({ members, onChange }: { members: string[]; onChange: (members: string[]) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>Family / invited people</label>
      {members.map((value, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={value}
            onChange={(e) => onChange(members.map((m, j) => (j === i ? e.target.value : m)))}
            placeholder="e.g. Taha"
            style={inputStyle}
          />
          <button type="button" onClick={() => onChange(members.filter((_, j) => j !== i))} style={removeBtnStyle} aria-label="Remove">
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...members, ''])} style={addBtnStyle}>
        + Add family member
      </button>
    </div>
  );
}

function Modal({ title, onClose, children, width = 440 }: { title: string; onClose: () => void; children: React.ReactNode; width?: number }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'oklch(from var(--brand) 0.2 0.02 h / 0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '5vh 16px', zIndex: 50, overflowY: 'auto' }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'oklch(from var(--brand) 0.99 0.005 h)', borderRadius: 14, padding: '24px 22px', width: `min(${width}px, 100%)`, boxShadow: '0 20px 50px oklch(from var(--brand) 0.2 0.03 h / 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: 22, color: 'oklch(from var(--brand) 0.3 0.03 h)', margin: 0 }}>{title}</h3>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: 22, lineHeight: 1, color: 'oklch(from var(--brand) 0.5 0.03 h)', cursor: 'pointer' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-pressed={checked}
      style={{
        width: 52,
        height: 30,
        borderRadius: 20,
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        background: checked ? 'oklch(from var(--brand) 0.55 0.08 h)' : 'oklch(from var(--brand) 0.85 0.02 h)',
        position: 'relative',
        flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
        transition: 'background 200ms',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 25 : 3,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'oklch(var(--color-paper))',
          transition: 'left 200ms',
          boxShadow: '0 1px 3px oklch(from var(--brand) 0.2 0.02 h / 0.3)',
        }}
      />
    </button>
  );
}

type FormState = { mode: 'create' } | { mode: 'edit'; guest: GuestGroup };

function SideSelector({ value, onChange }: { value: Side; onChange: (side: Side) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>Side</label>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['groom', 'bride'] as Side[]).map((s) => (
          <button key={s} type="button" onClick={() => onChange(s)} style={sideSelectorBtnStyle(value === s)}>
            {SIDE_LABEL[s]}
          </button>
        ))}
      </div>
    </div>
  );
}

function GenderSelector({ value, onChange }: { value: Gender; onChange: (gender: Gender) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>Gender</label>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['male', 'female'] as Gender[]).map((g) => (
          <button key={g} type="button" onClick={() => onChange(g)} style={sideSelectorBtnStyle(value === g)}>
            {GENDER_LABEL[g]}
          </button>
        ))}
      </div>
    </div>
  );
}

function GuestFormModal({ form, defaultSide, saving, error, onCancel, onSubmit }: {
  form: FormState;
  defaultSide: Side;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (name: string, side: Side, gender: Gender, members: { id?: number; name: string }[]) => void;
}) {
  const initialName = form.mode === 'edit' ? form.guest.name : '';
  const initialMembers = form.mode === 'edit' ? form.guest.members.filter((m) => !m.is_primary).map((m) => ({ id: m.id, name: m.name })) : [];

  const [name, setName] = useState(initialName);
  const [side, setSide] = useState<Side>(form.mode === 'edit' ? form.guest.side : defaultSide);
  const [gender, setGender] = useState<Gender>(form.mode === 'edit' ? form.guest.gender : 'male');
  const [members, setMembers] = useState(initialMembers);

  return (
    <Modal title={form.mode === 'create' ? 'Add a guest' : 'Edit invitation'} onClose={onCancel}>
      <label style={labelStyle}>Main guest name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Moustafa" style={{ ...inputStyle, marginBottom: 14 }} />
      <SideSelector value={side} onChange={setSide} />
      <GenderSelector value={gender} onChange={setGender} />
      <MemberInputList members={members.map((m) => m.name)} onChange={(names) => setMembers(names.map((n, i) => ({ id: members[i]?.id, name: n })))} />
      {error && <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, color: 'oklch(var(--color-danger))', marginBottom: 10 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <button
          onClick={() => onSubmit(name, side, gender, members.filter((m) => m.name.trim() !== ''))}
          disabled={saving || !name.trim()}
          style={primaryBtnStyle}
        >
          {saving ? 'Saving…' : form.mode === 'create' ? 'Create invitation' : 'Save changes'}
        </button>
        <button onClick={onCancel} style={solidBtnStyle}>Cancel</button>
      </div>
    </Modal>
  );
}

type BulkGuestBlock = { name: string; gender: Gender; members: string[] };

function BulkAddModal({ defaultSide, saving, error, onCancel, onSubmit }: {
  defaultSide: Side;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (guests: { name: string; gender: Gender; members: string[] }[], side: Side) => void;
}) {
  const [side, setSide] = useState<Side>(defaultSide);
  const [blocks, setBlocks] = useState<BulkGuestBlock[]>([{ name: '', gender: 'male', members: [''] }]);

  const updateBlock = (i: number, patch: Partial<BulkGuestBlock>) => {
    setBlocks((bs) => bs.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  };

  const addBlock = () => setBlocks((bs) => [...bs, { name: '', gender: 'male', members: [''] }]);
  const removeBlock = (i: number) => setBlocks((bs) => bs.filter((_, j) => j !== i));

  const readyGuests = blocks
    .filter((b) => b.name.trim() !== '')
    .map((b) => ({ name: b.name.trim(), gender: b.gender, members: b.members.filter((m) => m.trim() !== '') }));

  return (
    <Modal title="Bulk add guests" onClose={onCancel} width={560}>
      <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, color: 'oklch(from var(--brand) 0.5 0.03 h)', margin: '0 0 16px' }}>
        Add several main guests and their family or party members at once.
      </p>

      <SideSelector value={side} onChange={setSide} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '48vh', overflowY: 'auto', paddingRight: 4, marginBottom: 14 }}>
        {blocks.map((block, i) => (
          <div key={i} style={{ border: '1px solid oklch(from var(--brand) 0.87 0.015 h)', borderRadius: 10, padding: '14px 14px 4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ ...labelStyle, marginBottom: 0 }}>Guest {i + 1}</p>
              {blocks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBlock(i)}
                  style={{ background: 'none', border: 'none', color: 'oklch(var(--color-danger))', cursor: 'pointer', fontFamily: "'Jost',sans-serif", fontSize: 12 }}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              value={block.name}
              onChange={(e) => updateBlock(i, { name: e.target.value })}
              placeholder="Main guest name, e.g. Moustafa"
              style={{ ...inputStyle, marginBottom: 12 }}
            />
            <GenderSelector value={block.gender} onChange={(gender) => updateBlock(i, { gender })} />
            <MemberInputList members={block.members} onChange={(members) => updateBlock(i, { members })} />
          </div>
        ))}
      </div>

      <button type="button" onClick={addBlock} style={{ ...addBtnStyle, marginBottom: 16 }}>+ Add another guest</button>

      {error && <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, color: 'oklch(var(--color-danger))', marginBottom: 10 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => onSubmit(readyGuests, side)} disabled={saving || readyGuests.length === 0} style={primaryBtnStyle}>
          {saving ? 'Creating…' : `Create ${readyGuests.length || ''} invitation${readyGuests.length === 1 ? '' : 's'}`}
        </button>
        <button onClick={onCancel} style={solidBtnStyle}>Cancel</button>
      </div>
    </Modal>
  );
}

function GuestViewModal({ guest, onClose }: { guest: GuestGroup; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard?.writeText(guest.url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Modal title={guest.name} onClose={onClose}>
      <span style={{ display: 'inline-block', fontFamily: "'Jost',sans-serif", fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', background: SIDE_BADGE_COLOR[guest.side].bg, color: SIDE_BADGE_COLOR[guest.side].fg, borderRadius: 20, padding: '3px 12px', marginBottom: 10, marginRight: 8 }}>
        {SIDE_LABEL[guest.side]}
      </span>
      <span style={{ display: 'inline-block', fontFamily: "'Jost',sans-serif", fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', background: 'oklch(from var(--brand) 0.93 0.01 h)', color: 'oklch(from var(--brand) 0.45 0.03 h)', borderRadius: 20, padding: '3px 12px', marginBottom: 10 }}>
        {GENDER_LABEL[guest.gender]}
      </span>
      <p style={{ ...labelStyle, marginBottom: 10 }}>
        {guest.counts.total} {guest.counts.total === 1 ? 'guest' : 'guests'} in this party
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        {guest.members.map((m) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: 'oklch(from var(--brand) 0.97 0.008 h)', borderRadius: 8, padding: '9px 12px' }}>
            <span style={{ fontFamily: "'Jost',sans-serif", fontSize: 14, color: 'oklch(from var(--brand) 0.3 0.03 h)' }}>{m.name}{m.is_primary ? ' ★' : ''}</span>
            <span style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, background: STATUS_COLOR[m.rsvp_status].bg, color: STATUS_COLOR[m.rsvp_status].fg, borderRadius: 20, padding: '3px 12px', textTransform: 'capitalize' }}>
              {m.rsvp_status}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'oklch(from var(--brand) 0.97 0.008 h)', borderRadius: 8, padding: '8px 10px', marginBottom: 18 }}>
        <span style={{ fontFamily: "'Courier New',monospace", fontSize: 12, color: 'oklch(from var(--brand) 0.4 0.03 h)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{guest.url}</span>
        <button onClick={copyLink} style={{ ...addBtnStyle, flexShrink: 0 }}>{copied ? 'Copied' : 'Copy link'}</button>
      </div>
      <button onClick={onClose} style={solidBtnStyle}>Close</button>
    </Modal>
  );
}

function Sidebar({ active, onSelect }: { active: NavKey; onSelect: (key: NavKey) => void }) {
  return (
    <nav className="admin-sidebar">
      <div className="admin-sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <BrandMark size={30} color="oklch(from var(--brand) 0.55 0.08 h)" />
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: 20, color: 'oklch(from var(--brand) 0.3 0.03 h)', margin: 0 }}>Admin</p>
      </div>
      <div className="admin-sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className="admin-sidebar-link"
            style={{
              fontFamily: "'Jost',sans-serif",
              fontSize: 13,
              letterSpacing: '0.04em',
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 16px',
              borderRadius: 10,
              background: active === item.key ? 'oklch(from var(--brand) 0.55 0.08 h)' : 'none',
              color: active === item.key ? 'oklch(var(--color-paper))' : 'oklch(from var(--brand) 0.4 0.04 h)',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <form method="POST" action="/admin/logout" className="admin-sidebar-signout">
        <input type="hidden" name="_token" value={getCsrfToken()} />
        <button type="submit" style={{ ...solidBtnStyle, width: '100%' }}>Sign out</button>
      </form>
    </nav>
  );
}

const VALID_VIEWS: NavKey[] = ['overview', 'invitations', 'settings'];

function getInitialView(): NavKey {
  const requested = new URLSearchParams(window.location.search).get('view');
  return (VALID_VIEWS as string[]).includes(requested ?? '') ? (requested as NavKey) : 'overview';
}

export default function AdminDashboard() {
  const [view, setViewState] = useState<NavKey>(getInitialView);
  const [viewFading, setViewFading] = useState(false);

  const setView = (key: NavKey) => {
    if (key === view) return;
    setViewFading(true);
    setTimeout(() => {
      setViewState(key);
      const url = new URL(window.location.href);
      url.searchParams.set('view', key);
      window.history.replaceState({}, '', url);
      setViewFading(false);
    }, 150);
  };

  const [guests, setGuests] = useState<GuestGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formState, setFormState] = useState<FormState | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const [viewingGuest, setViewingGuest] = useState<GuestGroup | null>(null);

  const [sideFilter, setSideFilter] = useState<SideFilter>('total');

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [showKidsMessage, setShowKidsMessage] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const loadGuests = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api('/admin/api/guests');
      setGuests(data.guests);
    } catch {
      setLoadError('Could not load guests.');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const data = await api('/admin/api/settings');
      setShowKidsMessage(data.show_kids_message);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
    loadSettings();
  }, []);

  const totals = guests.reduce(
    (acc, g) => ({
      total: acc.total + g.counts.total,
      accepted: acc.accepted + g.counts.accepted,
      declined: acc.declined + g.counts.declined,
      pending: acc.pending + g.counts.pending,
    }),
    { total: 0, accepted: 0, declined: 0, pending: 0 },
  );

  const filteredGuests = sideFilter === 'total' ? guests : guests.filter((g) => g.side === sideFilter);

  const submitForm = async (name: string, side: Side, gender: Gender, members: { id?: number; name: string }[]) => {
    if (!formState) return;
    setFormSaving(true);
    setFormError(null);
    try {
      if (formState.mode === 'create') {
        const data = await api('/admin/api/guests', {
          method: 'POST',
          body: JSON.stringify({ name, side, gender, members: members.map((m) => m.name) }),
        });
        setGuests((g) => [data.guest, ...g]);
      } else {
        const data = await api(`/admin/api/guests/${formState.guest.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name, side, gender, members }),
        });
        setGuests((g) => g.map((item) => (item.id === formState.guest.id ? data.guest : item)));
      }
      setFormState(null);
    } catch {
      setFormError('Could not save this invitation.');
    } finally {
      setFormSaving(false);
    }
  };

  const submitBulk = async (bulkGuests: { name: string; gender: Gender; members: string[] }[], side: Side) => {
    setBulkSaving(true);
    setBulkError(null);
    try {
      const data = await api('/admin/api/guests/bulk', {
        method: 'POST',
        body: JSON.stringify({ guests: bulkGuests, side }),
      });
      setGuests((g) => [...data.guests, ...g]);
      setBulkOpen(false);
    } catch {
      setBulkError('Could not create these invitations.');
    } finally {
      setBulkSaving(false);
    }
  };

  const deleteGuest = async (guest: GuestGroup) => {
    if (!confirm(`Delete ${guest.name}'s invitation?`)) return;
    await api(`/admin/api/guests/${guest.id}`, { method: 'DELETE' });
    setGuests((g) => g.filter((item) => item.id !== guest.id));
  };

  const copyLink = (guest: GuestGroup) => {
    navigator.clipboard?.writeText(guest.url).catch(() => {});
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId((id) => (id === guest.id ? null : id)), 1600);
  };

  const toggleKidsMessage = async () => {
    const next = !showKidsMessage;
    setShowKidsMessage(next);
    setSettingsSaving(true);
    try {
      await api('/admin/api/settings', {
        method: 'PATCH',
        body: JSON.stringify({ show_kids_message: next }),
      });
    } catch {
      setShowKidsMessage(!next);
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-layout">
        <Sidebar active={view} onSelect={setView} />

        <div className="admin-main">
        <div style={{ opacity: viewFading ? 0 : 1, transition: 'opacity 150ms ease' }}>
          {view === 'overview' && (
            <>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: 28, color: 'oklch(from var(--brand) 0.3 0.03 h)', margin: '0 0 20px' }}>Overview</h1>
              <div className="stat-grid">
                <StatTile label="Total guests" value={totals.total} />
                <StatTile label="Accepted" value={totals.accepted} color={STATUS_COLOR.yes.fg} />
                <StatTile label="Declined" value={totals.declined} color={STATUS_COLOR.no.fg} />
                <StatTile label="Pending" value={totals.pending} color={STATUS_COLOR.pending.fg} />
              </div>
              <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 14, color: 'oklch(from var(--brand) 0.45 0.03 h)', marginTop: 20 }}>
                {guests.length} invitation{guests.length === 1 ? '' : 's'} sent so far.{' '}
                <button onClick={() => setView('invitations')} style={{ background: 'none', border: 'none', padding: 0, color: 'oklch(from var(--brand) 0.45 0.08 h)', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  View all invitations
                </button>
              </p>
            </>
          )}

          {view === 'invitations' && (
            <>
              <div className="admin-panel-header">
                <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: 28, color: 'oklch(from var(--brand) 0.3 0.03 h)', margin: 0 }}>Invitations ({filteredGuests.length})</h1>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => setFormState({ mode: 'create' })} style={primaryBtnStyle}>+ Add guest</button>
                  <button onClick={() => setBulkOpen(true)} style={solidBtnStyle}>+ Bulk add</button>
                  <a href="/admin/api/guests-export" style={solidBtnStyle}>Export to CSV</a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '2px 0 18px' }}>
                <button onClick={() => setSideFilter('groom')} style={sideTabStyle(sideFilter === 'groom')}>Groom</button>
                <button onClick={() => setSideFilter('bride')} style={sideTabStyle(sideFilter === 'bride')}>Bride</button>
                <button onClick={() => setSideFilter('total')} style={sideTabStyle(sideFilter === 'total')}>Show total</button>
              </div>

              {loading && <p style={{ fontFamily: "'Jost',sans-serif", color: 'oklch(from var(--brand) 0.5 0.03 h)' }}>Loading…</p>}
              {loadError && <p style={{ fontFamily: "'Jost',sans-serif", color: 'oklch(var(--color-danger))' }}>{loadError}</p>}

              {!loading && !loadError && filteredGuests.length === 0 && (
                <p style={{ fontFamily: "'Jost',sans-serif", color: 'oklch(from var(--brand) 0.5 0.03 h)' }}>No invitations yet. Click "+ Add guest" to create one.</p>
              )}

              {filteredGuests.length > 0 && (
                <div className="invitations-table-wrap">
                  <table className="invitations-table">
                    <thead>
                      <tr>
                        <th>Main guest</th>
                        <th>Side</th>
                        <th>Gender</th>
                        <th>Party</th>
                        <th>RSVP</th>
                        <th>Link</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGuests.map((guest) => (
                        <tr key={guest.id}>
                          <td style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: 'oklch(from var(--brand) 0.3 0.03 h)' }}>{guest.name}</td>
                          <td>
                            <span style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, background: SIDE_BADGE_COLOR[guest.side].bg, color: SIDE_BADGE_COLOR[guest.side].fg, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                              {SIDE_LABEL[guest.side]}
                            </span>
                          </td>
                          <td style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, color: 'oklch(from var(--brand) 0.45 0.03 h)', whiteSpace: 'nowrap' }}>
                            {GENDER_LABEL[guest.gender]}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {guest.members.map((m) => (
                                <span key={m.id} style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, background: STATUS_COLOR[m.rsvp_status].bg, color: STATUS_COLOR[m.rsvp_status].fg, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                                  {m.name}{m.is_primary ? ' ★' : ''}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, whiteSpace: 'nowrap' }}>
                            <span style={{ color: STATUS_COLOR.yes.fg }}>{guest.counts.accepted} yes</span>{' · '}
                            <span style={{ color: STATUS_COLOR.no.fg }}>{guest.counts.declined} no</span>{' · '}
                            <span style={{ color: STATUS_COLOR.pending.fg }}>{guest.counts.pending} pending</span>
                          </td>
                          <td>
                            <button onClick={() => copyLink(guest)} style={{ ...addBtnStyle, whiteSpace: 'nowrap' }}>
                              {copiedId === guest.id ? 'Copied' : 'Copy link'}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <button onClick={() => setViewingGuest(guest)} style={solidBtnStyle}>View</button>
                              <button onClick={() => setFormState({ mode: 'edit', guest })} style={solidBtnStyle}>Edit</button>
                              <button onClick={() => deleteGuest(guest)} style={{ ...solidBtnStyle, borderColor: 'oklch(var(--color-danger-border))', color: 'oklch(var(--color-danger))' }}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {view === 'settings' && (
            <>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: 28, color: 'oklch(from var(--brand) 0.3 0.03 h)', margin: '0 0 20px' }}>Settings</h1>
              <div style={{ background: 'oklch(from var(--brand) 0.99 0.005 h)', border: '1px solid oklch(from var(--brand) 0.87 0.015 h)', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, maxWidth: 520 }}>
                <div>
                  <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 15, color: 'oklch(from var(--brand) 0.3 0.03 h)', margin: '0 0 4px' }}>"Sweet dreams for your kids"</p>
                  <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, color: 'oklch(from var(--brand) 0.5 0.03 h)', margin: 0 }}>Show this line at the end of every invitation.</p>
                </div>
                <ToggleSwitch checked={showKidsMessage} onChange={toggleKidsMessage} disabled={settingsLoading || settingsSaving} />
              </div>
            </>
          )}
        </div>
        </div>
      </div>

      {formState && (
        <GuestFormModal
          form={formState}
          defaultSide={sideFilter === 'total' ? 'groom' : sideFilter}
          saving={formSaving}
          error={formError}
          onCancel={() => { setFormState(null); setFormError(null); }}
          onSubmit={submitForm}
        />
      )}

      {bulkOpen && (
        <BulkAddModal
          defaultSide={sideFilter === 'total' ? 'groom' : sideFilter}
          saving={bulkSaving}
          error={bulkError}
          onCancel={() => { setBulkOpen(false); setBulkError(null); }}
          onSubmit={submitBulk}
        />
      )}

      {viewingGuest && <GuestViewModal guest={viewingGuest} onClose={() => setViewingGuest(null)} />}
    </div>
  );
}
