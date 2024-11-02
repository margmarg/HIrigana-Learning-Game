import { useState, useEffect } from 'react';

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

  const [apiKey, setApiKey] = useState(localStorage.getItem('elevenLabsApiKey') || '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(!apiKey);
  const [selectedVoiceId, setSelectedVoiceId] = useState(
    localStorage.getItem('elevenLabsVoiceId') || '3JDquces8E8bkmvbh6Bc'
  );
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tiles, setTiles] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [mismatchedPairs, setMismatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);

  const speak = async (text) => {
    if (!apiKey || !selectedVoiceId || isLoading) {
      console.log('Checking values:', { apiKey, selectedVoiceId, isLoading });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 1.0,
              similarity_boost: 1.0
            }
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.detail?.message || errorData.detail || 'Unknown error'}`);
      }

      const audioBlob = await response.blob();
      const audio = new Audio(URL.createObjectURL(audioBlob));
      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('elevenLabsApiKey', apiKey);
    setIsApiKeyModalOpen(false);
  };

  const handleClearApi = () => {
    localStorage.removeItem('elevenLabsApiKey');
    setApiKey('');
    setIsApiKeyModalOpen(true);
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

  useEffect(() => {
    initializeGame();
  }, []);

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
      {isApiKeyModalOpen && (
        <div style={{
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px'
        }}>
          <form onSubmit={handleApiSubmit}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter ElevenLabs API Key"
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                marginRight: '10px',
                width: '300px'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: '#4f46e5',
                color: 'white',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Save API Key
            </button>
          </form>
        </div>
      )}

      {!isApiKeyModalOpen && (
        <button
          onClick={handleClearApi}
          style={{
            marginBottom: '10px',
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear API Key
        </button>
      )}

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
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