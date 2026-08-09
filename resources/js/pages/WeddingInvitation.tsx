import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const COUPLE_NAMES = 'Layla & Ahmad';
const WEDDING_DATE_LONG = 'Thursday, September 24, 2026';
const VENUE_NAME = 'Roche Doree';
const VENUE_ADDRESS = 'Roche Doree — address to follow';
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VENUE_NAME)}`;

const COUNTDOWN_PARTS = [
  { value: '46', label: 'Days' },
  { value: '6', label: 'Weeks' },
  { value: 'Thu', label: 'Day' },
];

const GIFT_OPTIONS = [
  { key: 'phone', label: 'Whish Account', value: '+961 71 835 077', showLogo: true },
  { key: 'iban', label: 'IBAN', value: 'LB07 0056 9984 0103 5017 8293 0002', showLogo: false },
];

const SLIDE_COUNT = 6;

function RoseCorners() {
  return (
    <>
      <img src="/assets/rose-tl.png" alt="" style={{ position: 'absolute', top: 0, left: 0, width: 150, height: 'auto', pointerEvents: 'none', opacity: 0.85 }} />
      <img src="/assets/rose-tr.png" alt="" style={{ position: 'absolute', top: 0, right: 0, width: 150, height: 'auto', pointerEvents: 'none', opacity: 0.85 }} />
      <img src="/assets/rose-bl.png" alt="" style={{ position: 'absolute', bottom: 0, left: 0, width: 150, height: 'auto', pointerEvents: 'none', opacity: 0.85 }} />
      <img src="/assets/rose-br.png" alt="" style={{ position: 'absolute', bottom: 0, right: 0, width: 150, height: 'auto', pointerEvents: 'none', opacity: 0.85 }} />
    </>
  );
}

function ElegantCorners() {
  const line = (extra: React.CSSProperties) => ({ position: 'absolute' as const, zIndex: 1, ...extra });
  return (
    <>
      <div style={line({ top: 18, left: 18, width: 64, height: 64, borderTop: '1px solid oklch(0.97 0.01 330 / 0.85)', borderLeft: '1px solid oklch(0.97 0.01 330 / 0.85)' })} />
      <div style={line({ top: 26, left: 26, width: 44, height: 44, borderTop: '1px solid oklch(0.97 0.01 330 / 0.55)', borderLeft: '1px solid oklch(0.97 0.01 330 / 0.55)' })} />
      <div style={line({ bottom: 18, right: 18, width: 64, height: 64, borderBottom: '1px solid oklch(0.97 0.01 330 / 0.85)', borderRight: '1px solid oklch(0.97 0.01 330 / 0.85)' })} />
      <div style={line({ bottom: 26, right: 26, width: 44, height: 44, borderBottom: '1px solid oklch(0.97 0.01 330 / 0.55)', borderRight: '1px solid oklch(0.97 0.01 330 / 0.55)' })} />
    </>
  );
}

export default function WeddingInvitationPage() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [rsvpChoice, setRsvpChoice] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    const unmuteOnGesture = () => {
      const p = ytPlayerRef.current;
      if (p?.unMute) {
        p.unMute();
        p.playVideo();
        setMusicPlaying(true);
      }
      window.removeEventListener('pointerdown', unmuteOnGesture);
      window.removeEventListener('scroll', unmuteOnGesture, true);
      window.removeEventListener('touchstart', unmuteOnGesture);
    };
    window.addEventListener('pointerdown', unmuteOnGesture);
    window.addEventListener('scroll', unmuteOnGesture, true);
    window.addEventListener('touchstart', unmuteOnGesture);

    const init = () => {
      ytPlayerRef.current = new window.YT.Player('yt-player', {
        videoId: 'fJ0o57DOIiA',
        playerVars: { start: 15, controls: 0, disablekb: 1, playsinline: 1, autoplay: 1, mute: 1 },
        events: {
          onReady: (e: any) => {
            e.target.seekTo(15, true);
            e.target.playVideo();
            setMusicPlaying(true);
          },
          onError: (e: any) => console.error('YT player error', e.data),
        },
      });
    };

    if (window.YT?.Player) {
      init();
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        init();
      };
    }

    return () => {
      window.removeEventListener('pointerdown', unmuteOnGesture);
      window.removeEventListener('scroll', unmuteOnGesture, true);
      window.removeEventListener('touchstart', unmuteOnGesture);
    };
  }, []);

  const toggleMusic = () => {
    const p = ytPlayerRef.current;
    if (!p) return;
    if (musicPlaying) {
      p.pauseVideo();
      setMusicPlaying(false);
    } else {
      p.seekTo(15, true);
      p.playVideo();
      setMusicPlaying(true);
    }
  };

  const copyValue = (key: string, value: string) => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1800);
  };

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: i * el.clientHeight, behavior: 'smooth' });
  };

  return (
    <>
      <div id="yt-player" style={{ position: 'fixed', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }} />

      <div ref={scrollerRef} onScroll={onScroll} className="scroller" style={{ width: '100%' }}>

        {/* Hero */}
        <section data-screen-label="Hero" className="page" style={{ paddingBottom: 96, color: 'oklch(0.98 0.005 0)' }}>
          <img src="/assets/couple-hero.jpg" alt="Layla & Ahmad" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', zIndex: 0, filter: 'grayscale(100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, oklch(0.25 0.03 320 / 0.35) 0%, oklch(0.2 0.03 320 / 0.55) 65%, oklch(0.18 0.03 320 / 0.7) 100%)', zIndex: 1, pointerEvents: 'none' }} />
          <ElegantCorners />
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'oklch(0.95 0.01 330)', margin: '0 0 14px' }}>Together with their families</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: 'clamp(40px,11vw,72px)', lineHeight: 1.05, color: 'oklch(0.99 0.005 0)', margin: 0 }}>{COUPLE_NAMES}</h1>
            <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, color: 'oklch(0.92 0.01 330)', margin: '12px 0 0' }}>request the honor of your presence at their wedding</p>
            <div style={{ width: 40, height: 1, background: 'oklch(0.9 0.02 330 / 0.7)', margin: '18px 0' }} />
            <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 15, letterSpacing: '0.08em', color: 'oklch(0.98 0.005 0)', margin: 0 }}>{WEDDING_DATE_LONG}</p>
            <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, color: 'oklch(0.9 0.01 330)', margin: '5px 0 0' }}>{VENUE_NAME}</p>
          </div>
          <div style={{ position: 'absolute', bottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: 'bounceDown 2.2s ease-in-out infinite', zIndex: 2 }}>
            <span style={{ fontFamily: "'Jost',sans-serif", fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'oklch(0.95 0.01 330)' }}>Scroll</span>
            <div style={{ width: 1, height: 20, background: 'oklch(0.95 0.01 330 / 0.7)' }} />
          </div>
        </section>

        {/* Date */}
        <section data-screen-label="Date" className="page" style={{ background: 'linear-gradient(160deg, oklch(0.96 0.02 300) 0%, oklch(0.94 0.03 320) 100%)' }}>
          <RoseCorners />
          <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'oklch(0.45 0.07 310)', margin: '0 0 20px' }}>Save the date</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: 'clamp(64px,22vw,140px)', lineHeight: 0.9, color: 'oklch(0.28 0.03 310)', margin: 0 }}>24</h2>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 'clamp(26px,6vw,38px)', color: 'oklch(0.35 0.04 310)', margin: '10px 0 0' }}>September 2026</p>
          <div style={{ display: 'flex', gap: 22, marginTop: 40 }}>
            {COUNTDOWN_PARTS.map((part) => (
              <div key={part.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56 }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, color: 'oklch(0.3 0.05 320)' }}>{part.value}</span>
                <span style={{ fontFamily: "'Jost',sans-serif", fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'oklch(0.5 0.03 320)', marginTop: 4 }}>{part.label}</span>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 15, color: 'oklch(0.42 0.03 320)', marginTop: 38, maxWidth: 340, lineHeight: 1.6 }}>We would be honored by your presence as we exchange our vows.</p>
        </section>

        {/* Venue */}
        <section data-screen-label="Venue" className="page" style={{ color: 'oklch(0.98 0.005 0)' }}>
          <img src="/assets/venue-bw.jpg" alt="Roche Doree" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, oklch(0.25 0.03 330 / 0.35) 0%, oklch(0.2 0.03 330 / 0.55) 65%, oklch(0.18 0.03 330 / 0.7) 100%)', zIndex: 1, pointerEvents: 'none' }} />
          <ElegantCorners />
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'oklch(0.95 0.01 330)', margin: '0 0 20px' }}>The venue</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 500, fontSize: 'clamp(30px,7vw,44px)', color: 'oklch(0.99 0.005 0)', margin: '0 0 14px', lineHeight: 1.15 }}>{VENUE_NAME}</h2>
            <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 15, color: 'oklch(0.92 0.01 330)', margin: '0 0 28px', maxWidth: 320, lineHeight: 1.6 }}>{VENUE_ADDRESS}</p>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid oklch(0.95 0.01 330 / 0.8)', borderRadius: 30, padding: '12px 30px', color: 'oklch(0.98 0.005 0)' }}>View on Map</a>
          </div>
        </section>

        {/* Registry */}
        <section data-screen-label="Registry" className="page" style={{ background: 'linear-gradient(160deg, oklch(0.94 0.03 320) 0%, oklch(0.96 0.02 300) 100%)' }}>
          <RoseCorners />
          <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'oklch(0.45 0.07 310)', margin: '0 0 16px' }}>Liste de Mariage</p>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 'clamp(20px,5vw,26px)', color: 'oklch(0.32 0.03 320)', lineHeight: 1.5, maxWidth: 340, margin: '0 0 30px' }}>
            Your presence is the greatest gift of all. For those who wish to honor us further, we thank you.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 'min(300px,84vw)' }}>
            {GIFT_OPTIONS.map((opt) => (
              <div key={opt.key} style={{ position: 'relative', background: 'oklch(0.99 0.005 320)', border: '1px solid oklch(0.85 0.02 320)', borderRadius: 10, padding: '16px 18px', textAlign: 'left', overflow: 'hidden' }}>
                <img src="/assets/corner-vine.png" alt="" style={{ position: 'absolute', bottom: -1, right: -1, width: 64, height: 'auto', opacity: 0.55, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 6px' }}>
                  {opt.showLogo && <img src="/assets/whish-logo.png" alt="Whish Money" style={{ width: 72, height: 22, objectFit: 'contain', flexShrink: 0 }} />}
                  <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'oklch(0.5 0.04 320)', margin: 0 }}>{opt.label}</p>
                </div>
                <p style={{ fontFamily: "'Courier New',monospace", fontSize: 18, color: 'oklch(0.28 0.03 320)', margin: '0 0 10px', letterSpacing: '0.04em', position: 'relative' }}>{opt.value}</p>
                <button
                  onClick={() => copyValue(opt.key, opt.value.replace(/\s/g, ''))}
                  style={{ fontFamily: "'Jost',sans-serif", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'none', border: '1px solid oklch(0.6 0.06 325)', borderRadius: 20, padding: '7px 16px', color: 'oklch(0.4 0.06 325)', cursor: 'pointer', position: 'relative' }}
                >
                  {copiedKey === opt.key ? 'Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* RSVP */}
        <section data-screen-label="RSVP" className="page" style={{ background: 'linear-gradient(160deg, oklch(0.94 0.03 320) 0%, oklch(0.96 0.02 300) 100%)' }}>
          <RoseCorners />
          <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'oklch(0.45 0.07 310)', margin: '0 0 18px' }}>RSVP</p>
          {!rsvpChoice ? (
            <>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 'clamp(22px,5.5vw,30px)', color: 'oklch(0.3 0.03 320)', margin: '0 0 30px', maxWidth: 320, lineHeight: 1.4 }}>Will you be joining us?</p>
              <div style={{ display: 'flex', gap: 16 }}>
                <button onClick={() => setRsvpChoice('yes')} style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'oklch(0.55 0.08 325)', color: 'oklch(0.99 0.005 0)', border: 'none', borderRadius: 30, padding: '14px 32px', cursor: 'pointer' }}>Yes</button>
                <button onClick={() => setRsvpChoice('no')} style={{ fontFamily: "'Jost',sans-serif", fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', color: 'oklch(0.4 0.06 325)', border: '1px solid oklch(0.6 0.06 325)', borderRadius: 30, padding: '14px 32px', cursor: 'pointer' }}>No</button>
              </div>
            </>
          ) : (
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 'clamp(22px,5.5vw,30px)', color: 'oklch(0.3 0.03 320)', margin: 0, maxWidth: 320, lineHeight: 1.4 }}>
              {rsvpChoice === 'yes' ? "Wonderful — we can't wait to celebrate with you!" : "We'll miss you, but thank you for letting us know."}
            </p>
          )}
        </section>

        {/* Closing */}
        <section data-screen-label="Closing" className="page" style={{ background: 'linear-gradient(160deg, oklch(0.93 0.03 320) 0%, oklch(0.95 0.025 350) 100%)' }}>
          <RoseCorners />
          <div style={{ position: 'relative', width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 10, fontFamily: "'Cormorant Garamond',serif", fontSize: 88, lineHeight: 1, color: 'oklch(0.62 0.06 320)', pointerEvents: 'none' }}>&ldquo;</span>
            <img src="/assets/closing-photo.jpg" alt={COUPLE_NAMES} style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', marginBottom: 28, filter: 'grayscale(100%)' }} />
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 'clamp(22px,5.5vw,30px)', color: 'oklch(0.32 0.03 320)', lineHeight: 1.5, margin: '0 0 24px' }}>
              With gratitude, we look forward to celebrating this moment with you.
            </p>
            <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 16, letterSpacing: '0.1em', color: 'oklch(0.4 0.04 320)', margin: 0 }}>{COUPLE_NAMES}</p>
            <p style={{ fontFamily: "'Jost',sans-serif", fontSize: 12, letterSpacing: '0.08em', color: 'oklch(0.5 0.03 320)', marginTop: 8 }}>{WEDDING_DATE_LONG}</p>
            <span aria-hidden="true" style={{ position: 'absolute', right: 0, bottom: -20, fontFamily: "'Cormorant Garamond',serif", fontSize: 88, lineHeight: 1, color: 'oklch(0.62 0.06 320)', pointerEvents: 'none' }}>&rdquo;</span>
          </div>
        </section>
      </div>

      <div style={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 10 }}>
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: 7, height: 7, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
              background: activeIndex === i ? 'oklch(0.5 0.08 330)' : 'oklch(0.75 0.03 320)',
            }}
          />
        ))}
      </div>
    </>
  );
}
