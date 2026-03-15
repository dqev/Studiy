/**
 * Custom brand color: #6396fd
 * This color is used throughout the application as the primary brand color
 */

export const BRAND_COLOR = '#6396fd';

// RGB values for the brand color
export const BRAND_COLOR_RGB = '99, 150, 253'; // From #6396fd

// CSS class names using inline styles for custom colors
export const brandColorClasses = {
  // Background colors
  bg: `background-color: ${BRAND_COLOR}`,
  bgLight: `background-color: rgba(99, 150, 253, 0.1)`,
  bgLighter: `background-color: rgba(99, 150, 253, 0.05)`,
  
  // Text colors
  text: `color: ${BRAND_COLOR}`,
  textDark: `color: #5082ea`,
  
  // Border colors
  border: `border-color: ${BRAND_COLOR}`,
  borderLight: `border-color: rgba(99, 150, 253, 0.2)`,
  
  // Ring/Focus colors
  ring: `--tw-ring-color: ${BRAND_COLOR}`,
  ringOffset: `--tw-ring-offset-color: ${BRAND_COLOR}`,
  
  // Shadow
  shadow: `box-shadow: 0 4px 6px rgba(99, 150, 253, 0.1)`,
};
