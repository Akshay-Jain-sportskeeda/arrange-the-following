// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'Cricket Game',
      ...parameters
    });
  }
};

// Game Events
export const trackGameBegin = () => {
  trackEvent('game_begin', {
    event_label: 'New game started'
  });
};

export const trackGameComplete = (won: boolean, attempts: number, gaveUp: boolean) => {
  trackEvent('game_complete', {
    event_label: won ? 'Game Won' : 'Game Lost',
    game_result: won ? 'win' : 'lose',
    attempts_used: attempts,
    gave_up: gaveUp,
    value: won ? attempts : 0
  });
};

export const trackSubmit = (attempt: number, allCorrect: boolean) => {
  trackEvent('submit_answer', {
    event_label: `Attempt ${attempt}`,
    attempt_number: attempt,
    all_correct: allCorrect,
    value: attempt
  });
};

export const trackGiveUp = (attempt: number) => {
  trackEvent('give_up', {
    event_label: `Gave up at attempt ${attempt}`,
    attempt_number: attempt
  });
};

export const trackPlayerSelect = (playerName: string, playerId: number) => {
  trackEvent('player_select', {
    event_label: `Selected ${playerName}`,
    player_name: playerName,
    player_id: playerId
  });
};

export const trackSlotSelect = (slotPosition: number, playerName?: string) => {
  trackEvent('slot_select', {
    event_label: `Slot ${slotPosition + 1} selected`,
    slot_position: slotPosition + 1,
    player_placed: playerName || 'none'
  });
};

export const trackPlayerRemove = (playerName: string, slotPosition: number) => {
  trackEvent('player_remove', {
    event_label: `Removed ${playerName} from slot ${slotPosition + 1}`,
    player_name: playerName,
    slot_position: slotPosition + 1
  });
};

export const trackPlayAgain = () => {
  trackEvent('play_again', {
    event_label: 'Started new game'
  });
};

export const trackPlayPrevious = (selectedDate: string) => {
  trackEvent('play_previous', {
    event_label: `Selected previous game: ${selectedDate}`,
    selected_date: selectedDate
  });
};

export const trackShare = (gameWon: boolean, attempts: number) => {
  trackEvent('share', {
    event_label: gameWon ? 'Shared winning game' : 'Shared game',
    game_result: gameWon ? 'win' : 'lose',
    attempts_used: attempts
  });
};

export const trackMiniGameClick = (gameName: string, gameUrl: string) => {
  trackEvent('mini_game_click', {
    event_label: `Clicked ${gameName}`,
    game_name: gameName,
    game_url: gameUrl
  });
};