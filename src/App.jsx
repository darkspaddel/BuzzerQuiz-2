
import React, { useState, useEffect, useRef } from 'react';

const initialPlayers = Array.from({ length: 10 }, (_, i) => ({
  name: `Spieler ${i + 1}`,
  score: 0,
  hasBuzzed: false,
}));

export default function App() {
  const [players, setPlayers] = useState(initialPlayers);
  const [buzzedPlayer, setBuzzedPlayer] = useState(null);
  const [isModerator, setIsModerator] = useState(false);
  const audioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsModerator(params.get('mod') === '1');
  }, []);

  const handleBuzz = (index) => {
    if (buzzedPlayer === null) {
      setBuzzedPlayer(index);
      const updated = [...players];
      updated[index].hasBuzzed = true;
      setPlayers(updated);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    }
  };

  const updateScore = (index, delta, soundType) => {
    if (!isModerator) return;
    const updated = [...players];
    updated[index].score += delta;
    setPlayers(updated);
    if (soundType === 'correct' && correctAudioRef.current) {
      correctAudioRef.current.currentTime = 0;
      correctAudioRef.current.play();
    } else if (soundType === 'wrong' && wrongAudioRef.current) {
      wrongAudioRef.current.currentTime = 0;
      wrongAudioRef.current.play();
    }
  };

  const resetBuzz = () => {
    if (!isModerator) return;
    setPlayers(players.map(p => ({ ...p, hasBuzzed: false })));
    setBuzzedPlayer(null);
  };

  const startGame = () => {
    if (!isModerator) return;
    setPlayers(initialPlayers);
    setBuzzedPlayer(null);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎉 Buzzer Quiz {isModerator && '(Moderator-Modus)'}</h1>
      <audio ref={audioRef} src="/buzz.mp3" preload="auto" />
      <audio ref={correctAudioRef} src="/correct.mp3" preload="auto" />
      <audio ref={wrongAudioRef} src="/wrong.mp3" preload="auto" />
      {isModerator && (
        <button onClick={startGame} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">Spiel starten</button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map((player, index) => (
          <div key={index} className="p-4 border rounded shadow bg-white">
            <input
              className="font-bold text-lg mb-2 w-full border p-1"
              value={player.name}
              onChange={(e) => {
                const updated = [...players];
                updated[index].name = e.target.value;
                setPlayers(updated);
              }}
              disabled={!isModerator && player.hasBuzzed}
            />
            <p className="text-xl">Punkte: {player.score}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {isModerator ? (
                <>
                  <button onClick={() => updateScore(index, 2, 'correct')} className="bg-green-500 text-white px-2 py-1 rounded">+2 Richtig</button>
                  <button onClick={() => updateScore(index, -1, 'wrong')} className="bg-red-500 text-white px-2 py-1 rounded">-1 Falsch</button>
                </>
              ) : null}
              <button
                onClick={() => handleBuzz(index)}
                disabled={buzzedPlayer !== null}
                className="bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Buzz
              </button>
            </div>
            {player.hasBuzzed && <p className="text-pink-500 font-bold mt-2">Hat gebuzzert!</p>}
          </div>
        ))}
      </div>
      {isModerator && (
        <button onClick={resetBuzz} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded">Buzz zurücksetzen</button>
      )}
    </div>
  );
}
