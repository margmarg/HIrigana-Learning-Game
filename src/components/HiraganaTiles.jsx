import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const HiraganaTiles = () => {
  const hiraganaChars = [
    'あ', 'い', 'う', 'え', 'お',
    'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ'
  ];

  const [tiles, setTiles] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [mismatchedPairs, setMismatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);

  const initializeGame = () => {
    // For a 5x5 grid, we need 25 tiles (12 pairs + 1 unused tile)
    const gameChars = [...hiraganaChars]
      .sort(() => Math.random() - 0.5)
      .slice(0, 12); // Select 12 characters for pairs
    
    const allTiles = [...gameChars, ...gameChars, gameChars[0]]; // Add one extra for the 25th tile
    const gameTiles = allTiles.map((char, index) => ({
      id: `${char}-${index}`,
      content: char
    }));
    
    // Shuffle tiles
    for (let i = gameTiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameTiles[i], gameTiles[j]] = [gameTiles[j], gameTiles[i]];
    }
    
    setTiles(gameTiles);
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

    const newSelected = [...selectedTiles, tile];
    setSelectedTiles(newSelected);

    if (newSelected.length === 2) {
      setMoves(moves + 1);
      
      // Check for match
      if (newSelected[0].content === newSelected[1].content) {
        setMatchedPairs([...matchedPairs, newSelected[0].id, newSelected[1].id]);
        setSelectedTiles([]);
      } else {
        // Handle mismatch
        setMismatchedPairs([newSelected[0].id, newSelected[1].id]);
        setTimeout(() => {
          setMismatchedPairs([]);
          setSelectedTiles([]);
        }, 2000); // Flash for 2 seconds
      }
    }
  };

  const getTileColor = (tile) => {
    if (matchedPairs.includes(tile.id)) {
      return 'bg-blue-100 text-blue-800'; // Matched pairs stay blue
    }
    if (mismatchedPairs.includes(tile.id)) {
      return mismatchedPairs.indexOf(tile.id) === 0 
        ? 'bg-red-100 text-red-800' // First mismatched tile
        : 'bg-green-100 text-green-800'; // Second mismatched tile
    }
    if (selectedTiles.includes(tile)) {
      return 'bg-blue-100 text-blue-800'; // Selected tiles
    }
    return 'bg-gray-100 hover:bg-gray-200'; // Default state
  };

  return (
    <Card className="w-full max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-bold">Moves: {moves}</div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={initializeGame}
        >
          <RotateCcw className="w-4 h-4" />
          New Game
        </Button>
      </div>
      
      <CardContent className="grid grid-cols-5 gap-2">
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={`
              aspect-square flex items-center justify-center
              text-2xl font-bold rounded-lg cursor-pointer
              transition-all duration-300 transform
              ${getTileColor(tile)}
            `}
            onClick={() => handleTileClick(tile)}
          >
            {tile.content}
          </div>
        ))}
      </CardContent>
      
      {matchedPairs.length === (tiles.length - 1) && (
        <div className="mt-4 text-center text-lg font-bold text-green-600">
          Congratulations! You won in {moves} moves!
        </div>
      )}
    </Card>
  );
};

export default HiraganaTiles;