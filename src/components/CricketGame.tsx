import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw, Share2, Calendar, ExternalLink, Gamepad2 } from 'lucide-react';
import { 
  trackGameBegin, 
  trackGameComplete, 
  trackSubmit, 
  trackGiveUp, 
  trackPlayerSelect,
  trackSlotSelect,
  trackPlayerRemove,
  trackPlayAgain,
  trackPlayPrevious,
  trackShare,
  trackMiniGameClick
} from '../utils/analytics';

interface Player {
  id: number;
  name: string;
  position: string;
  image: string;
}

interface GameData {
  date: string;
  players: Player[];
  correctOrder: number[];
  hint: string;
}

interface MiniGame {
  name: string;
  url: string;
  description: string;
  icon: string;
}

// Mobile drag state
interface DragState {
  isDragging: boolean;
  draggedPlayerId: number | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
}

const CricketGame: React.FC = () => {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [playerOrder, setPlayerOrder] = useState<(number | null)[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<boolean[]>([]);
  const [showPreviousGames, setShowPreviousGames] = useState<boolean>(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [showMiniGames, setShowMiniGames] = useState<boolean>(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedPlayerId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0
  });

  // Sample game data
  const sampleGameData: GameData = {
    date: new Date().toISOString().split('T')[0],
    players: [
      { id: 1, name: "Rohit Sharma", position: "Opener", image: "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
      { id: 2, name: "Virat Kohli", position: "Top Order", image: "https://images.pexels.com/photos/1374510/pexels-photo-1374510.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
      { id: 3, name: "KL Rahul", position: "Wicket Keeper", image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
      { id: 4, name: "Hardik Pandya", position: "All Rounder", image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
      { id: 5, name: "Ravindra Jadeja", position: "All Rounder", image: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
      { id: 6, name: "Mohammed Shami", position: "Fast Bowler", image: "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
      { id: 7, name: "Jasprit Bumrah", position: "Fast Bowler", image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
      { id: 8, name: "Kuldeep Yadav", position: "Spinner", image: "https://images.pexels.com/photos/1374510/pexels-photo-1374510.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
      { id: 9, name: "Yuzvendra Chahal", position: "Spinner", image: "https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
      { id: 10, name: "Rishabh Pant", position: "Wicket Keeper", image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
      { id: 11, name: "Shubman Gill", position: "Top Order", image: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" }
    ],
    correctOrder: [1, 11, 2, 10, 3, 4, 5, 6, 7, 8, 9],
    hint: "Arrange the Indian Cricket Team batting order for ODI format"
  };

  const miniGames: MiniGame[] = [
    {
      name: "Cricket Quiz",
      url: "https://cricketquiz.example.com",
      description: "Test your cricket knowledge",
      icon: "🏏"
    },
    {
      name: "Player Stats",
      url: "https://playerstats.example.com", 
      description: "Compare player statistics",
      icon: "📊"
    },
    {
      name: "Match Predictor",
      url: "https://matchpredictor.example.com",
      description: "Predict match outcomes",
      icon: "🔮"
    }
  ];

  useEffect(() => {
    setGameData(sampleGameData);
    setPlayerOrder(new Array(11).fill(null));
    setAvailableDates(['2024-01-15', '2024-01-14', '2024-01-13', '2024-01-12', '2024-01-11']);
    trackGameBegin();
  }, []);

  // Mobile drag handlers
  const handleTouchStart = (e: React.TouchEvent, playerId: number) => {
    e.preventDefault();
    const touch = e.touches[0];
    
    setDragState({
      isDragging: false,
      draggedPlayerId: playerId,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: Date.now()
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.draggedPlayerId) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - dragState.startX);
    const deltaY = Math.abs(touch.clientY - dragState.startY);
    const deltaTime = Date.now() - dragState.startTime;
    
    // Start dragging if moved more than 10px or held for 100ms
    if ((deltaX > 10 || deltaY > 10 || deltaTime > 100) && !dragState.isDragging) {
      setDragState(prev => ({
        ...prev,
        isDragging: true,
        currentX: touch.clientX,
        currentY: touch.clientY
      }));
    } else if (dragState.isDragging) {
      setDragState(prev => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY
      }));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragState.draggedPlayerId) return;
    
    const deltaTime = Date.now() - dragState.startTime;
    
    if (dragState.isDragging) {
      // Handle drop
      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const slotElement = elementBelow?.closest('[data-slot-index]');
      
      if (slotElement) {
        const slotIndex = parseInt(slotElement.getAttribute('data-slot-index') || '-1');
        if (slotIndex >= 0 && slotIndex < playerOrder.length && playerOrder[slotIndex] === null) {
          const newOrder = [...playerOrder];
          
          // Remove player from current position if already placed
          const currentIndex = newOrder.indexOf(dragState.draggedPlayerId);
          if (currentIndex !== -1) {
            newOrder[currentIndex] = null;
          }
          
          // Place player in new position
          newOrder[slotIndex] = dragState.draggedPlayerId;
          setPlayerOrder(newOrder);
          
          const player = gameData?.players.find(p => p.id === dragState.draggedPlayerId);
          trackSlotSelect(slotIndex, player?.name);
        }
      }
    } else if (deltaTime < 200) {
      // Handle tap (quick touch)
      if (selectedPlayer === dragState.draggedPlayerId) {
        setSelectedPlayer(null);
      } else {
        setSelectedPlayer(dragState.draggedPlayerId);
        const player = gameData?.players.find(p => p.id === dragState.draggedPlayerId);
        if (player) {
          trackPlayerSelect(player.name, dragState.draggedPlayerId);
        }
      }
    }
    
    // Reset drag state
    setDragState({
      isDragging: false,
      draggedPlayerId: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      startTime: 0
    });
  };

  const handlePlayerClick = (playerId: number) => {
    if (selectedPlayer === playerId) {
      setSelectedPlayer(null);
    } else {
      setSelectedPlayer(playerId);
      const player = gameData?.players.find(p => p.id === playerId);
      if (player) {
        trackPlayerSelect(player.name, playerId);
      }
    }
  };

  const handleSlotClick = (index: number) => {
    if (playerOrder[index] !== null) {
      // Remove player from slot
      const playerId = playerOrder[index];
      const newOrder = [...playerOrder];
      newOrder[index] = null;
      setPlayerOrder(newOrder);
      
      const player = gameData?.players.find(p => p.id === playerId);
      if (player) {
        trackPlayerRemove(player.name, index);
      }
    } else if (selectedPlayer !== null) {
      // Place selected player in slot
      const newOrder = [...playerOrder];
      
      // Remove player from current position if already placed
      const currentIndex = newOrder.indexOf(selectedPlayer);
      if (currentIndex !== -1) {
        newOrder[currentIndex] = null;
      }
      
      // Place player in new position
      newOrder[index] = selectedPlayer;
      setPlayerOrder(newOrder);
      setSelectedPlayer(null);
      
      const player = gameData?.players.find(p => p.id === selectedPlayer);
      trackSlotSelect(index, player?.name);
    }
  };

  const handleSubmit = () => {
    if (!gameData || playerOrder.includes(null)) return;
    
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    const isCorrect = playerOrder.every((playerId, index) => playerId === gameData.correctOrder[index]);
    const newFeedback = playerOrder.map((playerId, index) => playerId === gameData.correctOrder[index]);
    
    setFeedback(newFeedback);
    trackSubmit(newAttempts, isCorrect);
    
    if (isCorrect) {
      setGameWon(true);
      setGameOver(true);
      trackGameComplete(true, newAttempts, false);
    } else if (newAttempts >= 6) {
      setGameOver(true);
      trackGameComplete(false, newAttempts, false);
    }
  };

  const handleGiveUp = () => {
    setGameOver(true);
    setPlayerOrder(gameData?.correctOrder || []);
    setFeedback(new Array(11).fill(true));
    trackGiveUp(attempts);
    trackGameComplete(false, attempts, true);
  };

  const handlePlayAgain = () => {
    setPlayerOrder(new Array(11).fill(null));
    setSelectedPlayer(null);
    setAttempts(0);
    setGameWon(false);
    setGameOver(false);
    setFeedback([]);
    trackPlayAgain();
    trackGameBegin();
  };

  const handleShare = () => {
    const result = gameWon ? `Won in ${attempts} attempts!` : `Completed in ${attempts} attempts`;
    const text = `Cricket Arrange Game - ${result}\n\nPlay at: ${window.location.href}`;
    
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
    
    trackShare(gameWon, attempts);
  };

  const handlePreviousGame = (date: string) => {
    setShowPreviousGames(false);
    trackPlayPrevious(date);
    // In a real app, this would load the game for that date
    handlePlayAgain();
  };

  const handleMiniGameClick = (game: MiniGame) => {
    trackMiniGameClick(game.name, game.url);
    window.open(game.url, '_blank');
  };

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const availablePlayers = gameData.players.filter(player => !playerOrder.includes(player.id));
  const isSubmitDisabled = playerOrder.includes(null) || gameOver;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Cricket Arrange</h1>
            <p className="text-gray-400 text-sm">{gameData.hint}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreviousGames(true)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Previous Games"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMiniGames(true)}
              className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              title="More Games"
            >
              <Gamepad2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 pb-[340px] lg:pb-28">
        {/* Game Status */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Attempts: {attempts}/6</span>
            {gameWon && (
              <div className="flex items-center gap-2 text-green-400">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Completed!</span>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(attempts / 6) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Batting Order Slots */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3 text-center">Batting Order</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {playerOrder.map((playerId, index) => {
              const player = playerId ? gameData.players.find(p => p.id === playerId) : null;
              const isCorrect = feedback.length > 0 ? feedback[index] : null;
              const isDropZone = dragState.isDragging && !playerId;
              
              return (
                <div
                  key={index}
                  data-slot-index={index}
                  onClick={() => handleSlotClick(index)}
                  className={`
                    min-h-[45px] sm:min-h-[50px] border-2 rounded-lg p-2 cursor-pointer transition-all duration-200
                    ${player ? 'bg-gray-700' : 'bg-gray-600 border-dashed'}
                    ${isCorrect === true ? 'border-green-400 bg-green-900/30' : ''}
                    ${isCorrect === false ? 'border-red-400 bg-red-900/30' : ''}
                    ${isDropZone ? 'border-blue-400 bg-blue-900/30 scale-105' : 'border-gray-600'}
                    hover:border-gray-500
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">{index + 1}</span>
                    {player ? (
                      <>
                        <img 
                          src={player.image} 
                          alt={player.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{player.name}</p>
                          <p className="text-xs text-gray-400 truncate">{player.position}</p>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">Empty</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Players */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3 text-center">Available Players</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availablePlayers.map((player) => {
              const isSelected = selectedPlayer === player.id;
              const isDragged = dragState.isDragging && dragState.draggedPlayerId === player.id;
              
              return (
                <div
                  key={player.id}
                  onClick={() => handlePlayerClick(player.id)}
                  onTouchStart={(e) => handleTouchStart(e, player.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`
                    bg-gray-700 border-2 rounded-lg p-2 cursor-pointer transition-all duration-200
                    ${isSelected ? 'border-blue-400 bg-blue-900/20' : 'border-gray-600'}
                    ${isDragged ? 'opacity-50 scale-105 z-50' : ''}
                    hover:border-blue-400 hover:bg-blue-900/20
                  `}
                  style={{
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={player.image} 
                      alt={player.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 sm:line-clamp-none">{player.name}</p>
                      <p className="text-xs text-gray-400">{player.position}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`
              flex-1 py-2 px-4 rounded-lg font-semibold transition-colors
              ${isSubmitDisabled 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            Submit Order
          </button>
          
          {!gameOver && attempts > 0 && (
            <button
              onClick={handleGiveUp}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Give Up
            </button>
          )}
        </div>

        {/* Game Over Actions */}
        {gameOver && (
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <h3 className="text-xl font-bold mb-2">
              {gameWon ? '🎉 Congratulations!' : '🎯 Game Over'}
            </h3>
            <p className="text-gray-300 mb-4">
              {gameWon 
                ? `You completed the batting order in ${attempts} attempts!`
                : `The correct batting order is shown above.`
              }
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handlePlayAgain}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Previous Games Modal */}
      {showPreviousGames && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Previous Games</h3>
            <div className="space-y-2 mb-4">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => handlePreviousGame(date)}
                  className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPreviousGames(false)}
              className="w-full py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mini Games Modal */}
      {showMiniGames && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">More Cricket Games</h3>
            <div className="space-y-3 mb-4">
              {miniGames.map((game) => (
                <button
                  key={game.name}
                  onClick={() => handleMiniGameClick(game)}
                  className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-3"
                >
                  <span className="text-2xl">{game.icon}</span>
                  <div>
                    <p className="font-semibold">{game.name}</p>
                    <p className="text-sm text-gray-400">{game.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMiniGames(false)}
              className="w-full py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mobile Ad Container */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 p-2 z-40">
        <div className="text-center">
          <div id="div-gpt-ad-1754030829221-0" className="mx-auto">
            <script>
              {`googletag.cmd.push(function() { googletag.display('div-gpt-ad-1754030829221-0'); });`}
            </script>
          </div>
        </div>
      </div>

      {/* Desktop Ad Containers */}
      <div className="hidden lg:block fixed top-4 left-4 z-40">
        <div id="div-gpt-ad-1754030483680-0">
          <script>
            {`googletag.cmd.push(function() { googletag.display('div-gpt-ad-1754030483680-0'); });`}
          </script>
        </div>
      </div>

      <div className="hidden lg:block fixed top-4 right-4 z-40">
        <div id="div-gpt-ad-1754030700661-0">
          <script>
            {`googletag.cmd.push(function() { googletag.display('div-gpt-ad-1754030700661-0'); });`}
          </script>
        </div>
      </div>

      <div className="hidden lg:block fixed bottom-0 left-0 right-0 bg-gray-900 p-2 z-40">
        <div className="text-center">
          <div id="div-gpt-ad-1754030936119-0" className="mx-auto">
            <script>
              {`googletag.cmd.push(function() { googletag.display('div-gpt-ad-1754030936119-0'); });`}
            </script>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CricketGame;