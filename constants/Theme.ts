// Re-export the new theme system for backward compatibility
import { theme } from '../src/theme';

export { 
  theme, 
  globalStyles, 
  colors, 
  spacing, 
  borderRadius, 
  typography, 
  shadows, 
  iconSizes, 
  animations 
} from '../src/theme';

export default theme;
