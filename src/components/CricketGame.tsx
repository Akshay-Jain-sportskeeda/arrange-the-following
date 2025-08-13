import React, { useState, useEffect } from 'react';
import { Shuffle, RotateCcw, Calendar, Share2, Trophy, Target, Clock, Users, ExternalLink } from 'lucide-react';
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
  role: string;
  image: string;
}

interface GameData {
  date: string;
  players: Player[];
  correctOrder: number[];
  hint: string;
}

interface GameState {
  selectedPlayer: Player | null;
  playerPositions: (Player | null)[];
  availablePlayers: Player[];
  attempts: number;
  gameComplete: boolean;
  showResults: boolean;
  feedback: ('correct' | 'incorrect' | null)[];
  gameWon: boolean;
  gaveUp: boolean;
}

// Mini games data
const miniGames = [
  {
    name: "Cricket Wordle",
    url: "https://cricketwordle.com",
    description: "Guess the cricket player in 6 tries",
    icon: "🏏"
  },
  {
    name: "Cricket Quiz",
    url: "https://cricketquiz.com",
    description: "Test your cricket knowledge",
    icon: "❓"
  },
  {
    name: "Cricket Memory",
    url: "https://cricketmemory.com",
    description: "Match cricket cards",
    icon: "🧠"
  }
];

// Sample game data - in a real app, this would come from an API
const gameData: GameData = {
  date: new Date().toISOString().split('T')[0],
  players: [
    { id: 1, name: "Virat Kohli", role: "Batsman", image: "https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
    { id: 2, name: "Rohit Sharma", role: "Batsman", image: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
    { id: 3, name: "MS Dhoni", role: "Wicket-keeper", image: "https://images.pexels.com/photos/1374064/pexels-photo-1374064.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
    { id: 4, name: "Jasprit Bumrah", role: "Bowler", image: "https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
    { id: 5, name: "Ravindra Jadeja", role: "All-rounder", image: "https://images.pexels.com/photos/1374064/pexels-photo-1374064.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
    { id: 6, name: "KL Rahul", role: "Batsman", image: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
    { id: 7, name: "Hardik Pandya", role: "All-rounder", image: "https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
    { id: 8, name: "Rishabh Pant", role: "Wicket-keeper", image: "https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
    { id: 9, name: "Mohammed Shami", role: "Bowler", image: "https://images.pexels.com/photos/1374064/pexels-photo-1374064.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
    { id: 10, name: "Yuzvendra Chahal", role: "Bowler", image: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" },
    { id: 11, name: "Shikhar Dhawan", role: "Batsman", image: "https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop" }
  ],
  correctOrder: [2, 11, 1, 6, 3, 5, 7, 8, 4, 9, 10], // Rohit, Dhawan, Virat, Rahul, Dhoni, Jadeja, Hardik, Pant, Bumrah, Shami, Chahal
  hint: "Arrange the players in their typical batting order for an ODI match"
};

const CricketGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    selectedPlayer: null,
    playerPositions: new Array(11).fill(null),
    availablePlayers: [...gameData.players],
    attempts: 0,
    gameComplete: false,
    showResults: false,
    feedback: new Array(11).fill(null),
    gameWon: false,
    gaveUp: false
  });

  const [showPreviousGames, setShowPreviousGames] = useState(false);
  const [showMiniGames, setShowMiniGames] = useState(false);

  // Initialize game
  useEffect(() => {
    trackGameBegin();
    shufflePlayers();
  }, []);

  const shufflePlayers = () => {
    const shuffled = [...gameData.players].sort(() => Math.random() - 0.5);
    setGameState(prev => ({
      ...prev,
      availablePlayers: shuffled,
      playerPositions: new Array(11).fill(null),
      selectedPlayer: null
    }));
  };

  const handlePlayerClick = (player: Player) => {
    if (gameState.gameComplete || gameState.showResults) return;
    
    trackPlayerSelect(player.name, player.id);
    setGameState(prev => ({
      ...prev,
      selectedPlayer: prev.selectedPlayer?.id === player.id ? null : player
    }));
  };

  const handlePlayerTouch = (e: React.TouchEvent, player: Player) => {
    e.preventDefault();
    handlePlayerClick(player);
  };

  const handleSlotClick = (positionIndex: number) => {
    if (gameState.gameComplete || gameState.showResults) return;
    
    const currentPlayer = gameState.playerPositions[positionIndex];
    
    if (gameState.selectedPlayer) {
      // Place selected player in slot
      trackSlotSelect(positionIndex, gameState.selectedPlayer.name);
      
      setGameState(prev => {
        const newPositions = [...prev.playerPositions];
        const newAvailable = [...prev.availablePlayers];
        
        // Remove player from current position if they're already placed
        const currentIndex = newPositions.findIndex(p => p?.id === prev.selectedPlayer!.id);
        if (currentIndex !== -1) {
          newPositions[currentIndex] = null;
        }
        
        // If slot is occupied, move that player back to available
        if (currentPlayer) {
          newAvailable.push(currentPlayer);
        }
        
        // Place selected player in new position
        newPositions[positionIndex] = prev.selectedPlayer;
        
        // Remove selected player from available list
        const availableIndex = newAvailable.findIndex(p => p.id === prev.selectedPlayer!.id);
        if (availableIndex !== -1) {
          newAvailable.splice(availableIndex, 1);
        }
        
        return {
          ...prev,
          playerPositions: newPositions,
          availablePlayers: newAvailable,
          selectedPlayer: null
        };
      });
    } else if (currentPlayer) {
      // Remove player from slot
      trackPlayerRemove(currentPlayer.name, positionIndex);
      
      setGameState(prev => ({
        ...prev,
        playerPositions: prev.playerPositions.map((p, i) => i === positionIndex ? null : p),
        availablePlayers: [...prev.availablePlayers, currentPlayer]
      }));
    } else {
      // Just track the slot selection
      trackSlotSelect(positionIndex);
    }
  };

  const handleSlotTouch = (e: React.TouchEvent, positionIndex: number) => {
    e.preventDefault();
    handleSlotClick(positionIndex);
  };

  const handleSubmit = () => {
    if (gameState.playerPositions.some(p => p === null)) {
      alert('Please fill all positions before submitting!');
      return;
    }

    const newAttempts = gameState.attempts + 1;
    const newFeedback = gameState.playerPositions.map((player, index) => {
      const correctPlayerId = gameData.correctOrder[index];
      return player?.id === correctPlayerId ? 'correct' : 'incorrect';
    });

    const allCorrect = newFeedback.every(f => f === 'correct');
    trackSubmit(newAttempts, allCorrect);

    setGameState(prev => ({
      ...prev,
      attempts: newAttempts,
      feedback: newFeedback,
      showResults: true,
      gameComplete: allCorrect || newAttempts >= 6,
      gameWon: allCorrect
    }));

    if (allCorrect || newAttempts >= 6) {
      trackGameComplete(allCorrect, newAttempts, false);
    }
  };

  const handleGiveUp = () => {
    trackGiveUp(gameState.attempts + 1);
    
    const correctPositions = gameData.correctOrder.map(playerId => 
      gameData.players.find(p => p.id === playerId)!
    );

    setGameState(prev => ({
      ...prev,
      playerPositions: correctPositions,
      availablePlayers: [],
      feedback: new Array(11).fill('correct'),
      showResults: true,
      gameComplete: true,
      gameWon: false,
      gaveUp: true
    }));

    trackGameComplete(false, gameState.attempts + 1, true);
  };

  const handlePlayAgain = () => {
    trackPlayAgain();
    setGameState({
      selectedPlayer: null,
      playerPositions: new Array(11).fill(null),
      availablePlayers: [...gameData.players],
      attempts: 0,
      gameComplete: false,
      showResults: false,
      feedback: new Array(11).fill(null),
      gameWon: false,
      gaveUp: false
    });
    shufflePlayers();
    trackGameBegin();
  };

  const handleShare = () => {
    trackShare(gameState.gameWon, gameState.attempts);
    
    const result = gameState.gameWon ? 
      `🏏 Cricket Arrange ${gameState.attempts}/6\n\n${gameState.feedback.map(f => f === 'correct' ? '🟢' : '🔴').join('')}\n\nPlay at: ${window.location.href}` :
      `🏏 Cricket Arrange X/6\n\nPlay at: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Cricket Arrange Game',
        text: result
      });
    } else {
      navigator.clipboard.writeText(result);
      alert('Result copied to clipboard!');
    }
  };

  const handleMiniGameClick = (game: typeof miniGames[0]) => {
    trackMiniGameClick(game.name, game.url);
    window.open(game.url, '_blank');
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'batsman': return 'text-blue-400 border-blue-400/30 bg-blue-900/20';
      case 'bowler': return 'text-red-400 border-red-400/30 bg-red-900/20';
      case 'all-rounder': return 'text-green-400 border-green-400/30 bg-green-900/20';
      case 'wicket-keeper': return 'text-yellow-400 border-yellow-400/30 bg-yellow-900/30';
      default: return 'text-gray-400 border-gray-600 bg-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <h1 className="text-xl font-bold">Cricket Arrange</h1>
                <p className="text-sm text-gray-400">Arrange the batting order</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreviousGames(true)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Previous Games"
              >
                <Calendar className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowMiniGames(true)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="More Games"
              >
                <Target className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Attempts: {gameState.attempts}/6</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Players: {11 - gameState.availablePlayers.length}/11</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={shufflePlayers}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Shuffle Players"
              disabled={gameState.gameComplete}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={handlePlayAgain}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="New Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hint */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <p className="text-center text-gray-300">{gameData.hint}</p>
        </div>

        {/* Batting Order Slots */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Batting Order</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {gameState.playerPositions.map((player, index) => (
              <div
                key={index}
                onClick={() => handleSlotClick(index)}
                onTouchEnd={(e) => handleSlotTouch(e, index)}
                className={`
                  min-h-[45px] sm:min-h-[50px] border-2 border-dashed rounded-lg p-2 cursor-pointer
                  transition-all duration-200 flex items-center justify-center
                  ${player ? 'border-solid' : 'border-gray-600'}
                  ${gameState.showResults && gameState.feedback[index] === 'correct' ? 'border-green-400 bg-green-900/30' : ''}
                  ${gameState.showResults && gameState.feedback[index] === 'incorrect' ? 'border-red-400 bg-red-900/30' : ''}
                  ${!player && !gameState.gameComplete ? 'hover:border-gray-500 hover:bg-gray-700/50' : ''}
                `}
              >
                {player ? (
                  <div className="flex items-center gap-2 w-full">
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{player.name}</p>
                      <p className={`text-xs ${getRoleColor(player.role).split(' ')[0]}`}>
                        {player.role}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {index + 1}
                    </span>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-2xl text-gray-600 font-mono">{index + 1}</span>
                    <p className="text-xs text-gray-500 mt-1">Position {index + 1}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Available Players */}
        {gameState.availablePlayers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Available Players</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {gameState.availablePlayers.map((player) => (
                <div
                  key={player.id}
                  onClick={() => handlePlayerClick(player)}
                  onTouchEnd={(e) => handlePlayerTouch(e, player)}
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-all duration-200
                    ${getRoleColor(player.role)}
                    ${gameState.selectedPlayer?.id === player.id ? 'ring-2 ring-blue-400/50 scale-105' : ''}
                    ${!gameState.gameComplete ? 'hover:scale-105' : 'cursor-not-allowed opacity-50'}
                  `}
                >
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-10 h-10 rounded-full object-cover mb-2"
                    />
                    <p className="font-medium text-sm line-clamp-2 sm:line-clamp-none">
                      {player.name}
                    </p>
                    <p className="text-xs opacity-75 mt-1">{player.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleSubmit}
            disabled={gameState.playerPositions.some(p => p === null) || gameState.gameComplete}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Submit Answer
          </button>
          <button
            onClick={handleGiveUp}
            disabled={gameState.gameComplete}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
          >
            Give Up
          </button>
        </div>

        {/* Results */}
        {gameState.showResults && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="text-center">
              {gameState.gameWon ? (
                <div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">🎉 Congratulations!</h3>
                  <p className="text-gray-300 mb-4">
                    You got it right in {gameState.attempts} attempt{gameState.attempts !== 1 ? 's' : ''}!
                  </p>
                </div>
              ) : gameState.gaveUp ? (
                <div>
                  <h3 className="text-2xl font-bold text-yellow-400 mb-2">📚 Learning Time!</h3>
                  <p className="text-gray-300 mb-4">Here's the correct batting order:</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-bold text-red-400 mb-2">❌ Not quite right!</h3>
                  <p className="text-gray-300 mb-4">
                    {gameState.attempts < 6 ? 'Try again!' : 'Better luck next time!'}
                  </p>
                </div>
              )}
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={handlePlayAgain}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Previous Games Modal */}
      {showPreviousGames && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Previous Games</h2>
            <div className="space-y-2 mb-4">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const isToday = i === 0;
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      if (!isToday) {
                        trackPlayPrevious(dateStr);
                      }
                      setShowPreviousGames(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isToday 
                        ? 'bg-blue-900/40 border border-blue-400 text-blue-400' 
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{isToday ? 'Today' : date.toLocaleDateString()}</span>
                      {isToday && <span className="text-sm">Current</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowPreviousGames(false)}
              className="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mini Games Modal */}
      {showMiniGames && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">More Cricket Games</h2>
            <div className="space-y-3 mb-4">
              {miniGames.map((game, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleMiniGameClick(game);
                    setShowMiniGames(false);
                  }}
                  className="w-full text-left p-4 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{game.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        {game.name}
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </h3>
                      <p className="text-sm text-gray-400">{game.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMiniGames(false)}
              className="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mobile Ad Space */}
      <div className="sm:hidden">
        <div id="div-gpt-ad-1754030829221-0" className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 flex justify-center">
          <div className="w-full max-w-sm h-[72px] flex items-center justify-center">
            <script>
              {`googletag.cmd.push(function() { googletag.display('div-gpt-ad-1754030829221-0'); });`}
            </script>
          </div>
        </div>
        <div className="pb-[340px]"></div>
      </div>

      {/* Desktop Ad Spaces */}
      <div className="hidden lg:block">
        {/* Sticky Bottom Ad */}
        <div id="div-gpt-ad-1754030936119-0" className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50">
          <script>
            {`googletag.cmd.push(function() { googletag.display('div-gpt-ad-1754030936119-0'); });`}
          </script>
        </div>
        
        {/* Side Ads */}
        <div className="fixed left-4 top-1/2 transform -translate-y-1/2">
          <div id="div-gpt-ad-1754030483680-0">
            <script>
              {`googletag.cmd.push(function() { googletag.display('div-gpt-ad-1754030483680-0'); });`}
            </script>
          </div>
        </div>
        
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2">
          <div id="div-gpt-ad-1754030700661-0">
            <script>
              {`googletag.cmd.push(function() { googletag.display('div-gpt-ad-1754030700661-0'); });`}
            </script>
          </div>
        </div>
        
        <div className="lg:pb-28"></div>
      </div>
    </div>
  );
};

export default CricketGame;