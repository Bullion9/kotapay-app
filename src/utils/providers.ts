import { ImageSourcePropType } from 'react-native';
import { logos } from '../assets/logos';

export interface NetworkProvider {
  id: string;
  name: string;
  color: string;
  logo: ImageSourcePropType;
  prefixes: string[];
}

export const NETWORK_PROVIDERS: NetworkProvider[] = [
  {
    id: 'mtn',
    name: 'MTN',
    color: '#FFCC00',
    logo: logos.mtn,
    prefixes: ['0803', '0806', '0813', '0816', '0903', '0906', '0913', '0916'],
  },
  {
    id: 'glo',
    name: 'GLO',
    color: '#00B04F',
    logo: logos.glo,
    prefixes: ['0805', '0807', '0815', '0811', '0905', '0915'],
  },
  {
    id: 'airtel',
    name: 'AIRTEL',
    color: '#FF0000',
    logo: logos.airtel,
    prefixes: ['0802', '0808', '0812', '0701', '0902', '0907', '0912'],
  },
  {
    id: '9mobile',
    name: '9MOBILE',
    color: '#00AA44',
    logo: logos.nineMobile,
    prefixes: ['0809', '0817', '0818', '0909', '0908'],
  },
];

/**
 * Detects network provider based on phone number prefix
 */
export const detectNetworkProvider = (phone: string): NetworkProvider | null => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return null;

  const prefix = cleaned.slice(0, 4);
  
  return NETWORK_PROVIDERS.find(provider =>
    provider.prefixes.some(p => prefix.startsWith(p))
  ) || null;
};

/**
 * Gets provider by ID
 */
export const getProviderById = (id: string): NetworkProvider | null => {
  return NETWORK_PROVIDERS.find(provider => provider.id === id) || null;
};

/**
 * Formats phone number for display
 */
export const formatPhoneNumber = (text: string): string => {
  // Remove all non-numeric characters
  const cleaned = text.replace(/\D/g, '');
  
  // Limit to 11 digits for Nigerian numbers
  const truncated = cleaned.slice(0, 11);
  
  // Format as XXX XXX XXXX
  if (truncated.length >= 7) {
    return truncated.replace(/(\d{3})(\d{3})(\d{0,5})/, '$1 $2 $3').trim();
  } else if (truncated.length >= 4) {
    return truncated.replace(/(\d{3})(\d{0,3})/, '$1 $2').trim();
  }
  return truncated;
};
