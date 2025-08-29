// Simple utility to check if user has premium experience
export const isPremiumUser = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('premium-experience') === '1';
};

// Function to conditionally load ads based on premium status
export const shouldShowAds = (): boolean => {
  return !isPremiumUser();
};