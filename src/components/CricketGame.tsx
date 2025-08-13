import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Trophy, 
  RotateCcw, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Info,
  AlertCircle 
} from 'lucide-react';
import { trackEvent, trackGameBegin, trackGameComplete, trackSubmit, trackGiveUp, trackPlayerSelect, trackSlotSelect, trackPlayerRemove, trackPlayAgain, trackPlayPrevious, trackShare, trackMiniGameClick } from '../utils/analytics';

interface Player {
  id: number;
  name: string;
  image: string;
}

interface GameData {
  date: string;
  players: Player[];
  correctOrder: number[];
  title: string;
}

const CricketGame: React.FC = () => {
  // Game state
  const [currentGame, setCurrentGame] = useState<GameData | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [battingOrder, setBattingOrder] = useState<(Player | null)[]>(Array(11).fill(null));
  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<('correct' | 'incorrect' | 'empty')[]>(Array(11).fill('empty'));
  const [showResults, setShowResults] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMiniGames, setShowMiniGames] = useState(false);

  // Game data
  const gameData: GameData[] = [
    {
      date: '2025-01-13',
      title: 'India vs Australia - 1st Test, Adelaide 2024',
      players: [
        { id: 1, name: 'Yashasvi Jaiswal', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 2, name: 'KL Rahul', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 3, name: 'Shubman Gill', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 4, name: 'Virat Kohli', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 5, name: 'Rishabh Pant', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 6, name: 'Rohit Sharma', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 7, name: 'Ravindra Jadeja', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 8, name: 'R Ashwin', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 9, name: 'Akash Deep', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 10, name: 'Jasprit Bumrah', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 11, name: 'Mohammed Siraj', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }
      ],
      correctOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    },
    {
      date: '2025-01-12',
      title: 'England vs South Africa - 2nd ODI, Cape Town 2024',
      players: [
        { id: 1, name: 'Jason Roy', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 2, name: 'Jonny Bairstow', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 3, name: 'Joe Root', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 4, name: 'Ben Stokes', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 5, name: 'Jos Buttler', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 6, name: 'Liam Livingstone', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 7, name: 'Moeen Ali', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 8, name: 'Chris Woakes', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 9, name: 'Adil Rashid', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 10, name: 'Mark Wood', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
        { id: 11, name: 'Jofra Archer', image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }
      ],
      correctOrder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    }
  ];

  const miniGames = [
    { name: 'Cricket Quiz', url: 'https://example.com/cricket-quiz', color: 'bg-blue-600' },
    { name: 'Player Stats', url: 'https://example.com/player-stats', color: 'bg-green-600' },
    { name: 'Match Predictor', url: 'https://example.com/match-predictor', color: 'bg-purple-600' },
    { name: 'Fantasy Cricket', url: 'https://example.com/fantasy-cricket', color: 'bg-red-600' }
  ];

  // Initialize game
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayGame = gameData.find(game => game.date === today);
    const gameToLoad = todayGame || gameData[0];
    
    setCurrentGame(gameToLoad);
    trackGameBegin();
  }, []);

  const handlePlayerSelect = (player: Player) => {
    if (gameCompleted) return;
    
    setSelectedPlayer(player);
    trackPlayerSelect(player.name, player.id);
    
    // Show tooltip on first selection
    if (!showTooltip && battingOrder.every(slot => slot === null)) {
      setShowTooltip(true);
    }
  };

  const handleSlotSelect = (index: number) => {
    if (gameCompleted || !selectedPlayer) return;

    const newBattingOrder = [...battingOrder];
    
    // Remove player from current position if already placed
    const currentIndex = newBattingOrder.findIndex(p => p?.id === selectedPlayer.id);
    if (currentIndex !== -1) {
      newBattingOrder[currentIndex] = null;
      trackPlayerRemove(selectedPlayer.name, currentIndex);
    }
    
    // Place player in new position
    newBattingOrder[index] = selectedPlayer;
    setBattingOrder(newBattingOrder);
    trackSlotSelect(index, selectedPlayer.name);
    
    setSelectedPlayer(null);
    
    // Hide tooltip after first placement
    if (showTooltip) {
      setShowTooltip(false);
    }
  };

  const handleSubmit = () => {
    if (!currentGame || gameCompleted) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const newFeedback = battingOrder.map((player, index) => {
      if (!player) return 'empty';
      return currentGame.correctOrder[index] === player.id ? 'correct' : 'incorrect';
    });

    setFeedback(newFeedback);
    
    const allCorrect = newFeedback.every(f => f === 'correct');
    trackSubmit(newAttempts, allCorrect);

    if (allCorrect) {
      setGameWon(true);
      setGameCompleted(true);
      setShowResults(true);
      trackGameComplete(true, newAttempts, false);
    } else if (newAttempts >= 6) {
      setGameCompleted(true);
      setShowResults(true);
      trackGameComplete(false, newAttempts, false);
    }
  };

  const handleGiveUp = () => {
    if (gameCompleted) return;
    
    setGaveUp(true);
    setGameCompleted(true);
    setShowResults(true);
    trackGiveUp(attempts);
    trackGameComplete(false, attempts, true);

    // Show correct order
    if (currentGame) {
      const correctBattingOrder = currentGame.correctOrder.map(playerId => 
        currentGame.players.find(p => p.id === playerId) || null
      );
      setBattingOrder(correctBattingOrder);
      
      const correctFeedback = Array(11).fill('correct');
      setFeedback(correctFeedback);
    }
  };

  const handlePlayAgain = () => {
    setBattingOrder(Array(11).fill(null));
    setSelectedPlayer(null);
    setGameCompleted(false);
    setGameWon(false);
    setAttempts(0);
    setFeedback(Array(11).fill('empty'));
    setShowResults(false);
    setGaveUp(false);
    setShowTooltip(false);
    trackPlayAgain();
    trackGameBegin();
  };

  const handleDateSelect = (date: string) => {
    const selectedGame = gameData.find(game => game.date === date);
    if (selectedGame) {
      setCurrentGame(selectedGame);
      setBattingOrder(Array(11).fill(null));
      setSelectedPlayer(null);
      setGameCompleted(false);
      setGameWon(false);
      setAttempts(0);
      setFeedback(Array(11).fill('empty'));
      setShowResults(false);
      setGaveUp(false);
      setShowTooltip(false);
      setShowDatePicker(false);
      trackPlayPrevious(date);
      trackGameBegin();
    }
  };

  const handleShare = () => {
    const result = gameWon ? `🏏 Cricket Arrange Game ✅\n\nSolved in ${attempts}/6 attempts!` : 
                   gaveUp ? `🏏 Cricket Arrange Game ❌\n\nGave up after ${attempts} attempts` :
                   `🏏 Cricket Arrange Game ❌\n\nFailed in 6/6 attempts`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Cricket Arrange Game',
        text: result,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(result + `\n\n${window.location.href}`);
    }
    
    trackShare(gameWon, attempts);
  };

  const handleMiniGameClick = (game: any) => {
    trackMiniGameClick(game.name, game.url);
    window.open(game.url, '_blank');
  };

  const getAvailablePlayers = () => {
    if (!currentGame) return [];
    return currentGame.players.filter(player => 
      !battingOrder.some(p => p?.id === player.id)
    );
  };

  const canSubmit = () => {
    return battingOrder.every(player => player !== null) && !gameCompleted;
  };

  const renderDatePicker = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Select Date</h3>
          <button
            onClick={() => setShowDatePicker(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-2">
          {gameData.map(game => (
            <button
              key={game.date}
              onClick={() => handleDateSelect(game.date)}
              className={`w-full text-left p-3 rounded border transition-colors ${
                currentGame?.date === game.date
                  ? 'border-blue-400 bg-blue-900/30 text-blue-400'
                  : 'border-gray-600 hover:border-gray-500 text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="font-medium">{game.date}</div>
              <div className="text-sm text-gray-400 line-clamp-2">{game.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMiniGames = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">More Games</h3>
          <button
            onClick={() => setShowMiniGames(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {miniGames.map(game => (
            <button
              key={game.name}
              onClick={() => handleMiniGameClick(game)}
              className={`${game.color} hover:opacity-80 text-white p-4 rounded-lg text-center transition-all hover:scale-105`}
            >
              <div className="font-medium">{game.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!showResults || !currentGame) return null;

    return (
      <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full animate-[slideIn_0.5s_ease-out_forwards]">
          <div className="text-center">
            <div className="mb-4">
              {gameWon ? (
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-2" />
              ) : (
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-2" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {gameWon ? 'Congratulations!' : gaveUp ? 'Better luck next time!' : 'Game Over!'}
            </h2>
            
            <p className="text-gray-300 mb-4">
              {gameWon 
                ? `You solved it in ${attempts} attempt${attempts !== 1 ? 's' : ''}!`
                : gaveUp 
                ? `You gave up after ${attempts} attempt${attempts !== 1 ? 's' : ''}`
                : `You used all 6 attempts`
              }
            </p>

            {!gameWon && (
              <div className="mb-4 p-3 bg-gray-700 rounded">
                <p className="text-sm text-gray-300 mb-2">Correct batting order:</p>
                <div className="text-xs text-gray-400 space-y-1">
                  {currentGame.correctOrder.map((playerId, index) => {
                    const player = currentGame.players.find(p => p.id === playerId);
                    return (
                      <div key={index} className="flex justify-between">
                        <span>{index + 1}.</span>
                        <span>{player?.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handlePlayAgain}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    if (!currentGame) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-2xl font-bold">Cricket Arrange</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDatePicker(true)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                title="Select Date"
              >
                <Calendar className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowMiniGames(true)}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-sm"
              >
                More Games
              </button>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold mb-1">{currentGame.title}</h2>
            <p className="text-gray-400 text-sm">Arrange the batting order from 1 to 11</p>
            <div className="flex justify-center items-center gap-4 mt-2 text-sm">
              <span className="text-gray-300">Attempts: {attempts}/6</span>
              {!gameCompleted && (
                <button
                  onClick={handleGiveUp}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Give Up
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span className="text-sm">Now tap an empty cell below to place this player</span>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
          </div>
        )}

        {/* Main Game Area */}
        <div className="max-w-2xl mx-auto">
          {/* Available Players */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Available Players</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {getAvailablePlayers().map(player => (
                <button
                  key={player.id}
                  onClick={() => handlePlayerSelect(player)}
                  disabled={gameCompleted}
                  className={`p-2 rounded border-2 transition-all ${
                    selectedPlayer?.id === player.id
                      ? 'border-blue-400 bg-blue-900/30 scale-105'
                      : gameCompleted
                      ? 'border-gray-600 bg-gray-700 cursor-not-allowed opacity-50'
                      : 'border-gray-600 hover:border-blue-400 hover:bg-blue-900/20'
                  }`}
                >
                  <img
                    src={player.image}
                    alt={player.name}
                    className="w-full h-[72px] object-cover rounded mb-1"
                  />
                  <p className="text-xs text-center line-clamp-2 sm:line-clamp-none">{player.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Batting Order */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Batting Order</h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {battingOrder.map((player, index) => (
                <button
                  key={index}
                  onClick={() => handleSlotSelect(index)}
                  disabled={gameCompleted && !selectedPlayer}
                  className={`p-2 rounded border-2 min-h-[45px] sm:min-h-[50px] transition-all ${
                    feedback[index] === 'correct'
                      ? 'border-green-400 bg-green-900/30'
                      : feedback[index] === 'incorrect'
                      ? 'border-red-400 bg-red-900/30'
                      : selectedPlayer && !player
                      ? 'border-yellow-400/30 bg-yellow-900/30'
                      : player
                      ? 'border-blue-400/30 bg-blue-900/20'
                      : gameCompleted
                      ? 'border-gray-600 bg-gray-700 cursor-not-allowed'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-0.5 sm:mb-1">{index + 1}</div>
                  {player ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded mb-1"
                      />
                      <p className="text-xs text-center line-clamp-2">{player.name}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-10 text-gray-500 text-xs">
                      Empty
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit()}
              className={`px-6 py-2 rounded font-medium transition-colors ${
                canSubmit()
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Order
            </button>
          </div>
        </div>

        {/* Ads */}
        <div className="lg:hidden">
          <div 
            id="div-gpt-ad-1754030829221-0" 
            className="fixed bottom-0 left-0 right-0 z-10 flex justify-center bg-black p-1"
          ></div>
        </div>

        <div className="hidden lg:block">
          <div 
            id="div-gpt-ad-1754030483680-0" 
            className="fixed top-4 right-4 z-10"
          ></div>
          <div 
            id="div-gpt-ad-1754030700661-0" 
            className="fixed top-4 left-4 z-10"
          ></div>
          <div 
            id="div-gpt-ad-1754030936119-0" 
            className="fixed bottom-0 left-0 right-0 z-10 flex justify-center bg-black p-1"
          ></div>
        </div>

        {/* Modals */}
        {showDatePicker && renderDatePicker()}
        {showMiniGames && renderMiniGames()}
        {renderResults()}
      </div>
    );
  };

  return renderMainContent();
};

export default CricketGame;