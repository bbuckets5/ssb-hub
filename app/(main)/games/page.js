// app/(main)/games/page.js
import TriviaGame from "@/components/TriviaGame"; // Import our new game component

export default function GamesPage() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)' }}>SSB Trivia Royale</h1>
      <TriviaGame />
    </div>
  );
}
