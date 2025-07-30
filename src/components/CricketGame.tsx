import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, AlertCircle, Send, Calendar, ExternalLink, X, Gamepad2, Flag } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  image: string;
  stats: string;
  correctPosition: number;
}

interface GameData {
  date: string;
  order: string;
  question: string;
  players: Player[];
}

interface GameDate {
  date: string;
  question: string;
}

export default function CricketGame() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [arrangedPlayers, setArrangedPlayers] = useState<(Player | null)[]>([null, null, null, null, null]);
  const [positionColors, setPositionColors] = useState<string[]>(['', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [animatingPlayer, setAnimatingPlayer] = useState<number | null>(null);
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [showGameSelector, setShowGameSelector] = useState<boolean>(false);
  const [availableDates, setAvailableDates] = useState<GameDate[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(new Date().toLocaleDateString('en-US'));
  const [gaveUp, setGaveUp] = useState<boolean>(false);

  const handleGiveUp = () => {
    if (!gameData || gameComplete) return;
    
    // Set all positions to correct answers
    const correctOrder = [...gameData.players].sort((a, b) => a.correctPosition - b.correctPosition);
    setArrangedPlayers(correctOrder);
    setAvailablePlayers([]);
    
    // Mark all as correct (green)
    setPositionColors(new Array(correctOrder.length).fill('green'));
    
    // End the game as a loss
    setAttempts(5); // Set to max attempts
    setGameComplete(true);
    setGameWon(false);
    setGaveUp(true);
    
    setTimeout(() => setShowResults(true), 2000);
  };
  useEffect(() => {
    fetchGameData();
  }, []);

  useEffect(() => {
    if (gameData) {
      setAvailablePlayers([...gameData.players]);
    }
  }, [gameData]);

  useEffect(() => {
    // Check if all positions are filled
    const allFilled = arrangedPlayers.every(p => p !== null);
    setCanSubmit(allFilled);
  }, [arrangedPlayers]);

  const fetchGameData = async (targetDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert Google Sheets URL to CSV export URL
      const sheetId = '1H_VnLMaJMqVh6948t-lK6EUd01sQ8JsElhG7beNiaPQ';
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch data from Google Sheets');
      }
      
      const csvText = await response.text();
      const rows = csvText.split('\n').map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));
      
      if (rows.length < 2) {
        throw new Error('No data found in the spreadsheet');
      }
      
      // Extract all available dates for the game selector
      const dates: GameDate[] = [];
      rows.slice(1).forEach(row => {
        if (row[0] && row[2] && row[0] !== currentDate) { // date and question exist, exclude current date
          const rowDate = new Date(row[0]);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset time to compare only dates
          
          // Only include dates that are in the past
          if (rowDate < today) {
            dates.push({
              date: row[0],
              question: row[2]
            });
          }
        }
      });
      // Sort dates in descending order and take only the 5 most recent past dates
      const sortedDates = dates.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      }).slice(0, 5);
      setAvailableDates(sortedDates);
      
      // Find the row with today's date (skip header row)
      const dateToFind = targetDate || currentDate;
      let dataRow = rows.slice(1).find(row => row[0] === dateToFind);
      
      // If today's data is not found, use the most recent available date
      if (!dataRow) {
        const allAvailableDates = rows.slice(1)
          .filter(row => row[0] && row[2]) // has date and question
          .sort((a, b) => {
            const dateA = new Date(a[0]);
            const dateB = new Date(b[0]);
            return dateB.getTime() - dateA.getTime();
          });
        
        if (allAvailableDates.length > 0) {
          dataRow = allAvailableDates[0];
          // Update currentDate to reflect the actual date being used
          if (!targetDate) {
            setCurrentDate(dataRow[0]);
          }
        } else {
          throw new Error(`No game data found in the spreadsheet`);
        }
      } else if (targetDate) {
        // Update currentDate when a specific date was selected and found
        setCurrentDate(targetDate);
      }
      
      if (dataRow.length < 18) {
        throw new Error('Incomplete data in the spreadsheet');
      }
      
      const players: Player[] = [];
      
      // Extract player data (5 players, 3 columns each: name, stats, image)
      for (let i = 0; i < 5; i++) {
        const nameIndex = 3 + (i * 3);
        const statsIndex = 4 + (i * 3);
        const imageIndex = 5 + (i * 3);
        
        if (dataRow[nameIndex] && dataRow[statsIndex] && dataRow[imageIndex]) {
          players.push({
            id: i + 1,
            name: dataRow[nameIndex],
            stats: dataRow[statsIndex],
            image: dataRow[imageIndex],
            correctPosition: i + 1
          });
        }
      }
      
      if (players.length === 0) {
        throw new Error('No valid player data found');
      }
      
      const gameData: GameData = {
        date: dataRow[0] || new Date().toLocaleDateString(),
        order: dataRow[1] || 'ascending',
        question: dataRow[2] || 'Arrange the players',
        players: players
      };
      
      // Shuffle players for the game
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
      gameData.players = shuffledPlayers;
      
      setGameData(gameData);
      setArrangedPlayers(new Array(players.length).fill(null));
      setPositionColors(new Array(players.length).fill(''));
      
    } catch (err) {
      console.error('Error fetching game data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load game data');
      
      // Fallback data
      const fallbackData: GameData = {
        date: new Date().toLocaleDateString(),
        order: 'ascending',
        question: 'Arrange by ODI Runs (Highest to Lowest)',
        players: [
          {
            id: 1,
            name: "Virat Kohli",
            image: "https://images.pexels.com/photos/163398/cricket-batsman-player-sport-163398.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
            correctPosition: 1,
            stats: "12,898 runs"
          },
          {
            id: 2,
            name: "Rohit Sharma",
            image: "https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
            correctPosition: 2,
            stats: "10,709 runs"
          },
          {
            id: 3,
            name: "MS Dhoni",
            image: "https://images.pexels.com/photos/1263348/pexels-photo-1263348.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
            correctPosition: 3,
            stats: "10,773 runs"
          },
          {
            id: 4,
            name: "Shikhar Dhawan",
            image: "https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
            correctPosition: 4,
            stats: "6,793 runs"
          },
          {
            id: 5,
            name: "KL Rahul",
            image: "https://images.pexels.com/photos/1263347/pexels-photo-1263347.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
            correctPosition: 5,
            stats: "2,962 runs"
          }
        ]
      };
      
      setGameData(fallbackData);
      setArrangedPlayers(new Array(fallbackData.players.length).fill(null));
      setPositionColors(new Array(fallbackData.players.length).fill(''));
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectedDate: string) => {
    setShowGameSelector(false);
    // Reset game state
    setSelectedPlayer(null);
    setAttempts(0);
    setGameComplete(false);
    setGameWon(false);
    setShowResults(false);
    setArrangedPlayers([]);
    setPositionColors([]);
    setCanSubmit(false);
    setGaveUp(false);
    // Fetch new data
    fetchGameData(selectedDate);
  };

  const handlePlayerClick = (player: Player) => {
    if (gameComplete || showResults) return;
    setSelectedPlayer(player);
  };

  const handlePositionClick = (positionIndex: number) => {
    if (!selectedPlayer || gameComplete || showResults || !gameData) return;

    // Add animation
    setAnimatingPlayer(selectedPlayer.id);
    
    setTimeout(() => {
      const newArrangedPlayers = [...arrangedPlayers];
      
      // Remove player from any existing position
      const existingIndex = newArrangedPlayers.findIndex(p => p?.id === selectedPlayer.id);
      if (existingIndex !== -1) {
        newArrangedPlayers[existingIndex] = null;
      }

      // Place player in new position
      newArrangedPlayers[positionIndex] = selectedPlayer;
      
      // Remove player from available players
      const newAvailablePlayers = availablePlayers.filter(p => p.id !== selectedPlayer.id);
      
      // If there was a player in this position, add them back to available players
      if (arrangedPlayers[positionIndex]) {
        newAvailablePlayers.push(arrangedPlayers[positionIndex]!);
      }
      
      setArrangedPlayers(newArrangedPlayers);
      setAvailablePlayers(newAvailablePlayers);
      setSelectedPlayer(null);
      setAnimatingPlayer(null);
    }, 300);
  };

  const handleSubmit = () => {
    if (!canSubmit || !gameData) return;

    const newPositionColors = arrangedPlayers.map((player, index) => {
      if (player && player.correctPosition === index + 1) {
        return 'green';
      }
      return 'red';
    });

    setPositionColors(newPositionColors);
    setAttempts(prev => prev + 1);

    // Check if all positions are correct
    const allCorrect = arrangedPlayers.every((player, index) => 
      player?.correctPosition === index + 1
    );

    if (allCorrect) {
      setGameWon(true);
      setGameComplete(true);
      setTimeout(() => setShowResults(true), 2000);
    } else if (attempts + 1 >= 5) {
      setGameComplete(true);
      setTimeout(() => setShowResults(true), 2000);
    } else {
      // Move incorrect players back to queue after showing colors
      setTimeout(() => {
        const correctPlayers = arrangedPlayers.map((player, index) => {
          if (player && player.correctPosition === index + 1) {
            return player; // Keep correct players
          }
          return null; // Remove incorrect players
        });

        const incorrectPlayers = arrangedPlayers.filter((player, index) => {
          return player && player.correctPosition !== index + 1;
        });

        setArrangedPlayers(correctPlayers);
        setAvailablePlayers([...availablePlayers, ...incorrectPlayers]);
        setPositionColors(correctPlayers.map(p => p ? 'green' : ''));
      }, 2000);
    }
  };

  const resetGame = () => {
    if (!gameData) return;
    
    const shuffled = [...gameData.players].sort(() => Math.random() - 0.5);
    setGameData({ ...gameData, players: shuffled });
    setAvailablePlayers([...shuffled]);
    setSelectedPlayer(null);
    setAttempts(0);
    setGameComplete(false);
    setGameWon(false);
    setShowResults(false);
    setArrangedPlayers(new Array(gameData.players.length).fill(null));
    setPositionColors(new Array(gameData.players.length).fill(''));
    setCanSubmit(false);
    setGaveUp(false);
  };

  const getPositionBorderColor = (index: number) => {
    const color = positionColors[index];
    if (color === 'green') return 'border-green-400 bg-green-900/20';
    if (color === 'red') return 'border-red-400 bg-red-900/20';
    return selectedPlayer ? 'border-blue-400 bg-blue-900/20' : 'border-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-3"></div>
          <p className="text-gray-300 text-sm">Loading cricket game...</p>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center bg-gray-800 rounded-lg p-6 shadow-lg max-w-sm w-full">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Failed to Load</h2>
          <p className="text-gray-300 text-sm mb-4">{error}</p>
          <button
            onClick={() => fetchGameData()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Results Page
  if (showResults) {
    const correctOrder = [...gameData.players].sort((a, b) => a.correctPosition - b.correctPosition);
    
    return (
      <div className="min-h-screen bg-gray-900 p-3">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-4">
            <div className="mb-3">
              {gameWon ? (
                <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
              ) : (
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
              {gameWon ? '🎉 Congratulations!' : '😔 Game Over!'}
            </h1>
            <p className="text-sm text-gray-300 mb-3">
              {gameWon 
                ? `You completed the challenge in ${attempts} attempts!`
                : gaveUp 
                  ? `You gave up! Don't worry, it happens to the best of us.`
                  : `You used all 5 attempts. Better luck next time!`
              }
            </p>
          </div>

          {/* Game Stats */}
          <div className="bg-gray-800 rounded-lg p-3 mb-4">
            <h2 className="text-base font-bold text-white mb-3">Game Statistics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="text-center p-2 bg-blue-900/30 rounded-lg border border-blue-400/30">
                <div className="text-lg font-bold text-blue-400">{attempts}</div>
                <div className="text-xs text-gray-300">Attempts</div>
              </div>
              <div className="text-center p-2 bg-green-900/30 rounded-lg border border-green-400/30">
                <div className="text-lg font-bold text-green-400">
                  {positionColors.filter(color => color === 'green').length}
                </div>
                <div className="text-xs text-gray-300">Correct</div>
              </div>
              <div className="text-center p-2 bg-red-900/30 rounded-lg border border-red-400/30">
                <div className="text-lg font-bold text-red-400">
                  {positionColors.filter(color => color === 'red').length}
                </div>
                <div className="text-xs text-gray-300">Wrong</div>
              </div>
              <div className="text-center p-2 bg-yellow-900/30 rounded-lg border border-yellow-400/30">
                <div className="text-lg font-bold text-yellow-400">
                  {gameWon ? '100%' : `${Math.round((positionColors.filter(color => color === 'green').length / 5) * 100)}%`}
                </div>
                <div className="text-xs text-gray-300">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Play Again Button */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={resetGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              <button
                onClick={() => setShowGameSelector(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-lg text-sm"
              >
                <Calendar className="w-4 h-4" />
                Play Previous Games
              </button>
            </div>
          </div>

          {/* Correct Order Display */}
          <div className="bg-gray-800 rounded-lg p-3 mb-4">
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-green-400" />
              Correct Order - {gameData.question}
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {correctOrder.map((player, index) => (
                <div key={player.id} className="bg-green-900/30 rounded-lg p-2 border border-green-400/30">
                  <div className="text-center">
                    <div className="w-5 h-5 rounded-full bg-green-500 text-white font-bold flex items-center justify-center text-xs mx-auto mb-2">
                      {index + 1}
                    </div>
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-600 mx-auto mb-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.pexels.com/photos/163398/cricket-batsman-player-sport-163398.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop";
                      }}
                    />
                    <h3 className="font-semibold text-white text-xs mb-1 leading-tight">{player.name}</h3>
                    <p className="text-xs text-gray-300 bg-gray-700 rounded px-2 py-0.5">
                      {player.stats}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Other Games Section */}
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-purple-400" />
              More Cricket Games
            </h2>
            <div className="flex gap-3 justify-center">
              <a
                href="https://www.sportskeeda.com/cricket/quiz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white rounded-lg transition-all duration-200 group shadow-lg"
              >
                <img 
                  src="https://staticg.sportskeeda.com/cmc/mini-games/cricket-daily-trivia.png?w=200" 
                  alt="Cricket Quiz" 
                  className="w-20 h-[72px] rounded-lg object-cover group-hover:scale-105 transition-transform"
                />
              </a>
              
              <a
                href="https://staticg.sportskeeda.com/games/cricket/guess_the_stats/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white rounded-lg transition-all duration-200 group shadow-lg"
              >
                <img 
                  src="https://staticg.sportskeeda.com/cmc/mini-games/guess-the-stats-game.png?w=200" 
                  alt="Guess Stats" 
                  className="w-20 h-[72px] rounded-lg object-cover group-hover:scale-105 transition-transform"
                />
              </a>
              
              <a
                href="https://staticg.sportskeeda.com/games/cricket/hi_low_stats_game/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white rounded-lg transition-all duration-200 group shadow-lg"
              >
                <img 
                  src="https://staticg.sportskeeda.com/cmc/mini-games/high-or-low-stats-game.png?w=200" 
                  alt="Hi-Low Stats" 
                  className="w-20 h-[72px] rounded-lg object-cover group-hover:scale-105 transition-transform"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Game Selector Popup - moved outside conditional rendering */}
        {showGameSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Select Game Date
                </h2>
                <button
                  onClick={() => setShowGameSelector(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                {availableDates.map((gameDate, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(gameDate.date)}
                    className="w-full text-left p-3 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 text-white transition-all duration-200"
                  >
                    <div className="font-semibold text-sm">{gameDate.date}</div>
                    <div className="text-xs text-gray-300 mt-1">{gameDate.question}</div>
                  </button>
                ))}
              </div>
              
              {availableDates.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No previous games available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-2">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            🏏 Cricket Arrange Game
          </h1>
        </div>

        {/* Game Complete Messages */}
        {gameComplete && !showResults && (
          <div className="text-center mb-4">
            {gameWon ? (
              <div className="bg-green-900/30 border border-green-400/30 rounded-lg p-3 shadow-md max-w-sm mx-auto">
                <Trophy className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <h2 className="text-base font-bold text-green-400 mb-1">
                  🎉 Congratulations!
                </h2>
                <p className="text-green-300 text-xs">
                  You arranged all players correctly in {attempts} attempts!
                </p>
              </div>
            ) : (
              <div className="bg-red-900/30 border border-red-400/30 rounded-lg p-3 shadow-md max-w-sm mx-auto">
                <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <h2 className="text-base font-bold text-red-400 mb-1">
                  Game Over!
                </h2>
                <p className="text-red-300 text-xs">
                  {gaveUp 
                    ? "You gave up! Check the results to see the correct answer."
                    : "You've used all 5 attempts. Check the results!"
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Player Pool */}
        <div className="bg-gray-800 rounded-lg p-3 mb-3">
          <h2 className="text-sm font-bold text-white mb-2">
            {gameData.question}
          </h2>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {availablePlayers.map((player) => (
              <div
                key={player.id}
                onClick={() => handlePlayerClick(player)}
                className={`
                  p-2 rounded-lg border transition-all duration-300 cursor-pointer text-center
                  ${selectedPlayer?.id === player.id 
                    ? 'border-blue-400 bg-blue-900/30 shadow-md transform scale-105' 
                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                  }
                  ${animatingPlayer === player.id ? 'animate-pulse' : ''}
                `}
              >
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-600 mx-auto mb-1"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.pexels.com/photos/163398/cricket-batsman-player-sport-163398.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop";
                  }}
                />
                <h3 className="font-medium text-white text-xs leading-tight">{player.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Arrangement Area */}
        <div className="bg-gray-800 rounded-lg p-3 mb-3">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold text-white">
              Your Answer
            </h2>
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-orange-400" />
              <span className="text-xs font-medium text-gray-300">Attempts:</span>
              <span className="text-sm font-bold text-orange-400">{attempts}/5</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {arrangedPlayers.map((player, index) => (
              <div
                key={index}
                onClick={() => handlePositionClick(index)}
                className={`
                  p-1.5 rounded-lg border-2 transition-all duration-300 cursor-pointer min-h-[50px] text-center relative
                  ${getPositionBorderColor(index)}
                  hover:border-blue-400 hover:bg-blue-900/20
                `}
              >
                <div className={`absolute top-1 left-1 text-xs font-bold ${
                  positionColors[index] === 'green' 
                    ? 'text-green-400' 
                    : positionColors[index] === 'red'
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`}>
                  {index + 1}
                </div>
                
                {player ? (
                  <div>
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-600 mx-auto mb-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.pexels.com/photos/163398/cricket-batsman-player-sport-163398.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop";
                      }}
                    />
                    <h3 className="font-medium text-white text-xs leading-tight">{player.name}</h3>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs">
                    {selectedPlayer ? 'Click here' : 'Empty'}
                  </div>
                )}
              </div>
            ))}
            
            {/* Submit Button next to 5th tile */}
            <div className="flex items-center justify-center">
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || gameComplete}
                  className={`
                    px-2 py-1.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 shadow-lg text-xs
                    ${canSubmit && !gameComplete
                      ? 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <Send className="w-3 h-3" />
                  Submit
                </button>
                
                <button
                  onClick={handleGiveUp}
                  disabled={gameComplete}
                  className={`
                    px-2 py-1.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 shadow-lg text-xs
                    ${!gameComplete
                      ? 'bg-red-600 hover:bg-red-700 text-white transform hover:scale-105'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <Flag className="w-3 h-3" />
                  Give Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Selector Popup - moved outside conditional rendering */}
      {showGameSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Select Game Date
              </h2>
              <button
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {availableDates.map((gameDate, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSelect(gameDate.date)}
                  className="w-full text-left p-3 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 text-white transition-all duration-200"
                >
                  <div className="font-semibold text-sm">{gameDate.date}</div>
                  <div className="text-xs text-gray-300 mt-1">{gameDate.question}</div>
                </button>
              ))}
            </div>
            
            {availableDates.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No previous games available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}