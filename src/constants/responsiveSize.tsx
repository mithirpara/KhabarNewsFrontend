import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 393; // Base width from design
const BASE_HEIGHT = 812; // Base height from design

// Diagonal size of the design (based on Pythagorean theorem)
const BASE_DIAGONAL = Math.sqrt(BASE_WIDTH ** 2 + BASE_HEIGHT ** 2);

// Diagonal size of the screen
const SCREEN_DIAGONAL = Math.sqrt(SCREEN_WIDTH ** 2 + SCREEN_HEIGHT ** 2);

export const responsiveWidth = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
export const responsiveHeight = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

// Calculate responsive font size
export const responsiveFontSize = (size: number) => (SCREEN_DIAGONAL / BASE_DIAGONAL) * size;