// app/utils/responsive.ts

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Width Percentage
 * Gebruik dit om breedte/afstanden/font sizes op basis van schermbreedte te schalen
 */
export const wp = (percentage: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * percentage) / 100);
};

/**
 * Height Percentage
 * Gebruik dit om hoogtes/margins/padding op basis van schermhoogte te schalen
 */
export const hp = (percentage: number): number => {
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * percentage) / 100);
};

/**
 * Schermmetingen (optioneel te gebruiken)
 */
export const SCREEN = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};

/**
 * Kleine apparaten check (optioneel)
 */
export const isSmallDevice = SCREEN_WIDTH < 360;
