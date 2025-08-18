// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters
    });
  }
};

// Game Events
export const trackGameBegin = () => {
  trackEvent('game_start', {
    game_name: 'cricket_arrange',
    content_type: 'game'
  });
};

export const trackGameComplete = (won: boolean, attempts: number, gaveUp: boolean) => {
  trackEvent('level_end', {
    game_name: 'cricket_arrange',
    level_name: 'main_game',
    success: won,
    game_result: won ? 'win' : 'lose',
    attempts_used: attempts,
    gave_up: gaveUp,
    score: won ? (6 - attempts) * 100 : 0
  });
};

export const trackSubmit = (attempt: number, allCorrect: boolean) => {
  trackEvent('post_score', {
    game_name: 'cricket_arrange',
    level_name: 'main_game',
    attempt_number: attempt,
    all_correct: allCorrect,
    score: allCorrect ? (6 - attempt) * 100 : 0
  });
};

export const trackGiveUp = (attempt: number) => {
  trackEvent('level_end', {
    game_name: 'cricket_arrange',
    level_name: 'main_game',
    success: false,
    game_result: 'gave_up',
    attempts_used: attempt,
    gave_up: true,
    score: 0
  });
};

export const trackPlayerSelect = (playerName: string, playerId: number) => {
  trackEvent('select_item', {
    game_name: 'cricket_arrange',
    item_id: playerId.toString(),
    item_name: playerName,
    content_type: 'player'
  });
};

export const trackSlotSelect = (slotPosition: number, playerName?: string) => {
  trackEvent('select_content', {
    game_name: 'cricket_arrange',
    content_type: 'slot',
    content_id: (slotPosition + 1).toString(),
    player_name: playerName,
    slot_position: slotPosition + 1
  });
};

export const trackPlayerRemove = (playerName: string, slotPosition: number) => {
  trackEvent('remove_from_cart', {
    game_name: 'cricket_arrange',
    item_name: playerName,
    content_type: 'player',
    slot_position: slotPosition + 1
  });
};

export const trackPlayAgain = () => {
  trackEvent('game_start', {
    game_name: 'cricket_arrange',
    content_type: 'game',
    replay: true
  });
};

export const trackPlayPrevious = (selectedDate: string) => {
  trackEvent('select_content', {
    game_name: 'cricket_arrange',
    content_type: 'previous_game',
    content_id: selectedDate,
    selected_date: selectedDate
  });
};

export const trackShare = (gameWon: boolean, attempts: number) => {
  trackEvent('share', {
    game_name: 'cricket_arrange',
    method: 'native_share',
    content_type: 'game_result',
    game_result: gameWon ? 'win' : 'lose',
    attempts_used: attempts
  });
};

export const trackMiniGameClick = (gameName: string, gameUrl: string) => {
  trackEvent('select_content', {
    game_name: 'cricket_arrange',
    content_type: 'external_game',
    content_id: gameName.toLowerCase().replace(/\s+/g, '_'),
    item_name: gameName,
    destination_url: gameUrl
  });
};

// Additional GA4 events for better tracking
export const trackPageView = (pageName: string) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href,
    game_name: 'cricket_arrange'
  });
};

export const trackEngagement = (engagementTime: number) => {
  trackEvent('user_engagement', {
    game_name: 'cricket_arrange',
    engagement_time_msec: engagementTime
  });
};

export const trackError = (errorMessage: string, errorType: string) => {
  trackEvent('exception', {
    game_name: 'cricket_arrange',
    description: errorMessage,
    fatal: false,
    error_type: errorType
  });
};