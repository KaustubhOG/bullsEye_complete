// Blink link generator utilities
// For MVP, we generate deterministic URLs that the backend can verify

export interface BlinkParams {
  goalId: string;
  type: 'verify' | 'claim';
  verifier?: string;
}

export const generateBlinkUrl = (params: BlinkParams): string => {
  const baseUrl = 'https://blink.accountability.app/act';
  const searchParams = new URLSearchParams({
    goal: params.goalId,
    type: params.type,
    ...(params.verifier && { v: params.verifier }),
  });
  
  return `${baseUrl}?${searchParams.toString()}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

export const shareOnTwitter = (text: string, url: string): void => {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, '_blank');
};
