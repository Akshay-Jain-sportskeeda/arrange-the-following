import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw, Calendar, Share2, ExternalLink } from 'lucide-react';
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
  image: string;
}

interface GameData {
  date: string;
  players: Player[];
  correctOrder: number[];
  hint: string;
}

const gameData: GameData[] = [
  {
    date: '2025-01-13',
    players: [
      { id: 1, name: 'Virat Kohli', image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 2, name: 'Rohit Sharma', image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 3, name: 'KL Rahul', image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 4, name: 'Hardik Pandya', image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 5, name: 'MS Dhoni', image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 6, name: 'Ravindra Jadeja', image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 7, name: 'Jasprit Bumrah', image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 8, name: 'Mohammed Shami', image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 9, name: 'Yuzvendra Chahal', image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 10, name: 'Shubman Gill', image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 11, name: 'Rishabh Pant', image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }
    ],
    correctOrder: [2, 10, 1, 3, 11, 4, 6, 5, 7, 9, 8],
    hint: 'Arrange the Indian cricket team batting order for ODI matches'
  },
  {
    date: '2025-01-12',
    players: [
      { id: 1, name: 'Joe Root', image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 2, name: 'Ben Stokes', image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 3, name: 'Jos Buttler', image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 4, name: 'Jonny Bairstow', image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 5, name: 'Eoin Morgan', image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 6, name: 'Moeen Ali', image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 7, name: 'Chris Woakes', image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 8, name: 'Jofra Archer', image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 9, name: 'Adil Rashid', image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 10, name: 'Mark Wood', image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 11, name: 'James Anderson', image: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }
    ],
    correctOrder: [4, 1, 5, 2, 3, 6, 7, 8, 9, 10, 11],
    hint: 'Arrange the England cricket team batting order for ODI matches'
  }
];

const miniGames = [
  { name: 'Cricket Quiz', url: 'https://example.com/cricket-quiz', color: 'bg-blue-600' },
  { name: 'Player Stats', url: 'https://example.com/player-stats', color: 'bg-green-600' },
  { name: 'Match Predictor', url: 'https://example.com/match-predictor', color: 'bg-purple-600' },
  { name: 'Team Builder', url: 'https://example.com/team-builder', color: 'bg-orange-600' },
  { name: 'Cricket Trivia', url: 'https://example.com/cricket-trivia', color: 'bg-red-600' }
];

const CricketGame: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2025-01-13');
  const [currentGame, setCurrentGame] = useState<GameData>(gameData[0]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [arrangement, setArrangement] = useState<(Player | null)[]>(new Array(11).fill(null));
  const [attempts, setAttempts] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<boolean[]>([]);
  const [showPreviousGames, setShowPreviousGames] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const game = gameData.find(g => g.date === selectedDate) || gameData[0];
    setCurrentGame(game);
    resetGame();
  }, [selectedDate]);

  const resetGame = () => {
    setSelectedPlayer(null);
    setArrangement(new Array(11).fill(null));
    setAttempts(0);
    setGameWon(false);
    setGameOver(false);
    setFeedback([]);
    setGameStarted(false);
  };

  const handlePlayerClick = (player: Player) => {
    if (gameOver) return;
    
    if (!gameStarted) {
      setGameStarted(true);
      trackGameBegin();
    }
    
    setSelectedPlayer(player);
    trackPlayerSelect(player.name, player.id);
  };

  const handleSlotClick = (index: number) => {
    if (gameOver) return;
    
    if (!gameStarted) {
      setGameStarted(true);
      trackGameBegin();
    }

    if (arrangement[index]) {
      // Remove player from slot
      const removedPlayer = arrangement[index]!;
      const newArrangement = [...arrangement];
      newArrangement[index] = null;
      setArrangement(newArrangement);
      trackPlayerRemove(removedPlayer.name, index);
    } else if (selectedPlayer) {
      // Place selected player in slot
      const newArrangement = [...arrangement];
      
      // Remove player from any existing position
      const existingIndex = newArrangement.findIndex(p => p?.id === selectedPlayer.id);
      if (existingIndex !== -1) {
        newArrangement[existingIndex] = null;
      }
      
      newArrangement[index] = selectedPlayer;
      setArrangement(newArrangement);
      setSelectedPlayer(null);
      trackSlotSelect(index, selectedPlayer.name);
    } else {
      trackSlotSelect(index);
    }
  };

  const handleSubmit = () => {
    if (arrangement.some(player => player === null)) {
      alert('Please fill all positions before submitting!');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const playerOrder = arrangement.map(player => player!.id);
    const newFeedback = playerOrder.map((playerId, index) => 
      playerId === currentGame.correctOrder[index]
    );
    
    setFeedback(newFeedback);
    
    const allCorrect = newFeedback.every(correct => correct);
    trackSubmit(newAttempts, allCorrect);
    
    if (allCorrect) {
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
    trackGiveUp(attempts);
    trackGameComplete(false, attempts, true);
    
    // Show correct arrangement
    const correctArrangement = currentGame.correctOrder.map(playerId => 
      currentGame.players.find(p => p.id === playerId)!
    );
    setArrangement(correctArrangement);
    setFeedback(new Array(11).fill(true));
  };

  const handlePlayAgain = () => {
    resetGame();
    trackPlayAgain();
  };

  const handleShare = () => {
    const result = gameWon ? `Won in ${attempts} attempts!` : `Gave up after ${attempts} attempts`;
    const text = `Cricket Arrange Game - ${result}\nPlay at: ${window.location.href}`;
    
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

  const handlePreviousGameSelect = (date: string) => {
    setSelectedDate(date);
    setShowPreviousGames(false);
    trackPlayPrevious(date);
  };

  const handleMiniGameClick = (game: typeof miniGames[0]) => {
    trackMiniGameClick(game.name, game.url);
    window.open(game.url, '_blank');
  };

  const availablePlayers = currentGame.players.filter(player => 
    !arrangement.some(p => p?.id === player.id)
  );

  const getSlotBorderColor = (index: number) => {
    if (feedback.length === 0) return 'border-gray-600';
    return feedback[index] ? 'border-green-400' : 'border-red-400';
  };

  const getSlotBackgroundColor = (index: number) => {
    if (feedback.length === 0) return '';
    return feedback[index] ? 'bg-green-900/20' : 'bg-red-900/20';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative z-10">
      {/* Desktop Ad Slots */}
      <div className="hidden lg:block">
        {/* Desktop Ad 1 */}
        <div className="fixed top-4 left-4 z-40">
          <div id="div-gpt-ad-1754030483680-0" style={{ width: '300px', height: '250px' }}>
            <script>
              {typeof window !== 'undefined' && window.googletag && window.googletag.cmd.push(function() {
                window.googletag.display('div-gpt-ad-1754030483680-0');
              })}
            </script>
          </div>
        </div>
        
        {/* Desktop Ad 2 */}
        <div className="fixed top-4 right-4 z-40">
          <div id="div-gpt-ad-1754030700661-0" style={{ width: '300px', height: '250px' }}>
            <script>
              {typeof window !== 'undefined' && window.googletag && window.googletag.cmd.push(function() {
                window.googletag.display('div-gpt-ad-1754030700661-0');
              })}
            </script>
          </div>
        </div>
        
        {/* Desktop Sticky Ad */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50">
          <div id="div-gpt-ad-1754030936119-0" style={{ width: '970px', height: '90px' }}>
            <script>
              {typeof window !== 'undefined' && window.googletag && window.googletag.cmd.push(function() {
                window.googletag.display('div-gpt-ad-1754030936119-0');
              })}
            </script>
          </div>
        </div>
      </div>

      {/* Mobile Ad Slot */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <div id="div-gpt-ad-1754030829221-0" style={{ minHeight: '50px' }}>
          <script>
            {typeof window !== 'undefined' && window.googletag && window.googletag.cmd.push(function() {
              window.googletag.display('div-gpt-ad-1754030829221-0');
            })}
          </script>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-4 lg:pb-28 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Cricket Arrange Game</h1>
          <p className="text-gray-400 mb-4">{currentGame.hint}</p>
          
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={() => setShowPreviousGames(!showPreviousGames)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Previous Games
            </button>
            
            {gameOver && (
              <>
                <button
                  onClick={handlePlayAgain}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </>
            )}
          </div>

          {/* Previous Games Dropdown */}
          {showPreviousGames && (
            <div className="bg-gray-800 rounded-lg p-4 mb-4 max-w-md mx-auto">
              <h3 className="font-semibold mb-2">Select a previous game:</h3>
              <div className="space-y-2">
                {gameData.map((game) => (
                  <button
                    key={game.date}
                    onClick={() => handlePreviousGameSelect(game.date)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedDate === game.date 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {game.date}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Game Status */}
          <div className="flex justify-center items-center gap-4 text-sm">
            <span>Attempts: {attempts}/6</span>
            {gameWon && (
              <div className="flex items-center gap-1 text-green-400">
                <Trophy className="w-4 h-4" />
                <span>Congratulations!</span>
              </div>
            )}
            {gameOver && !gameWon && (
              <span className="text-red-400">Game Over</span>
            )}
          </div>
        </div>

        <div className="lg:flex lg:gap-8 lg:justify-center">
          {/* Main Game Area */}
          <div className="lg:flex-1 lg:max-w-2xl">
            {/* Batting Order Slots */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Batting Order</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {arrangement.map((player, index) => (
                  <div
                    key={index}
                    onClick={() => handleSlotClick(index)}
                    className={`
                      border-2 rounded-lg p-2 min-h-[45px] sm:min-h-[50px] cursor-pointer
                      transition-all duration-200 hover:bg-gray-700/50
                      ${getSlotBorderColor(index)} ${getSlotBackgroundColor(index)}
                      ${selectedPlayer && !player ? 'ring-2 ring-blue-400/50' : ''}
                    `}
                  >
                    <div className="text-xs text-gray-400 mb-0.5 sm:mb-1">#{index + 1}</div>
                    {player ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={player.image}
                          alt={player.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover mb-1"
                        />
                        <span className="text-xs text-center line-clamp-2 sm:line-clamp-none">
                          {player.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                        Tap to place
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Available Players */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-center">Available Players</h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {availablePlayers.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => handlePlayerClick(player)}
                    className={`
                      border rounded-lg p-1 sm:p-1.5 cursor-pointer transition-all duration-200
                      hover:scale-105 hover:border-blue-400
                      ${selectedPlayer?.id === player.id 
                        ? 'border-blue-400 bg-blue-900/30 ring-2 ring-blue-400/50' 
                        : 'border-gray-700 hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-full h-[72px] rounded object-cover mb-1"
                    />
                    <p className="text-xs text-center line-clamp-2">{player.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {!gameOver && (
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={handleSubmit}
                  disabled={arrangement.some(player => player === null)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  Submit
                </button>
                <button
                  onClick={handleGiveUp}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Give Up
                </button>
              </div>
            )}
          </div>

          {/* Mini Games Sidebar */}
          <div className="lg:w-[300px] lg:flex-shrink-0">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-center">More Cricket Games</h3>
              <div className="space-y-2">
                {miniGames.map((game, index) => (
                  <button
                    key={index}
                    onClick={() => handleMiniGameClick(game)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg text-left
                      transition-all duration-200 hover:scale-105
                      ${game.color} hover:opacity-90
                    `}
                  >
                    <span className="font-medium">{game.name}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CricketGame;