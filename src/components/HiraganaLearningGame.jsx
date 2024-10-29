import React, { useState, useEffect } from 'react';

const HiraganaLearningGame = () => {
  const hiraganaData = [
    { char: 'あ', romaji: 'a' },
    { char: 'い', romaji: 'i' },
    { char: 'う', romaji: 'u' },
    { char: 'え', romaji: 'e' },
    { char: 'お', romaji: 'o' },
    { char: 'か', romaji: 'ka' },
    { char: 'き', romaji: 'ki' },
    { char: 'く', romaji: 'ku' },
    { char: 'け', romaji: 'ke' },
    { char: 'こ', romaji: 'ko' },
    { char: 'さ', romaji: 'sa' },
    { char: 'し', romaji: 'shi' },
    { char: 'す', romaji: 'su' },
    { char: 'せ', romaji: 'se' },
    { char: 'そ', romaji: 'so' }
  ];

  const [japaneseVoice, setJapaneseVoice] = useState(null);
  const [tiles, setTiles] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [mismatchedPairs, setMismatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const initializeSpeech = () => {
      const voices = window.speechSynthesis.getVoices();
      let jaVoice = voices.find(voice => 
        voice.lang.startsWith('ja') && 
        voice.name.toLowerCase().includes('female')
      );
      if (!jaVoice) {
        jaVoice = voices.find(voice => voice.lang.startsWith('ja'));
      }
      if (jaVoice) {
        console.log('Selected voice:', jaVoice.name);
        setJapaneseVoice(jaVoice);
      }
    };

    if (window.speechSynthesis.getVoices().length) {
      initializeSpeech();
    } else {
      window.speechSynthesis.onvoiceschanged = initializeSpeech;
    }

    initializeGame();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (char) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(char);
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }
    utterance.lang = 'ja-JP';
    utterance.rate = 0.6;
    utterance.pitch = 1.3;
    utterance.volume = 1.0;

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  const initializeGame = () => {
    const gameChars = [...hiraganaData]
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);
    
    const allTiles = [...gameChars, ...gameChars, gameChars[0]].map((char, index) => ({
      id: `${char.char}-${index}`,
      content: char.char,
      romaji: char.romaji
    }));
    
    for (let i = allTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allTiles[i], allTiles[j]] = [allTiles[j], allTiles[i]];
    }
    
    setTiles(allTiles);
    setSelectedTiles([]);
    setMatchedPairs([]);
    setMismatchedPairs([]);
    setMoves(0);
  };

  const handleTileClick = (tile) => {
    if (selectedTiles.length === 2 || selectedTiles.includes(tile) || matchedPairs.includes(tile.id)) {
      return;
    }

    speak(tile.content);

    const newSelected = [...selectedTiles, tile];
    setSelectedTiles(newSelected);

    if (newSelected.length === 2) {
      setMoves(moves + 1);
      
      if (newSelected[0].content === newSelected[1].content) {
        setMatchedPairs([...matchedPairs, newSelected[0].id, newSelected[1].id]);
        setSelectedTiles([]);
      } else {
        setMismatchedPairs([newSelected[0].id, newSelected[1].id]);
        setTimeout(() => {
          setMismatchedPairs([]);
          setSelectedTiles([]);
        }, 2000);
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }} className="bg-white rounded-lg shadow-lg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Moves: {moves}</div>
        <button 
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
          onClick={initializeGame}
        >
          ↺ New Game
        </button>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '10px',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
      }}>
        {tiles.map((tile) => (
          <button
            key={tile.id}
            style={{
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              borderRadius: '8px',
              backgroundColor: matchedPairs.includes(tile.id) ? '#bfdbfe' :
                             mismatchedPairs.includes(tile.id) ? 
                               (mismatchedPairs.indexOf(tile.id) === 0 ? '#fecaca' : '#bbf7d0') :
                             selectedTiles.includes(tile) ? '#bfdbfe' : '#f3f4f6',
              transition: 'background-color 300ms',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={() => handleTileClick(tile)}
          >
            {tile.content}
          </button>
        ))}
      </div>
      
      {matchedPairs.length === (tiles.length - 1) && (
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#16a34a'
        }}>
          Congratulations! You won in {moves} moves!
        </div>
      )}
    </div>
  );
};

export default HiraganaLearningGame;