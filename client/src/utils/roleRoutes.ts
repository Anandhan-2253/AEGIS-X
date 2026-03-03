import { UserRole } from '../types';

export function routeForRole(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'SOC_ANALYST':
      return '/soc';
    case 'MALWARE_ANALYST':
      return '/malware';
    case 'PENTESTER':
      return '/pentest';
    default:
      return '/viewer';
  }
}
