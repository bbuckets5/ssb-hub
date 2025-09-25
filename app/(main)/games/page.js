// app/(main)/games/page.js

export default function GamesPage() {
  return (
    <div style={{ padding: '4rem', textAlign: 'center', minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--primary-color)' }}>The SSB Gauntlet</h1>
      <p style={{ fontSize: '1.2rem', marginTop: '1rem', opacity: '0.8' }}>
        Coming Soon! Get ready to compete in live, community-wide tournaments and prove you&apos;re the top fan.
      </p>
    </div>
  );
}
