import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Trophy, RotateCcw, Share2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { trackGameBegin, trackGameComplete, trackSubmit, trackGiveUp, trackPlayerSelect, trackSlotSelect, trackPlayerRemove, trackPlayAgain, trackPlayPrevious, trackShare, trackMiniGameClick } from '../utils/analytics';

// Game data with different cricket scenarios
const gameData = [
  {
    date: '2025-01-13',
    title: 'Cricket World Cup Final 2023 - India vs Australia',
    description: 'Arrange the Indian batting order from the 2023 Cricket World Cup Final',
    players: [
      { id: 1, name: 'Rohit Sharma', image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 2, name: 'Shubman Gill', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 3, name: 'Virat Kohli', image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 4, name: 'Shreyas Iyer', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 5, name: 'KL Rahul', image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 6, name: 'Hardik Pandya', image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }
    ],
    correctOrder: [1, 2, 3, 4, 5, 6]
  },
  {
    date: '2025-01-12',
    title: 'IPL 2024 Final - KKR vs SRH',
    description: 'Arrange the KKR batting order from IPL 2024 Final',
    players: [
      { id: 1, name: 'Phil Salt', image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 2, name: 'Sunil Narine', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 3, name: 'Venkatesh Iyer', image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 4, name: 'Shreyas Iyer', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 5, name: 'Rinku Singh', image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 6, name: 'Andre Russell', image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }
    ],
    correctOrder: [1, 2, 3, 4, 5, 6]
  },
  {
    date: '2025-01-11',
    title: 'T20 World Cup 2024 Final - India vs South Africa',
    description: 'Arrange the Indian batting order from T20 World Cup 2024 Final',
    players: [
      { id: 1, name: 'Rohit Sharma', image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 2, name: 'Virat Kohli', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 3, name: 'Rishabh Pant', image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 4, name: 'Suryakumar Yadav', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 5, name: 'Shivam Dube', image: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 6, name: 'Hardik Pandya', image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }
    ],
    correctOrder: [1, 2, 3, 4, 5, 6]
  }
];

const miniGames = [
  {
    name: 'Cricket Quiz',
    url: 'https://cricketquiz.netlify.app',
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700'
  },
  {
    name: 'Football Quiz',
    url: 'https://footballquiz.netlify.app',
    color: 'bg-green-600',
    hoverColor: 'hover:bg-green-700'
  },
  {
    name: 'Basketball Quiz',
    url: 'https://basketballquiz.netlify.app',
    color: 'bg-orange-600',
    hoverColor: 'hover:bg-orange-700'
  },
  {
    name: 'Tennis Quiz',
    url: 'https://tennisquiz.netlify.app',
    color: 'bg-purple-600',
    hoverColor: 'hover:bg-purple-700'
  }
];

const CricketGame: React.FC = () => {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [playerOrder, setPlayerOrder] = useState<(number | null)[]>([null, null, null, null, null, null]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<('correct' | 'incorrect' | null)[]>([null, null, null, null, null, null]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dragImageRef = useRef<HTMLDivElement>(null);

  const currentGame = gameData[currentGameIndex];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    trackGameBegin();
  }, [currentGameIndex]);

  const resetGame = () => {
    setPlayerOrder([null, null, null, null, null, null]);
    setSelectedPlayer(null);
    setAttempts(0);
    setGameWon(false);
    setGameOver(false);
    setFeedback([null, null, null, null, null, null]);
    setShowTooltip(false);
  };

  const handlePlayerClick = (playerId: number) => {
    if (gameOver) return;
    
    trackPlayerSelect(currentGame.players.find(p => p.id === playerId)?.name || '', playerId);
    
    if (isMobile) {
      // Mobile: Select player first, then tap slot
      if (selectedPlayer === playerId) {
        setSelectedPlayer(null);
      } else {
        setSelectedPlayer(playerId);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      }
    } else {
      // Desktop: Direct placement in first available slot
      const firstEmptySlot = playerOrder.findIndex(slot => slot === null);
      if (firstEmptySlot !== -1) {
        const newOrder = [...playerOrder];
        newOrder[firstEmptySlot] = playerId;
        setPlayerOrder(newOrder);
        trackSlotSelect(firstEmptySlot, currentGame.players.find(p => p.id === playerId)?.name);
      }
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    if (gameOver) return;
    
    if (playerOrder[slotIndex] !== null) {
      // Remove player from slot
      const removedPlayerId = playerOrder[slotIndex];
      const newOrder = [...playerOrder];
      newOrder[slotIndex] = null;
      setPlayerOrder(newOrder);
      
      if (removedPlayerId) {
        trackPlayerRemove(currentGame.players.find(p => p.id === removedPlayerId)?.name || '', slotIndex);
      }
    } else if (selectedPlayer !== null) {
      // Place selected player in slot
      const newOrder = [...playerOrder];
      newOrder[slotIndex] = selectedPlayer;
      setPlayerOrder(newOrder);
      setSelectedPlayer(null);
      setShowTooltip(false);
      
      trackSlotSelect(slotIndex, currentGame.players.find(p => p.id === selectedPlayer)?.name);
    }
  };

  // Enhanced drag and drop handlers
  const handleDragStart = (e: React.DragEvent, playerId: number) => {
    if (gameOver) return;
    
    setDraggedPlayer(playerId);
    
    // Create a custom drag image
    const dragImage = document.createElement('div');
    dragImage.className = 'bg-gray-700 text-white p-2 rounded shadow-lg';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.zIndex = '1000';
    dragImage.textContent = currentGame.players.find(p => p.id === playerId)?.name || '';
    
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 25);
    
    // Clean up drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', playerId.toString());
  };

  const handleDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotIndex);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    
    if (draggedPlayer !== null) {
      const newOrder = [...playerOrder];
      
      // Remove player from current position if already placed
      const currentIndex = newOrder.findIndex(id => id === draggedPlayer);
      if (currentIndex !== -1) {
        newOrder[currentIndex] = null;
      }
      
      // Place in new slot
      newOrder[slotIndex] = draggedPlayer;
      setPlayerOrder(newOrder);
      
      trackSlotSelect(slotIndex, currentGame.players.find(p => p.id === draggedPlayer)?.name);
    }
    
    setDraggedPlayer(null);
    setDragOverSlot(null);
  };

  const handleDragEnd = () => {
    setDraggedPlayer(null);
    setDragOverSlot(null);
  };

  const submitAnswer = () => {
    if (playerOrder.includes(null)) return;
    
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    const newFeedback = playerOrder.map((playerId, index) => 
      playerId === currentGame.correctOrder[index] ? 'correct' : 'incorrect'
    );
    setFeedback(newFeedback);
    
    const allCorrect = newFeedback.every(f => f === 'correct');
    trackSubmit(newAttempts, allCorrect);
    
    if (allCorrect) {
      setGameWon(true);
      setGameOver(true);
      trackGameComplete(true, newAttempts, false);
    } else if (newAttempts >= 3) {
      setGameOver(true);
      trackGameComplete(false, newAttempts, false);
    }
  };

  const giveUp = () => {
    setGameOver(true);
    trackGiveUp(attempts);
    trackGameComplete(false, attempts, true);
    
    // Show correct order
    setPlayerOrder([...currentGame.correctOrder]);
    setFeedback(currentGame.correctOrder.map(() => 'correct'));
  };

  const playAgain = () => {
    resetGame();
    trackPlayAgain();
  };

  const selectPreviousGame = (index: number) => {
    setCurrentGameIndex(index);
    setShowDatePicker(false);
    resetGame();
    trackPlayPrevious(gameData[index].date);
  };

  const shareResult = () => {
    const result = gameWon ? `Won in ${attempts} attempts!` : `Completed in ${attempts} attempts`;
    const text = `I just played Cricket Arrange the Following! ${result}\n\nTry it yourself: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Cricket Arrange the Following',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
    
    trackShare(gameWon, attempts);
  };

  const handleMiniGameClick = (game: typeof miniGames[0]) => {
    trackMiniGameClick(game.name, game.url);
    window.open(game.url, '_blank');
  };

  const getSlotBorderColor = (index: number) => {
    if (dragOverSlot === index) return 'border-blue-400';
    if (feedback[index] === 'correct') return 'border-green-400';
    if (feedback[index] === 'incorrect') return 'border-red-400';
    return 'border-gray-600';
  };

  const getSlotBackgroundColor = (index: number) => {
    if (dragOverSlot === index) return 'bg-blue-900/30';
    if (feedback[index] === 'correct') return 'bg-green-900/30';
    if (feedback[index] === 'incorrect') return 'bg-red-900/30';
    return 'bg-gray-700';
  };

  const isPlayerPlaced = (playerId: number) => playerOrder.includes(playerId);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile Ad Space */}
      <div className="lg:hidden">
        <div id="div-gpt-ad-1754030829221-0" className="text-center py-2"></div>
      </div>

      {/* Desktop Layout */}
      <div className="lg:flex lg:gap-8 lg:px-4">
        {/* Left Sidebar - Desktop Ads */}
        <div className="hidden lg:block lg:w-[300px] lg:flex-shrink-0">
          <div className="sticky top-4 space-y-4">
            <div id="div-gpt-ad-1754030483680-0" className="w-[300px] h-[250px] bg-gray-800 rounded"></div>
            <div id="div-gpt-ad-1754030700661-0" className="w-[300px] h-[250px] bg-gray-800 rounded"></div>
          </div>
        </div>

        {/* Main Game Content */}
        <div className="flex-1 lg:justify-center">
          <div className="max-w-2xl mx-auto p-4">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-2xl font-bold mb-2">Cricket Arrange the Following</h1>
              <div className="flex items-center justify-center gap-4 mb-3">
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{currentGame.date}</span>
                </button>
                <div className="text-sm text-gray-400">
                  Attempts: {attempts}/3
                </div>
              </div>
            </div>

            {/* Game Description */}
            <div className="bg-gray-800 p-4 rounded-lg mb-4">
              <h2 className="text-lg font-semibold mb-2">{currentGame.title}</h2>
              <p className="text-gray-300 text-sm">{currentGame.description}</p>
            </div>

            {/* Players Pool */}
            <div className="mb-4">
              <h3 className="text-base font-medium mb-2">Available Players</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {currentGame.players.map((player) => (
                  <div
                    key={player.id}
                    draggable={!gameOver && !isMobile}
                    onDragStart={(e) => handleDragStart(e, player.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handlePlayerClick(player.id)}
                    className={`
                      relative bg-gray-700 border-2 rounded-lg p-2 cursor-pointer transition-all duration-200
                      ${isPlayerPlaced(player.id) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}
                      ${selectedPlayer === player.id ? 'border-blue-400 ring-2 ring-blue-400/50' : 'border-gray-600'}
                      ${!gameOver && !isMobile ? 'hover:scale-105' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                      <span className="text-xs sm:text-sm font-medium line-clamp-2 sm:line-clamp-none">
                        {player.name}
                      </span>
                    </div>
                    
                    {/* Tooltip */}
                    {selectedPlayer === player.id && showTooltip && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-orange-600 bg-opacity-40 text-white text-xs px-3 py-1 rounded whitespace-nowrap">
                        Place the player at the right spot
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Batting Order Slots */}
            <div className="mb-4">
              <h3 className="text-base font-medium mb-2">Batting Order</h3>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {playerOrder.map((playerId, index) => (
                  <div
                    key={index}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onClick={() => handleSlotClick(index)}
                    className={`
                      ${getSlotBackgroundColor(index)} border-2 ${getSlotBorderColor(index)}
                      rounded-lg p-2 min-h-[45px] sm:min-h-[50px] cursor-pointer transition-all duration-200
                      flex flex-col items-center justify-center hover:bg-gray-700/50
                      ${dragOverSlot === index ? 'scale-105' : ''}
                    `}
                  >
                    <div className="text-xs text-gray-400 mb-0.5 sm:mb-1">#{index + 1}</div>
                    {playerId ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={currentGame.players.find(p => p.id === playerId)?.image}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover mb-1"
                        />
                        <span className="text-xs text-center leading-tight">
                          {currentGame.players.find(p => p.id === playerId)?.name}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center">Empty</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={submitAnswer}
                disabled={playerOrder.includes(null) || gameOver}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed px-4 py-2 rounded font-medium transition-colors"
              >
                Submit Answer
              </button>
              {!gameOver && attempts > 0 && (
                <button
                  onClick={giveUp}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium transition-colors"
                >
                  Give Up
                </button>
              )}
            </div>

            {/* Game Over Screen */}
            {gameOver && (
              <div className="bg-gray-800 p-4 rounded-lg mb-4 text-center">
                {gameWon ? (
                  <div>
                    <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-green-400 mb-2">Congratulations!</h3>
                    <p className="text-gray-300">You got it right in {attempts} attempt{attempts !== 1 ? 's' : ''}!</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-bold text-red-400 mb-2">Game Over</h3>
                    <p className="text-gray-300 mb-2">Here's the correct batting order:</p>
                  </div>
                )}
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={playAgain}
                    className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Play Again
                  </button>
                  <button
                    onClick={shareResult}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium transition-colors flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            )}

            {/* Mini Games */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-base font-medium mb-3">More Games</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {miniGames.map((game, index) => (
                  <button
                    key={index}
                    onClick={() => handleMiniGameClick(game)}
                    className={`${game.color} ${game.hoverColor} text-white px-3 py-2 rounded text-sm font-medium transition-colors hover:scale-105 transform duration-200`}
                  >
                    {game.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sticky Ad */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 py-2">
        <div className="flex justify-center">
          <div id="div-gpt-ad-1754030936119-0" className="w-[970px] h-[90px] bg-gray-800 rounded"></div>
        </div>
      </div>

      {/* Mobile bottom padding for ads */}
      <div className="lg:hidden pb-[340px]"></div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Previous Game</h3>
              <button
                onClick={() => setShowDatePicker(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {gameData.map((game, index) => (
                <button
                  key={index}
                  onClick={() => selectPreviousGame(index)}
                  className={`w-full text-left p-3 rounded transition-colors ${
                    index === currentGameIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <div className="font-medium">{game.date}</div>
                  <div className="text-sm opacity-75 line-clamp-2">{game.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CricketGame;