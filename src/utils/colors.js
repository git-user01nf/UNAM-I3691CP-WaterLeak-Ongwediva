// src/utils/colors.js
export const COLORS = {
  // Primary
  primary: {
    main: '#0F2B4D',
    dark: '#0A1E36',
    light: '#1E4D7B',
    gradient: ['#0F2B4D', '#1E4D7B', '#2A6B8F'],
  },
  
  // Category Colors
  categories: {
    water: '#00B4D8',
    roads: '#9B5DE5',
    sanitation: '#06D6A0',
    safety: '#EF476F',
    environment: '#06D6A0',
    announcement: '#FFD166',
  },
  
  // Status Colors
  status: {
    pending: '#FF6B6B',
    inProgress: '#FFD166',
    resolved: '#06D6A0',
  },
  
  // Neutrals
  neutral: {
    white: '#FFFFFF',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: {
      primary: '#1A1A2E',
      secondary: '#4A5568',
      muted: '#A0AEC0',
    },
    border: '#E2E8F0',
  },
  
  // Shadows
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

// Category definitions with new colors
export const CATEGORIES = [
  { id: 'all', name: 'All Posts', icon: '📋', color: COLORS.neutral.text.muted },
  { id: 'water', name: 'Water Leaks', icon: '💧', color: COLORS.categories.water },
  { id: 'roads', name: 'Roads', icon: '🛣️', color: COLORS.categories.roads },
  { id: 'sanitation', name: 'Sanitation', icon: '🗑️', color: COLORS.categories.sanitation },
  { id: 'safety', name: 'Safety', icon: '🛡️', color: COLORS.categories.safety },
  { id: 'environment', name: 'Environment', icon: '🌿', color: COLORS.categories.environment },
  { id: 'announcements', name: 'Announcements', icon: '📢', color: COLORS.categories.announcement }
];

// Get category color by ID
export const getCategoryColor = (categoryId) => {
  const category = CATEGORIES.find(c => c.id === categoryId);
  return category ? category.color : COLORS.primary.main;
};