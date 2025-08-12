import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw, Calendar, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { trackGameBegin, trackGameComplete, trackSubmit, trackGiveUp, trackPlayerSelect, trackSlotSelect, trackPlayerRemove, trackPlayAgain, trackPlayPrevious, trackShare, trackMiniGameClick } from '../utils/analytics';

interface Player {
  id: number;
  name: string;
  image: string;
  role: string;
}

interface GameData {
  date: string;
  players: Player[];
  correctOrder: number[];
  hint: string;
}

const CricketGame: React.FC = () => {
  // Game data for different dates
  const gameData: { [key: string]: GameData } = {
    '2025-01-05': {
      date: '2025-01-05',
      players: [
        { id: 1, name: 'Virat Kohli', image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', role: 'Batsman' },
        { id: 2, name: 'MS Dhoni', image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', role: 'Wicket-keeper' },
        { id: 3, name: 'Rohit Sharma', image: 'https://images.pexels.com/photos/1374064/pexels-photo-1374064.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', role: 'Batsman' },
        { id: 4, name: 'Jasprit Bumrah', image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', role: 'Bowler' },
        { id: 5, name: 'Hardik Pandya', image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', role: 'All-rounder' },
        { id: 6, name: 'Ravindra Jadeja', image: 'https://images.pexels.com/photos/1374064/pexels-photo-1374064.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', role: 'All-rounder' }
      ],
      correctOrder: [3, 1, 2, 5, 6, 4], // Rohit, Virat, Dhoni, Hardik, Jadeja, Bumrah
      hint: 'Arrange these Indian cricket players in batting order for a T20 match'
    },
    '2025-01-04': {
      date: '2025-01-04',
      players: [
        { id: 7, name: 'Joe Root', image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', role: 'Batsman' },
        { id: 8, name: 'Ben Stokes', image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', role: 'All-rounder' },
        { id: 9, name: 'Jos Buttler', image: 'https://images.pexels.com/photos/1374064/pexels-photo-1374064.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', role: 'Wicket-keeper' },
        { id: 10, name: 'James Anderson', image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', role: 'Bowler' },
        { id: 11, name: 'Stuart Broad', image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', role: 'Bowler' },
        { id: 12, name: 'Moeen Ali', image: 'https://images.pexels.com/photos/1374064/pexels-photo-1374064.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', role: 'All-rounder' }
      ],
      correctOrder: [9, 7, 8, 12, 10, 11], // Buttler, Root, Stokes, Moeen, Anderson, Broad
      hint: 'Arrange these English cricket players in batting order for a Test match'
    }
  };

  const [currentDate, setCurrentDate] = useState('2025-01-05');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerPositions, setPlayerPositions] = useState<(Player | null)[]>(Array(6).fill(null));
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<('correct' | 'incorrect' | 'empty')[]>(Array(6).fill('empty'));
  const [showPreviousGames, setShowPreviousGames] = useState(false);
  const [showMiniGames, setShowMiniGames] = useState(false);
  const [hasStartedGame, setHasStartedGame] = useState(false);
  
  // Mobile drag state
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    draggedPlayer: Player | null;
    startTime: number;
    startPos: { x: number; y: number };
  }>({
    isDragging: false,
    draggedPlayer: null,
    startTime: 0,
    startPos: { x: 0, y: 0 }
  });

  const currentGame = gameData[currentDate];
  const availablePlayers = currentGame.players.filter(player => 
    !playerPositions.some(pos => pos?.id === player.id)
  );

  useEffect(() => {
    if (!hasStartedGame) {
      trackGameBegin();
      setHasStartedGame(true);
    }
  }, [hasStartedGame]);

  const handlePlayerSelect = (player: Player) => {
    if (dragState.isDragging) return;
    
    setSelectedPlayer(selectedPlayer?.id === player.id ? null : player);
    trackPlayerSelect(player.name, player.id);
  };

  const handleSlotClick = (index: number) => {
    if (dragState.isDragging) return;
    
    if (playerPositions[index]) {
      // Remove player from slot
      const removedPlayer = playerPositions[index]!;
      const newPositions = [...playerPositions];
      newPositions[index] = null;
      setPlayerPositions(newPositions);
      setSelectedPlayer(null);
      trackPlayerRemove(removedPlayer.name, index);
    } else if (selectedPlayer) {
      // Place selected player in slot
      const newPositions = [...playerPositions];
      newPositions[index] = selectedPlayer;
      setPlayerPositions(newPositions);
      setSelectedPlayer(null);
      trackSlotSelect(index, selectedPlayer.name);
    } else {
      trackSlotSelect(index);
    }
  };

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent, player: Player) => {
    const touch = e.touches[0];
    setDragState({
      isDragging: false,
      draggedPlayer: player,
      startTime: Date.now(),
      startPos: { x: touch.clientX, y: touch.clientY }
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.draggedPlayer) return;
    
    const touch = e.touches[0];
    const timeDiff = Date.now() - dragState.startTime;
    const distance = Math.sqrt(
      Math.pow(touch.clientX - dragState.startPos.x, 2) + 
      Math.pow(touch.clientY - dragState.startPos.y, 2)
    );

    // Start dragging if moved enough or held long enough
    if ((distance > 10 || timeDiff > 150) && !dragState.isDragging) {
      setDragState(prev => ({ ...prev, isDragging: true }));
      e.preventDefault(); // Prevent scrolling
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragState.draggedPlayer) return;

    const timeDiff = Date.now() - dragState.startTime;
    
    if (dragState.isDragging) {
      // Handle drop
      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const slotElement = elementBelow?.closest('[data-slot-index]');
      
      if (slotElement) {
        const slotIndex = parseInt(slotElement.getAttribute('data-slot-index') || '-1');
        if (slotIndex >= 0 && slotIndex < 6) {
          if (playerPositions[slotIndex]) {
            // Remove existing player
            const removedPlayer = playerPositions[slotIndex]!;
            trackPlayerRemove(removedPlayer.name, slotIndex);
          }
          
          // Place dragged player
          const newPositions = [...playerPositions];
          newPositions[slotIndex] = dragState.draggedPlayer;
          setPlayerPositions(newPositions);
          trackSlotSelect(slotIndex, dragState.draggedPlayer.name);
        }
      }
    } else if (timeDiff < 200) {
      // Handle tap (quick touch)
      handlePlayerSelect(dragState.draggedPlayer);
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      draggedPlayer: null,
      startTime: 0,
      startPos: { x: 0, y: 0 }
    });
  };

  const handleSubmit = () => {
    if (playerPositions.some(pos => pos === null)) {
      alert('Please fill all positions before submitting!');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const newFeedback = playerPositions.map((player, index) => {
      if (!player) return 'empty';
      return currentGame.correctOrder[index] === player.id ? 'correct' : 'incorrect';
    });

    setFeedback(newFeedback);

    const allCorrect = newFeedback.every(f => f === 'correct');
    trackSubmit(newAttempts, allCorrect);

    if (allCorrect) {
      setGameState('won');
      trackGameComplete(true, newAttempts, false);
    } else if (newAttempts >= 3) {
      setGameState('lost');
      trackGameComplete(false, newAttempts, false);
    }
  };

  const handleGiveUp = () => {
    setGameState('lost');
    trackGiveUp(attempts);
    trackGameComplete(false, attempts, true);
    
    // Show correct answer
    const correctPositions = currentGame.correctOrder.map(playerId => 
      currentGame.players.find(p => p.id === playerId)!
    );
    setPlayerPositions(correctPositions);
    setFeedback(Array(6).fill('correct'));
  };

  const handlePlayAgain = () => {
    setPlayerPositions(Array(6).fill(null));
    setSelectedPlayer(null);
    setGameState('playing');
    setAttempts(0);
    setFeedback(Array(6).fill('empty'));
    setHasStartedGame(false);
    trackPlayAgain();
  };

  const handleDateChange = (date: string) => {
    setCurrentDate(date);
    setPlayerPositions(Array(6).fill(null));
    setSelectedPlayer(null);
    setGameState('playing');
    setAttempts(0);
    setFeedback(Array(6).fill('empty'));
    setShowPreviousGames(false);
    setHasStartedGame(false);
    trackPlayPrevious(date);
  };

  const handleShare = () => {
    const result = gameState === 'won' ? `✅ Won in ${attempts} attempts!` : '❌ Game Over';
    const text = `Cricket Arrange Game - ${currentDate}\n${result}\n${currentGame.hint}\n\nPlay at: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Cricket Arrange Game',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
    
    trackShare(gameState === 'won', attempts);
  };

  const miniGames = [
    { name: 'Cricket Quiz', url: 'https://example.com/cricket-quiz', color: 'bg-blue-600' },
    { name: 'Player Stats', url: 'https://example.com/player-stats', color: 'bg-green-600' },
    { name: 'Match Predictor', url: 'https://example.com/match-predictor', color: 'bg-purple-600' },
    { name: 'Team Builder', url: 'https://example.com/team-builder', color: 'bg-red-600' }
  ];

  const availableDates = Object.keys(gameData).sort().reverse();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 lg:flex lg:gap-8 lg:justify-center">
      {/* Desktop Ads - Left */}
      <div className="hidden lg:block lg:w-[300px] lg:flex-shrink-0">
        <div className="sticky top-4 space-y-4">
          <div id="div-gpt-ad-1754030483680-0" className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
            <script>
              {`googletag.cmd.push(function() { googletag.display('div-gpt-ad-1754030483680-0'); });`}
            </script>
            Ad Space 300x250
          </div>
        </div>
      </div>

      {/* Main Game Content */}
      <div className="max-w-2xl lg:max-w-2xl mx-auto lg:flex-1">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-2xl font-bold mb-2 text-center">Cricket Arrange Game</h1>
          <p className="text-gray-400 mb-4">{currentGame.hint}</p>
          
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => setShowPreviousGames(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Previous Games</span>
            </button>
            
            <button
              onClick={() => setShowMiniGames(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">More Games</span>
            </button>
          </div>

          <div className="text-sm text-gray-400">
            Date: {currentDate} | Attempts: {attempts}/3
          </div>
        </div>

        {/* Mobile Ad - Top */}
        <div className="sm:hidden mb-4">
          <div id="div-gpt-ad-1754030829221-0" className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
            <script>
              {`googletag.cmd.push(function() { googletag.display('div-gpt-ad-1754030829221-0'); });`}
            </script>
            Mobile Ad Space
          </div>
        </div>

        {/* Game Board */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-center">Batting Order</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {playerPositions.map((player, index) => (
              <div
                key={index}
                data-slot-index={index}
                onClick={() => handleSlotClick(index)}
                className={`
                  min-h-[45px] sm:min-h-[50px] border-2 rounded-lg p-2 cursor-pointer transition-all duration-300
                  ${dragState.isDragging ? 'border-blue-400 bg-blue-900/30 scale-105' : 'border-gray-600'}
                  ${feedback[index] === 'correct' ? 'border-green-400 bg-green-900/30' : ''}
                  ${feedback[index] === 'incorrect' ? 'border-red-400 bg-red-900/30' : ''}
                  ${!player ? 'border-gray-600 hover:border-gray-500' : ''}
                `}
              >
                {player ? (
                  <div className="flex items-center gap-2">
                    <img 
                      src={player.image} 
                      alt={player.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base line-clamp-2 sm:line-clamp-none">
                        {player.name}
                      </div>
                      <div className="text-xs text-gray-400">{player.role}</div>
                    </div>
                    {feedback[index] === 'correct' && (
                      <div className="text-green-400">✓</div>
                    )}
                    {feedback[index] === 'incorrect' && (
                      <div className="text-red-400">✗</div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-2">
                    Position {index + 1}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Available Players */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 text-center">Available Players</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availablePlayers.map((player) => (
              <div
                key={player.id}
                onClick={() => handlePlayerSelect(player)}
                onTouchStart={(e) => handleTouchStart(e, player)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`
                  border-2 rounded-lg p-2 cursor-pointer transition-all duration-200
                  ${selectedPlayer?.id === player.id ? 'border-blue-400 bg-blue-900/20' : 'border-gray-700 hover:border-gray-500'}
                  ${dragState.isDragging && dragState.draggedPlayer?.id === player.id ? 'opacity-50 scale-105 z-50' : ''}
                `}
                style={{ touchAction: 'none', userSelect: 'none' }}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={player.image} 
                    alt={player.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base line-clamp-2 sm:line-clamp-none">
                      {player.name}
                    </div>
                    <div className="text-xs text-gray-400">{player.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex gap-3 justify-center mb-6">
          {gameState === 'playing' && (
            <>
              <button
                onClick={handleSubmit}
                disabled={playerPositions.some(pos => pos === null)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                Submit ({attempts}/3)
              </button>
              <button
                onClick={handleGiveUp}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Give Up
              </button>
            </>
          )}
          
          {gameState !== 'playing' && (
            <div className="text-center">
              <div className={`text-2xl font-bold mb-2 ${gameState === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                {gameState === 'won' ? `🎉 You Won in ${attempts} attempts!` : '😞 Game Over'}
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handlePlayAgain}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Sticky Ad */}
        <div className="hidden lg:block mb-6">
          <div id="div-gpt-ad-1754030936119-0" className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
            <script>
              {`googletag.cmd.push(function() { googletag.display('div-gpt-ad-1754030936119-0'); });`}
            </script>
            Desktop Sticky Ad 970x90
          </div>
        </div>

        {/* Mobile bottom padding for sticky ad */}
        <div className="pb-[340px] sm:pb-0"></div>
      </div>

      {/* Desktop Ads - Right */}
      <div className="hidden lg:block lg:w-[300px] lg:flex-shrink-0">
        <div className="sticky top-4 space-y-4">
          <div id="div-gpt-ad-1754030700661-0" className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
            <script>
              {`googletag.cmd.push(function() { googletag.display('div-gpt-ad-1754030700661-0'); });`}
            </script>
            Ad Space 300x250
          </div>
        </div>
      </div>

      {/* Mobile Sticky Ad */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900 p-2 border-t border-gray-700">
        <div id="div-gpt-ad-1754030829221-0" className="bg-gray-800 rounded p-2 text-center text-gray-400 text-xs">
          <script>
            {`googletag.cmd.push(function() { googletag.display('div-gpt-ad-1754030829221-0'); });`}
          </script>
          Mobile Sticky Ad
        </div>
      </div>

      {/* Previous Games Modal */}
      {showPreviousGames && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Previous Games</h2>
              <button
                onClick={() => setShowPreviousGames(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-2">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateChange(date)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    date === currentDate 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <div className="font-medium">{date}</div>
                  <div className="text-sm opacity-75">{gameData[date].hint}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mini Games Modal */}
      {showMiniGames && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">More Cricket Games</h2>
              <button
                onClick={() => setShowMiniGames(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {miniGames.map((game) => (
                <a
                  key={game.name}
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackMiniGameClick(game.name, game.url)}
                  className={`${game.color} p-4 rounded-lg text-center hover:opacity-80 transition-opacity group`}
                >
                  <div className="font-medium text-white group-hover:scale-105 transition-transform">
                    {game.name}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CricketGame;