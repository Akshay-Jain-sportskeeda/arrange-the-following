import React, { useState, useEffect } from 'react';
import { Shuffle, RotateCcw, Trophy, Calendar, Share2, ExternalLink } from 'lucide-react';
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
      { id: 1, name: 'Rohit Sharma', image: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 2, name: 'Virat Kohli', image: 'https://images.pexels.com/photos/1374510/pexels-photo-1374510.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 3, name: 'KL Rahul', image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 4, name: 'Hardik Pandya', image: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 5, name: 'MS Dhoni', image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 6, name: 'Ravindra Jadeja', image: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 7, name: 'Jasprit Bumrah', image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 8, name: 'Mohammed Shami', image: 'https://images.pexels.com/photos/1374510/pexels-photo-1374510.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 9, name: 'Yuzvendra Chahal', image: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 10, name: 'Shubman Gill', image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 11, name: 'Rishabh Pant', image: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }
    ],
    correctOrder: [1, 10, 2, 3, 11, 4, 6, 5, 9, 7, 8],
    hint: 'Arrange the Indian cricket team batting order for ODI matches'
  },
  {
    date: '2025-01-12',
    players: [
      { id: 1, name: 'Joe Root', image: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 2, name: 'Ben Stokes', image: 'https://images.pexels.com/photos/1374510/pexels-photo-1374510.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 3, name: 'Jos Buttler', image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 4, name: 'Jonny Bairstow', image: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 5, name: 'Eoin Morgan', image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 6, name: 'Moeen Ali', image: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 7, name: 'Chris Woakes', image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 8, name: 'Adil Rashid', image: 'https://images.pexels.com/photos/1374510/pexels-photo-1374510.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 9, name: 'Jofra Archer', image: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 10, name: 'Mark Wood', image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' },
      { id: 11, name: 'Jason Roy', image: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }
    ],
    correctOrder: [11, 4, 1, 5, 2, 3, 6, 7, 8, 9, 10],
    hint: 'Arrange the England cricket team batting order for ODI matches'
  }
];

const miniGames = [
  {
    name: 'Cricket Wordle',
    url: 'https://cricketwordle.com',
    description: 'Guess the cricket player in 6 tries',
    color: 'bg-green-600 hover:bg-green-700'
  },
  {
    name: 'Cricket Quiz',
    url: 'https://cricketquiz.com',
    description: 'Test your cricket knowledge',
    color: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    name: 'Fantasy Cricket',
    url: 'https://fantasycricket.com',
    description: 'Build your dream team',
    color: 'bg-purple-600 hover:bg-purple-700'
  },
  {
    name: 'Cricket Trivia',
    url: 'https://crickettrivia.com',
    description: 'Daily cricket trivia',
    color: 'bg-orange-600 hover:bg-orange-600'
  }
];

const CricketGame: React.FC = () => {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [arrangement, setArrangement] = useState<(Player | null)[]>(Array(11).fill(null));
  const [attempts, setAttempts] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<boolean[]>([]);
  const [showPreviousGames, setShowPreviousGames] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const currentGame = gameData[currentGameIndex];

  useEffect(() => {
    if (!hasStarted) {
      trackGameBegin();
      setHasStarted(true);
    }
  }, [hasStarted]);

  const handlePlayerClick = (player: Player) => {
    if (gameOver) return;
    
    setSelectedPlayer(selectedPlayer?.id === player.id ? null : player);
    trackPlayerSelect(player.name, player.id);
  };

  const handleSlotClick = (index: number) => {
    if (gameOver) return;
    
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

  const checkAnswer = () => {
    if (arrangement.some(player => player === null)) {
      alert('Please arrange all players before submitting!');
      return;
    }

    const userOrder = arrangement.map(player => player!.id);
    const correctOrder = currentGame.correctOrder;
    const newFeedback = userOrder.map((id, index) => id === correctOrder[index]);
    
    setFeedback(newFeedback);
    setAttempts(attempts + 1);
    
    const allCorrect = newFeedback.every(correct => correct);
    trackSubmit(attempts + 1, allCorrect);
    
    if (allCorrect) {
      setGameWon(true);
      setGameOver(true);
      trackGameComplete(true, attempts + 1, false);
    } else if (attempts >= 2) {
      setGameOver(true);
      trackGameComplete(false, attempts + 1, false);
    }
  };

  const giveUp = () => {
    setGameOver(true);
    trackGiveUp(attempts);
    trackGameComplete(false, attempts, true);
    
    // Show correct arrangement
    const correctArrangement = currentGame.correctOrder.map(id => 
      currentGame.players.find(player => player.id === id)!
    );
    setArrangement(correctArrangement);
    setFeedback(Array(11).fill(true));
  };

  const resetGame = () => {
    setArrangement(Array(11).fill(null));
    setSelectedPlayer(null);
    setAttempts(0);
    setGameWon(false);
    setGameOver(false);
    setFeedback([]);
    setHasStarted(false);
    trackPlayAgain();
  };

  const shufflePlayers = () => {
    if (gameOver) return;
    
    const shuffled = [...currentGame.players].sort(() => Math.random() - 0.5);
    // This doesn't change the arrangement, just the display order in the UI
  };

  const selectPreviousGame = (index: number) => {
    setCurrentGameIndex(index);
    setShowPreviousGames(false);
    resetGame();
    trackPlayPrevious(gameData[index].date);
  };

  const shareResult = () => {
    const result = gameWon 
      ? `🏏 Cricket Arrange Game ${currentGame.date}\n✅ Solved in ${attempts} attempts!\n\n${arrangement.map((player, i) => `${i + 1}. ${player?.name}`).join('\n')}\n\nPlay at: ${window.location.href}`
      : `🏏 Cricket Arrange Game ${currentGame.date}\n❌ Couldn't solve it in 3 attempts\n\nPlay at: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Cricket Arrange Game',
        text: result
      });
    } else {
      navigator.clipboard.writeText(result);
      alert('Result copied to clipboard!');
    }
    
    trackShare(gameWon, attempts);
  };

  const availablePlayers = currentGame.players.filter(player => 
    !arrangement.some(arrangedPlayer => arrangedPlayer?.id === player.id)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Desktop Ads */}
      <div className="hidden lg:block">
        {/* Desktop Ad 1 - Top Left */}
        <div className="fixed top-4 left-4 z-40">
          <div id="div-gpt-ad-1754030483680-0" style={{ width: '300px', height: '250px' }}>
            <script>
              {typeof window !== 'undefined' && window.googletag && window.googletag.cmd.push(function() {
                window.googletag.display('div-gpt-ad-1754030483680-0');
              })}
            </script>
          </div>
        </div>

        {/* Desktop Ad 2 - Top Right */}
        <div className="fixed top-4 right-4 z-40">
          <div id="div-gpt-ad-1754030700661-0" style={{ width: '300px', height: '250px' }}>
            <script>
              {typeof window !== 'undefined' && window.googletag && window.googletag.cmd.push(function() {
                window.googletag.display('div-gpt-ad-1754030700661-0');
              })}
            </script>
          </div>
        </div>

        {/* Desktop Sticky Ad - Bottom */}
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

      {/* Mobile Sticky Ad */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-800 p-2">
        <div id="div-gpt-ad-1754030829221-0" className="mx-auto" style={{ maxWidth: '336px', minHeight: '50px' }}>
          <script>
            {typeof window !== 'undefined' && window.googletag && window.googletag.cmd.push(function() {
              window.googletag.display('div-gpt-ad-1754030829221-0');
            })}
          </script>
        </div>
      </div>

      {/* Main Game Content */}
      <div className="relative z-10 lg:px-4 lg:pb-28 pb-20">
        <div className="max-w-2xl lg:max-w-2xl mx-auto p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">🏏 Cricket Arrange Game</h1>
            <p className="text-gray-400 mb-4">{currentGame.hint}</p>
            <div className="flex justify-center gap-2 mb-4">
              <button
                onClick={() => setShowPreviousGames(!showPreviousGames)}
                className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Previous Games
              </button>
              <button
                onClick={shufflePlayers}
                disabled={gameOver}
                className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shuffle className="w-4 h-4" />
                Shuffle
              </button>
            </div>
            
            {showPreviousGames && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold mb-3">Select Previous Game</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {gameData.map((game, index) => (
                    <button
                      key={game.date}
                      onClick={() => selectPreviousGame(index)}
                      className={`p-2 rounded text-sm transition-colors ${
                        index === currentGameIndex 
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
          </div>

          {/* Game Status */}
          <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-4 mb-2">
              <span className="text-lg">Attempts: {attempts}/3</span>
              {gameWon && <Trophy className="w-6 h-6 text-yellow-400" />}
            </div>
            {gameOver && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
                <button
                  onClick={shareResult}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            )}
          </div>

          {/* Arrangement Slots */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center">Batting Order</h2>
            <div className="grid grid-cols-1 gap-2">
              {arrangement.map((player, index) => (
                <div
                  key={index}
                  onClick={() => handleSlotClick(index)}
                  className={`
                    min-h-[45px] sm:min-h-[50px] border-2 rounded-lg p-2 cursor-pointer transition-all
                    ${player ? 'bg-gray-700' : 'bg-gray-800 border-dashed'}
                    ${feedback.length > 0 ? (
                      feedback[index] ? 'border-green-400 bg-green-900/20' : 'border-red-400 bg-red-900/20'
                    ) : 'border-gray-600 hover:border-gray-500'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-8">{index + 1}.</span>
                    {player ? (
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={player.image}
                          alt={player.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                        />
                        <span className="font-medium line-clamp-2 sm:line-clamp-none">{player.name}</span>
                        {feedback.length > 0 && (
                          <span className="ml-auto">
                            {feedback[index] ? '✅' : '❌'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">Click to place player</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Players */}
          {availablePlayers.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-center">Available Players</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availablePlayers.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => handlePlayerClick(player)}
                    className={`
                      bg-gray-800 rounded-lg p-3 cursor-pointer transition-all hover:scale-105
                      ${selectedPlayer?.id === player.id ? 'ring-2 ring-blue-400/50 bg-blue-900/20' : 'hover:bg-gray-700/50'}
                    `}
                  >
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={player.image}
                        alt={player.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mb-2"
                      />
                      <span className="text-sm font-medium leading-tight line-clamp-2">{player.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!gameOver && (
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={checkAnswer}
                disabled={arrangement.some(player => player === null)}
                className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
              <button
                onClick={giveUp}
                className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Give Up
              </button>
            </div>
          )}

          {/* Mini Games Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-6">More Cricket Games</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {miniGames.map((game, index) => (
                <a
                  key={index}
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackMiniGameClick(game.name, game.url)}
                  className={`${game.color} rounded-lg p-4 text-center transition-all hover:scale-105 group`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <ExternalLink className="w-5 h-5 group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="font-semibold mb-1">{game.name}</h3>
                  <p className="text-xs opacity-90">{game.description}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CricketGame;