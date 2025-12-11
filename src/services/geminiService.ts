// services/geminiService.ts
// V0.1 CLEAN BUILD: AI features disabled for production stability

export const generateListingDetails = async (_base64Image: string) => {
  console.warn('[V0.1 Clean Build] AI Enhancement is disabled.');

  // Return a dummy response that matches expected interface
  return {
    title: '',
    description: '',
    price_cents: 0,
    category: '',
    condition: 'Used - Good'
  };
};

// Flag to check AI availability in UI
export const isAIEnabled = false;
