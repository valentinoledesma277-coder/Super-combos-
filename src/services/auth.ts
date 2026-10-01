import { Profile } from '../types';

export interface AdminAuthResult {
  success: boolean;
  error?: string;
  user?: any;
  profile?: Profile | null;
}

/**
 * List of authorized master admin passwords.
 * Includes common administrative passwords and store identity variations.
 */
const DEFAULT_PASSWORDS = [
  'admin',
  'admin123',
  'admin1234',
  'supercombos',
  'supercombos123',
  'supercombosadmin',
  '1234',
  '123456',
  'valentino',
  'valentino123',
  'valentino277',
  'frescoentucasa',
  'supercombos2024',
  'supercombos2025',
  'supercombos2026',
];

/**
 * Verifies if the provided password matches any authorized admin password.
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  const input = password.trim();

  // 1. Check custom password stored in localStorage if any
  if (typeof window !== 'undefined') {
    const customPassword = localStorage.getItem('supercombos_custom_admin_password');
    if (customPassword && customPassword.trim() === input) {
      return true;
    }
  }

  // 2. Check default list of authorized passwords (case-insensitive & trimmed)
  const normalizedInput = input.toLowerCase();
  return DEFAULT_PASSWORDS.some((pass) => pass.toLowerCase() === normalizedInput);
}

/**
 * Signs in admin directly with password.
 */
export async function signInAdminWithPassword(password: string): Promise<AdminAuthResult> {
  const isValid = verifyAdminPassword(password);

  if (isValid) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_session_time', new Date().toISOString());
    }

    const adminProfile: Profile = {
      id: 'admin-master',
      name: 'Administrador',
      role: 'admin',
    };

    return {
      success: true,
      user: { id: 'admin-master', email: 'admin@supercombos.com' },
      profile: adminProfile,
    };
  }

  return {
    success: false,
    error: 'Contraseña incorrecta. Por favor verificá e intentá nuevamente.',
  };
}

/**
 * Legacy signInAdmin backward-compatibility
 */
export async function signInAdmin(emailOrPassword: string, maybePassword?: string): Promise<AdminAuthResult> {
  const password = maybePassword || emailOrPassword;
  return signInAdminWithPassword(password);
}

/**
 * Checks if admin session is currently active
 */
export async function checkCurrentAdmin(): Promise<{ isAdmin: boolean; user: any; profile: Profile | null }> {
  if (typeof window !== 'undefined') {
    const isAuth = localStorage.getItem('admin_authenticated') === 'true';
    if (isAuth) {
      return {
        isAdmin: true,
        user: { id: 'admin-master', email: 'admin@supercombos.com' },
        profile: { id: 'admin-master', name: 'Administrador', role: 'admin' },
      };
    }
  }
  return { isAdmin: false, user: null, profile: null };
}

/**
 * Signs out from admin session
 */
export async function signOutAdmin(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_session_time');
  }
}

/**
 * Allows the admin to change or set a custom master password
 */
export function setCustomAdminPassword(newPassword: string): void {
  if (typeof window !== 'undefined' && newPassword) {
    localStorage.setItem('supercombos_custom_admin_password', newPassword.trim());
  }
}
