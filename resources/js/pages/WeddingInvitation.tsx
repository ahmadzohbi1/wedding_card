import { useEffect, useMemo, useRef, useState } from 'react';
import { getCsrfToken } from '../lib/csrf';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

type RsvpStatus = 'pending' | 'yes' | 'no';

type GuestMember = {
  id: number;
  name: string;
  is_primary: boolean;
  rsvp_status: RsvpStatus;
};

export type GuestData = {
  slug: string;
  name: string;
  members: GuestMember[];
};

type Lang = 'en' | 'ar';

const COUPLE_NAMES: Record<Lang, string> = { en: 'Ahmad & Layla', ar: 'أحمد وليلى' };
const WEDDING_DATE_LONG: Record<Lang, string> = { en: 'Thursday, September 24, 2026', ar: 'الخميس، 24 سبتمبر 2026' };
const WEDDING_DATE_TARGET = new Date(2026, 8, 24, 20, 0, 0);
const VENUE_NAME: Record<Lang, string> = { en: 'Roche Doree', ar: 'روش دوريه' };
const VENUE_ADDRESS: Record<Lang, string> = { en: 'Roche Doree — address to follow', ar: 'روش دوريه — لمعرفة العنوان' };
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VENUE_NAME.en)}`;

const TRANSLATIONS = {
  en: {
    dear: (name: string) => `Dear ${name}`,
    guestFallback: 'Guest',
    joinStory: 'Join Our Story',
    togetherWithFamilies: 'Together with their families',
    honorRequest: 'request the honor of your presence at their wedding',
    scroll: 'Scroll',
    saveTheDate: 'Save the date',
    dateDay: '24',
    dateMonthYear: 'September 2026',
    ceremonyTime: '08:00 PM',
    weeks: 'Weeks',
    days: 'Days',
    hours: 'Hours',
    mins: 'Mins',
    honoredPresence: 'We would be honored by your presence at our wedding.',
    theVenue: 'The venue',
    viewOnMap: 'View on Map',
    registryTitle: 'Liste de Mariage',
    registryText: 'Your presence is the greatest gift of all. For those who wish to honor us further, we thank you.',
    whishAccount: 'Whish Account',
    iban: 'IBAN',
    copy: 'Copy',
    copied: 'Copied',
    rsvp: 'RSVP',
    rsvpDeadline: 'Please submit before 15/09 so we can make sure who is coming and who is not.',
    willJoin: (name: string) => `Will ${name} and party be joining us?`,
    yes: 'Yes',
    no: 'No',
    saveRsvp: 'Save RSVP',
    saving: 'Saving…',
    answerEveryone: 'Please answer for everyone in your party.',
    rsvpError: 'Something went wrong — please try again.',
    rsvpSaved: 'Thank you — your response has been saved. You can update it anytime.',
    willYouJoin: 'Will you be joining us?',
    yesResponse: "Wonderful — we can't wait to celebrate with you!",
    noResponse: "We'll miss you, but thank you for letting us know.",
    closingQuote: 'With gratitude, we look forward to celebrate this moment with you.',
    sweetDreams: 'Sweet dreams for your kids',
    switchTo: 'Switch to Arabic',
    changeLanguageHint: 'Change language',
    volumeHint: 'Turn up your volume & unmute for the full experience',
  },
  ar: {
    dear: (name: string) => `عزيزي/عزيزتي ${name}`,
    guestFallback: 'ضيفنا العزيز',
    joinStory: 'ادخل إلى قصتنا',
    togetherWithFamilies: 'بصحبة عائلتيهما الكريمتين',
    honorRequest: 'يتشرفان بدعوتكم لحضور حفل زفافهما',
    scroll: 'مرر للأسفل',
    saveTheDate: 'احفظوا التاريخ',
    dateDay: '24',
    dateMonthYear: 'سبتمبر 2026',
    ceremonyTime: '8:00 مساءً',
    weeks: 'أسابيع',
    days: 'أيام',
    hours: 'ساعات',
    mins: 'دقائق',
    honoredPresence: 'يسعدنا حضوركم لحفل زفافنا.',
    theVenue: 'مكان الحفل',
    viewOnMap: 'عرض على الخريطة',
    registryTitle: 'قائمة هدايا الزفاف',
    registryText: 'حضوركم هو أغلى هدية بالنسبة لنا. ولمن يرغب في تكريمنا أكثر، نتقدم بجزيل الشكر.',
    whishAccount: 'حساب Whish',
    iban: 'IBAN',
    copy: 'نسخ',
    copied: 'تم النسخ',
    rsvp: 'تأكيد الحضور',
    rsvpDeadline: 'يرجى تأكيد الحضور قبل 15/09 حتى نتمكن من معرفة الحاضرين والمعتذرين.',
    willJoin: (name: string) => `هل سينضم ${name} ومرافقوه إلينا؟`,
    yes: 'نعم',
    no: 'لا',
    saveRsvp: 'حفظ الرد',
    saving: 'جارٍ الحفظ…',
    answerEveryone: 'يرجى الرد نيابة عن جميع أفراد مجموعتكم.',
    rsvpError: 'حدث خطأ ما — يرجى المحاولة مرة أخرى.',
    rsvpSaved: 'شكرًا لكم — تم حفظ ردكم. يمكنكم تحديثه في أي وقت.',
    willYouJoin: 'هل ستنضمون إلينا؟',
    yesResponse: 'رائع — لا يسعنا الانتظار للاحتفال معكم!',
    noResponse: 'سنفتقدكم، ولكن شكرًا لإعلامنا.',
    closingQuote: 'بكل امتنان، نتطلع للاحتفال بهذه اللحظة معكم.',
    sweetDreams: 'أحلامًا سعيدة لأطفالكم',
    switchTo: 'التبديل إلى الإنجليزية',
    changeLanguageHint: 'تغيير اللغة',
    volumeHint: 'ارفعوا صوت الجهاز وألغوا الكتم للاستمتاع بالتجربة كاملة',
  },
} as const;

function getCountdownParts(now: Date) {
  const diffMs = Math.max(0, WEDDING_DATE_TARGET.getTime() - now.getTime());
  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  return [
    { value: Math.floor(totalDays / 7), labelKey: 'weeks' as const },
    { value: totalDays % 7, labelKey: 'days' as const },
    { value: totalHours % 24, labelKey: 'hours' as const },
    { value: totalMinutes % 60, labelKey: 'mins' as const },
  ];
}

const GIFT_OPTIONS = [
  { key: 'phone', labelKey: 'whishAccount' as const, value: '+961 71 835 077', showLogo: true },
  { key: 'iban', labelKey: 'iban' as const, value: 'LB07 0056 9984 0103 5017 8293 0002', showLogo: false },
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
      <div style={line({ top: 18, left: 18, width: 64, height: 64, borderTop: '1px solid oklch(from var(--brand) 0.97 0.01 h / 0.85)', borderLeft: '1px solid oklch(from var(--brand) 0.97 0.01 h / 0.85)' })} />
      <div style={line({ top: 26, left: 26, width: 44, height: 44, borderTop: '1px solid oklch(from var(--brand) 0.97 0.01 h / 0.55)', borderLeft: '1px solid oklch(from var(--brand) 0.97 0.01 h / 0.55)' })} />
      <div style={line({ bottom: 18, right: 18, width: 64, height: 64, borderBottom: '1px solid oklch(from var(--brand) 0.97 0.01 h / 0.85)', borderRight: '1px solid oklch(from var(--brand) 0.97 0.01 h / 0.85)' })} />
      <div style={line({ bottom: 26, right: 26, width: 44, height: 44, borderBottom: '1px solid oklch(from var(--brand) 0.97 0.01 h / 0.55)', borderRight: '1px solid oklch(from var(--brand) 0.97 0.01 h / 0.55)' })} />
    </>
  );
}

export default function WeddingInvitationPage({ guest, showKidsMessage = true }: { guest?: GuestData; showKidsMessage?: boolean }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [rsvpChoice, setRsvpChoice] = useState<'yes' | 'no' | null>(null);
  const [entered, setEntered] = useState(false);
  const [gateVisible, setGateVisible] = useState(true);

  const [lang, setLang] = useState<Lang>('en');
  const [translating, setTranslating] = useState(false);
  const t = TRANSLATIONS[lang];
  const fontSerif = lang === 'ar' ? "'Amiri', serif" : "'Cormorant Garamond', serif";
  const fontSans = lang === 'ar' ? "'Cairo', sans-serif" : "'Jost', sans-serif";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const toggleLang = () => {
    setTranslating(true);
    setTimeout(() => {
      setLang((l) => (l === 'en' ? 'ar' : 'en'));
      setTranslating(false);
    }, 320);
  };

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const countdownParts = useMemo(() => getCountdownParts(now), [now]);

  const [memberChoices, setMemberChoices] = useState<Record<number, 'yes' | 'no' | undefined>>(() =>
    Object.fromEntries((guest?.members ?? []).map((m) => [m.id, m.rsvp_status === 'pending' ? undefined : m.rsvp_status])),
  );
  const [rsvpSaving, setRsvpSaving] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [rsvpSaved, setRsvpSaved] = useState(false);

  const allMembersAnswered = useMemo(
    () => (guest?.members ?? []).every((m) => memberChoices[m.id] !== undefined),
    [guest, memberChoices],
  );

  const submitRsvp = async () => {
    if (!guest) return;
    setRsvpSaving(true);
    setRsvpError(null);
    try {
      const responses = guest.members
        .filter((m) => memberChoices[m.id] !== undefined)
        .map((m) => ({ member_id: m.id, status: memberChoices[m.id] }));

      const res = await fetch(`/rsvp/${guest.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({ responses }),
      });

      if (!res.ok) throw new Error('Request failed');
      setRsvpSaved(true);
    } catch {
      setRsvpError(t.rsvpError);
    } finally {
      setRsvpSaving(false);
    }
  };

  useEffect(() => {
    const init = () => {
      ytPlayerRef.current = new window.YT.Player('yt-player', {
        videoId: 'fJ0o57DOIiA',
        playerVars: { start: 15, controls: 0, disablekb: 1, playsinline: 1, autoplay: 0, mute: 0 },
        events: {
          onReady: (e: any) => {
            e.target.seekTo(15, true);
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
  }, []);

  const handleEnter = () => {
    setEntered(true);
    setTimeout(() => setGateVisible(false), 900);
    const p = ytPlayerRef.current;
    if (p?.playVideo) {
      p.seekTo(15, true);
      p.playVideo();
      setMusicPlaying(true);
    }
  };

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

  const [revealedSections, setRevealedSections] = useState<Set<number>>(() => new Set([0]));
  useEffect(() => {
    setRevealedSections((prev) => (prev.has(activeIndex) ? prev : new Set(prev).add(activeIndex)));
  }, [activeIndex]);

  const reveal = (index: number): React.CSSProperties => ({
    opacity: revealedSections.has(index) ? 1 : 0,
    transform: revealedSections.has(index) ? 'translateY(0)' : 'translateY(18px)',
    transition: 'opacity 650ms cubic-bezier(0.33, 0, 0.2, 1), transform 650ms cubic-bezier(0.33, 0, 0.2, 1)',
  });

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

      <button
        onClick={toggleLang}
        aria-label={t.switchTo}
        style={{
          position: 'fixed',
          top: 18,
          right: 16,
          zIndex: 300,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid #D8B4C5',
          background: '#D8B4C5',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: lang === 'en' ? "'Amiri', serif" : "'Cormorant Garamond', serif",
          fontSize: 17,
          color: 'oklch(from var(--brand) 0.4 0.07 h)',
          cursor: 'pointer',
          boxShadow: '0 2px 12px oklch(from var(--brand) 0.3 0.03 h / 0.3)',
        }}
      >
        {lang === 'en' ? 'ع' : 'E'}
      </button>

      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ opacity: translating ? 0 : 1, transition: 'opacity 320ms ease' }}>
        {gateVisible && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '48px 28px',
              opacity: entered ? 0 : 1,
              transition: 'opacity 900ms ease',
              pointerEvents: entered ? 'none' : 'auto',
            }}
          >
            <img
              src="/assets/couple-hero.jpg"
              alt=""
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', filter: 'grayscale(100%) blur(22px)', transform: 'scale(1.15)', zIndex: 0 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, oklch(from var(--brand) 0.25 0.03 h / 0.55) 0%, oklch(from var(--brand) 0.2 0.03 h / 0.65) 65%, oklch(from var(--brand) 0.18 0.03 h / 0.75) 100%)', zIndex: 1 }} />

            <div style={{ position: 'absolute', top: 38, right: 60, transform: 'translateY(-50%)', zIndex: 2, direction: 'ltr', display: 'flex', alignItems: 'center', gap: 8, color: 'oklch(var(--color-paper))' }}>
              <span style={{ fontFamily: fontSans, fontSize: 10, letterSpacing: '0.1em', textTransform: lang === 'en' ? 'uppercase' : 'none', whiteSpace: 'nowrap' }}>{t.changeLanguageHint}</span>
              <svg width="26" height="14" viewBox="0 0 26 14" fill="none" style={{ flexShrink: 0, animation: 'hoverSideways 1.4s ease-in-out infinite' }}>
                <line x1="0" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path d="M14 2 L20 7 L14 12" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontFamily: fontSans, fontSize: 13, letterSpacing: '0.3em', textTransform: lang === 'en' ? 'uppercase' : 'none', color: 'oklch(var(--color-paper))', margin: '0 0 24px' }}>{t.dear(guest?.name ?? t.guestFallback)}</p>
              <button
                onClick={handleEnter}
                style={{ fontFamily: fontSans, fontSize: 13, letterSpacing: '0.1em', textTransform: lang === 'en' ? 'uppercase' : 'none', background: 'oklch(from var(--brand) 0.55 0.08 h)', color: 'oklch(var(--color-paper))', border: 'none', borderRadius: 30, padding: '16px 40px', cursor: 'pointer' }}
              >
                {t.joinStory}
              </button>
            </div>

            <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 40px', color: 'oklch(from var(--brand) 0.95 0.01 h)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0 }}>
                <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" stroke="none" />
                <path d="M16 8a5 5 0 0 1 0 8" strokeLinecap="round" />
                <path d="M18.5 5.5a9 9 0 0 1 0 13" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: fontSans, fontSize: 11, letterSpacing: '0.04em', textAlign: 'center' }}>{t.volumeHint}</span>
            </div>
          </div>
        )}

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="scroller"
          style={{ width: '100%', opacity: entered ? 1 : 0, transition: 'opacity 1000ms ease 150ms' }}
        >

          {/* Hero */}
          <section data-screen-label="Hero" className="page" style={{ paddingBottom: 96, color: 'oklch(var(--color-paper))' }}>
            <img src="/assets/couple-hero.jpg" alt={COUPLE_NAMES[lang]} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', zIndex: 0, filter: 'grayscale(100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, oklch(from var(--brand) 0.25 0.03 h / 0.35) 0%, oklch(from var(--brand) 0.2 0.03 h / 0.55) 65%, oklch(from var(--brand) 0.18 0.03 h / 0.7) 100%)', zIndex: 1, pointerEvents: 'none' }} />
            <ElegantCorners />
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', ...reveal(0) }}>
              <p style={{ fontFamily: fontSans, fontSize: 12, letterSpacing: '0.3em', textTransform: lang === 'en' ? 'uppercase' : 'none', color: 'oklch(from var(--brand) 0.95 0.01 h)', margin: '0 0 14px' }}>{t.togetherWithFamilies}</p>
              <h1 style={{ fontFamily: fontSerif, fontWeight: 500, fontSize: 'clamp(40px,11vw,72px)', lineHeight: 1.05, color: 'oklch(var(--color-paper))', margin: 0 }}>{COUPLE_NAMES[lang]}</h1>
              <p style={{ fontFamily: fontSans, fontSize: 13, color: 'oklch(from var(--brand) 0.92 0.01 h)', margin: '12px 0 0' }}>{t.honorRequest}</p>
              <div style={{ width: 40, height: 1, background: 'oklch(from var(--brand) 0.9 0.02 h / 0.7)', margin: '18px 0' }} />
              <p style={{ fontFamily: fontSans, fontSize: 15, letterSpacing: '0.08em', color: 'oklch(var(--color-paper))', margin: 0 }}>{WEDDING_DATE_LONG[lang]}</p>
              <p style={{ fontFamily: fontSans, fontSize: 13, color: 'oklch(from var(--brand) 0.9 0.01 h)', margin: '5px 0 0' }}>{VENUE_NAME[lang]}</p>
            </div>
            <div style={{ position: 'absolute', bottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: 'bounceDown 2.2s ease-in-out infinite', zIndex: 2 }}>
              <span style={{ fontFamily: fontSans, fontSize: 10, letterSpacing: '0.25em', textTransform: lang === 'en' ? 'uppercase' : 'none', color: 'oklch(from var(--brand) 0.95 0.01 h)' }}>{t.scroll}</span>
              <div style={{ width: 1, height: 20, background: 'oklch(from var(--brand) 0.95 0.01 h / 0.7)' }} />
            </div>
          </section>

          {/* Date */}
          <section data-screen-label="Date" className="page" style={{ background: 'linear-gradient(160deg, oklch(from var(--brand) 0.96 0.02 h) 0%, oklch(from var(--brand) 0.94 0.03 h) 100%)' }}>
            <RoseCorners />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...reveal(1) }}>
              <p style={{ fontFamily: fontSans, fontSize: 13, letterSpacing: '0.3em', textTransform: lang === 'en' ? 'uppercase' : 'none', color: 'oklch(from var(--brand) 0.45 0.07 h)', margin: '0 0 20px' }}>{t.saveTheDate}</p>
              <h2 style={{ fontFamily: fontSerif, fontWeight: 500, fontSize: 'clamp(64px,22vw,140px)', lineHeight: 0.9, color: 'oklch(from var(--brand) 0.28 0.03 h)', margin: 0 }}>{t.dateDay}</h2>
              <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 'clamp(26px,6vw,38px)', color: 'oklch(from var(--brand) 0.35 0.04 h)', margin: '10px 0 0' }}>{t.dateMonthYear}</p>
              <p style={{ fontFamily: fontSans, fontSize: 14, letterSpacing: '0.2em', textTransform: lang === 'en' ? 'uppercase' : 'none', color: 'oklch(from var(--brand) 0.45 0.05 h)', margin: '14px 0 0' }}>{t.ceremonyTime}</p>
              <div style={{ display: 'flex', gap: 14, marginTop: 40 }}>
                {countdownParts.map((part) => (
                  <div key={part.labelKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
                    <span style={{ fontFamily: fontSerif, fontSize: 32, color: 'oklch(from var(--brand) 0.3 0.05 h)' }}>{part.value}</span>
                    <span style={{ fontFamily: fontSans, fontSize: 10, letterSpacing: '0.15em', textTransform: lang === 'en' ? 'uppercase' : 'none', color: 'oklch(from var(--brand) 0.5 0.03 h)', marginTop: 4 }}>{t[part.labelKey]}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: fontSans, fontSize: 15, color: 'oklch(from var(--brand) 0.42 0.03 h)', marginTop: 38, maxWidth: 340, lineHeight: 1.6 }}>{t.honoredPresence}</p>
            </div>
          </section>

          {/* Venue */}
          <section data-screen-label="Venue" className="page" style={{ color: 'oklch(var(--color-paper))' }}>
            <img src="/assets/venue-bw.jpg" alt={VENUE_NAME[lang]} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, oklch(from var(--brand) 0.25 0.03 h / 0.35) 0%, oklch(from var(--brand) 0.2 0.03 h / 0.55) 65%, oklch(from var(--brand) 0.18 0.03 h / 0.7) 100%)', zIndex: 1, pointerEvents: 'none' }} />
            <ElegantCorners />
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', ...reveal(2) }}>
              <p style={{ fontFamily: fontSans, fontSize: 13, letterSpacing: '0.3em', textTransform: lang === 'en' ? 'uppercase' : 'none', color: 'oklch(from var(--brand) 0.95 0.01 h)', margin: '0 0 20px' }}>{t.theVenue}</p>
              <h2 style={{ fontFamily: fontSerif, fontWeight: 500, fontSize: 'clamp(30px,7vw,44px)', color: 'oklch(var(--color-paper))', margin: '0 0 14px', lineHeight: 1.15 }}>{VENUE_NAME[lang]}</h2>
              <p style={{ fontFamily: fontSans, fontSize: 15, color: 'oklch(from var(--brand) 0.92 0.01 h)', margin: '0 0 28px', maxWidth: 320, lineHeight: 1.6 }}>{VENUE_ADDRESS[lang]}</p>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" style={{ fontFamily: fontSans, fontSize: 13, letterSpacing: '0.1em', textTransform: lang === 'en' ? 'uppercase' : 'none', border: '1px solid oklch(from var(--brand) 0.95 0.01 h / 0.8)', borderRadius: 30, padding: '12px 30px', color: 'oklch(var(--color-paper))' }}>{t.viewOnMap}</a>
            </div>
          </section>

          {/* RSVP */}
          <section data-screen-label="RSVP" className="page" style={{ background: 'linear-gradient(160deg, oklch(from var(--brand) 0.94 0.03 h) 0%, oklch(from var(--brand) 0.96 0.02 h) 100%)' }}>
            <RoseCorners />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...reveal(3) }}>
            <p style={{ fontFamily: fontSans, fontSize: 13, letterSpacing: '0.3em', textTransform: lang === 'en' ? 'uppercase' : 'none', color: 'oklch(from var(--brand) 0.45 0.07 h)', margin: '0 0 10px' }}>{t.rsvp}</p>
            <p style={{ fontFamily: fontSans, fontSize: 13, color: 'oklch(from var(--brand) 0.5 0.04 h)', margin: '0 0 18px', maxWidth: 320, lineHeight: 1.5 }}>{t.rsvpDeadline}</p>
            {guest ? (
              <>
                <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 'clamp(20px,5vw,26px)', color: 'oklch(from var(--brand) 0.3 0.03 h)', margin: '0 0 26px', maxWidth: 340, lineHeight: 1.4 }}>
                  {t.willJoin(guest.name)}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 'min(320px,86vw)' }}>
                  {guest.members.map((member) => (
                    <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: 'oklch(from var(--brand) 0.99 0.005 h)', border: '1px solid oklch(from var(--brand) 0.85 0.02 h)', borderRadius: 10, padding: '10px 14px' }}>
                      <span style={{ fontFamily: fontSans, fontSize: 14, color: 'oklch(from var(--brand) 0.3 0.03 h)' }}>{member.name}</span>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button
                          onClick={() => { setMemberChoices((c) => ({ ...c, [member.id]: 'yes' })); setRsvpSaved(false); }}
                          style={{ fontFamily: fontSans, fontSize: 11, letterSpacing: '0.08em', textTransform: lang === 'en' ? 'uppercase' : 'none', border: '1px solid oklch(from var(--brand) 0.55 0.08 h)', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', background: memberChoices[member.id] === 'yes' ? 'oklch(from var(--brand) 0.55 0.08 h)' : 'none', color: memberChoices[member.id] === 'yes' ? 'oklch(var(--color-paper))' : 'oklch(from var(--brand) 0.4 0.06 h)' }}
                        >
                          {t.yes}
                        </button>
                        <button
                          onClick={() => { setMemberChoices((c) => ({ ...c, [member.id]: 'no' })); setRsvpSaved(false); }}
                          style={{ fontFamily: fontSans, fontSize: 11, letterSpacing: '0.08em', textTransform: lang === 'en' ? 'uppercase' : 'none', border: '1px solid oklch(from var(--brand) 0.6 0.06 h)', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', background: memberChoices[member.id] === 'no' ? 'oklch(from var(--brand) 0.5 0.05 h)' : 'none', color: memberChoices[member.id] === 'no' ? 'oklch(var(--color-paper))' : 'oklch(from var(--brand) 0.4 0.06 h)' }}
                        >
                          {t.no}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={submitRsvp}
                  disabled={!allMembersAnswered || rsvpSaving}
                  style={{ marginTop: 22, fontFamily: fontSans, fontSize: 13, letterSpacing: '0.1em', textTransform: lang === 'en' ? 'uppercase' : 'none', background: !allMembersAnswered || rsvpSaving ? 'oklch(from var(--brand) 0.8 0.02 h)' : 'oklch(from var(--brand) 0.55 0.08 h)', color: 'oklch(var(--color-paper))', border: 'none', borderRadius: 30, padding: '14px 36px', cursor: !allMembersAnswered || rsvpSaving ? 'not-allowed' : 'pointer' }}
                >
                  {rsvpSaving ? t.saving : t.saveRsvp}
                </button>
                {!allMembersAnswered && (
                  <p style={{ fontFamily: fontSans, fontSize: 12, color: 'oklch(from var(--brand) 0.5 0.03 h)', marginTop: 12 }}>{t.answerEveryone}</p>
                )}
                {rsvpError && (
                  <p style={{ fontFamily: fontSans, fontSize: 12, color: 'oklch(var(--color-danger))', marginTop: 12 }}>{rsvpError}</p>
                )}
                {rsvpSaved && !rsvpError && (
                  <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 18, color: 'oklch(from var(--brand) 0.35 0.06 h)', marginTop: 14 }}>{t.rsvpSaved}</p>
                )}
              </>
            ) : !rsvpChoice ? (
              <>
                <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 'clamp(22px,5.5vw,30px)', color: 'oklch(from var(--brand) 0.3 0.03 h)', margin: '0 0 30px', maxWidth: 320, lineHeight: 1.4 }}>{t.willYouJoin}</p>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button onClick={() => setRsvpChoice('yes')} style={{ fontFamily: fontSans, fontSize: 13, letterSpacing: '0.1em', textTransform: lang === 'en' ? 'uppercase' : 'none', background: 'oklch(from var(--brand) 0.55 0.08 h)', color: 'oklch(var(--color-paper))', border: 'none', borderRadius: 30, padding: '14px 32px', cursor: 'pointer' }}>{t.yes}</button>
                  <button onClick={() => setRsvpChoice('no')} style={{ fontFamily: fontSans, fontSize: 13, letterSpacing: '0.1em', textTransform: lang === 'en' ? 'uppercase' : 'none', background: 'none', color: 'oklch(from var(--brand) 0.4 0.06 h)', border: '1px solid oklch(from var(--brand) 0.6 0.06 h)', borderRadius: 30, padding: '14px 32px', cursor: 'pointer' }}>{t.no}</button>
                </div>
              </>
            ) : (
              <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 'clamp(22px,5.5vw,30px)', color: 'oklch(from var(--brand) 0.3 0.03 h)', margin: 0, maxWidth: 320, lineHeight: 1.4 }}>
                {rsvpChoice === 'yes' ? t.yesResponse : t.noResponse}
              </p>
            )}
            </div>
          </section>

          {/* Registry */}
          <section data-screen-label="Registry" className="page" style={{ background: 'linear-gradient(160deg, oklch(from var(--brand) 0.94 0.03 h) 0%, oklch(from var(--brand) 0.96 0.02 h) 100%)' }}>
            <RoseCorners />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...reveal(4) }}>
              <p style={{ fontFamily: fontSans, fontSize: 13, letterSpacing: '0.3em', textTransform: lang === 'en' ? 'uppercase' : 'none', color: 'oklch(from var(--brand) 0.45 0.07 h)', margin: '0 0 16px' }}>{t.registryTitle}</p>
              <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 'clamp(20px,5vw,26px)', color: 'oklch(from var(--brand) 0.32 0.03 h)', lineHeight: 1.5, maxWidth: 340, margin: '0 0 30px' }}>
                {t.registryText}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 'min(300px,84vw)' }}>
                {GIFT_OPTIONS.map((opt) => (
                  <div key={opt.key} style={{ position: 'relative', background: 'oklch(from var(--brand) 0.99 0.005 h)', border: '1px solid oklch(from var(--brand) 0.85 0.02 h)', borderRadius: 10, padding: '16px 18px', textAlign: 'left', overflow: 'hidden' }}>
                    <img src="/assets/corner-vine.png" alt="" style={{ position: 'absolute', bottom: -1, right: -1, width: 64, height: 'auto', opacity: 0.55, pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 6px' }}>
                      {opt.showLogo && <img src="/assets/whish-logo.png" alt="Whish Money" style={{ width: 72, height: 22, objectFit: 'contain', flexShrink: 0 }} />}
                      <p style={{ fontFamily: fontSans, fontSize: 11, letterSpacing: '0.15em', textTransform: lang === 'en' ? 'uppercase' : 'none', color: 'oklch(from var(--brand) 0.5 0.04 h)', margin: 0 }}>{t[opt.labelKey]}</p>
                    </div>
                    <p dir="ltr" style={{ fontFamily: "'Courier New',monospace", fontSize: 18, color: 'oklch(from var(--brand) 0.28 0.03 h)', margin: '0 0 10px', letterSpacing: '0.04em', position: 'relative', textAlign: 'left' }}>{opt.value}</p>
                    <button
                      onClick={() => copyValue(opt.key, opt.value.replace(/\s/g, ''))}
                      style={{ fontFamily: fontSans, fontSize: 11, letterSpacing: '0.08em', textTransform: lang === 'en' ? 'uppercase' : 'none', background: 'none', border: '1px solid oklch(from var(--brand) 0.6 0.06 h)', borderRadius: 20, padding: '7px 16px', color: 'oklch(from var(--brand) 0.4 0.06 h)', cursor: 'pointer', position: 'relative' }}
                    >
                      {copiedKey === opt.key ? t.copied : t.copy}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Closing */}
          <section data-screen-label="Closing" className="page" style={{ background: 'linear-gradient(160deg, oklch(from var(--brand) 0.93 0.03 h) 0%, oklch(from var(--brand) 0.95 0.025 h) 100%)' }}>
            <RoseCorners />
            <div style={{ position: 'relative', width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', ...reveal(5) }}>
              <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 10, fontFamily: fontSerif, fontSize: 88, lineHeight: 1, color: 'oklch(from var(--brand) 0.62 0.06 h)', pointerEvents: 'none' }}>&ldquo;</span>
              <img src="/assets/closing-photo.jpg" alt={COUPLE_NAMES[lang]} style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', marginBottom: 28, filter: 'grayscale(100%)' }} />
              <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 'clamp(22px,5.5vw,30px)', color: 'oklch(from var(--brand) 0.32 0.03 h)', lineHeight: 1.5, margin: '0 0 24px' }}>
                {t.closingQuote}
              </p>
              <p style={{ fontFamily: fontSans, fontSize: 16, letterSpacing: '0.1em', color: 'oklch(from var(--brand) 0.4 0.04 h)', margin: 0 }}>{COUPLE_NAMES[lang]}</p>
              <p style={{ fontFamily: fontSans, fontSize: 12, letterSpacing: '0.08em', color: 'oklch(from var(--brand) 0.5 0.03 h)', marginTop: 8 }}>{WEDDING_DATE_LONG[lang]}</p>
              {showKidsMessage && (
                <p style={{ fontFamily: fontSerif, fontStyle: 'italic', fontSize: 15, color: 'oklch(from var(--brand) 0.45 0.05 h)', marginTop: 18 }}>{t.sweetDreams}</p>
              )}
              <span aria-hidden="true" style={{ position: 'absolute', right: 0, bottom: -20, fontFamily: fontSerif, fontSize: 88, lineHeight: 1, color: 'oklch(from var(--brand) 0.62 0.06 h)', pointerEvents: 'none' }}>&rdquo;</span>
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
                background: activeIndex === i ? 'oklch(from var(--brand) 0.5 0.08 h)' : 'oklch(from var(--brand) 0.75 0.03 h)',
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
