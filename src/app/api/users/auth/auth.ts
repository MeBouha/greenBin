export interface Compte {
  login: string;
  password: string;
  etat?: string;
}

export interface UserDTO {
  id: number;
  compte: Compte;
  nom: string;
  prenom: string;
  role: string;
}

export type AuthResult =
  | { user: UserDTO; error?: undefined }
  | { user: null; error: string };

const FAIL_PREFIX = 'auth_fail_';

function readFailCount(login: string) {
  if (typeof window === 'undefined') return 0;
  try {
    return Number(localStorage.getItem(FAIL_PREFIX + login)) || 0;
  } catch {
    return 0;
  }
}

function writeFailCount(login: string, count: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAIL_PREFIX + login, String(count));
  } catch {
    /* ignore storage errors */
  }
}

async function lockAccount(user: UserDTO) {
  try {
    const payload = {
      ...user,
      compte: { ...user.compte, etat: 'bloqué' },
    };
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('lockAccount failed', err);
  }
}

export async function validateUserCredentials(username: string, password: string): Promise<AuthResult> {
  try {
    const usernameTrim = username?.toString().trim();
    const passwordTrim = password?.toString().trim();
    if (!usernameTrim || !passwordTrim) {
      return { user: null, error: 'Identifiants manquants' };
    }

    const response = await fetch('/api/users');
    if (!response.ok) return { user: null, error: 'Service indisponible' };
    const users: any[] = await response.json();

    const candidate = (users || []).find(u => (u.compte?.login === usernameTrim) || (String(u.id) === usernameTrim));
    if (!candidate) {
      return { user: null, error: 'Identifiants incorrects' };
    }

    const compte = candidate.compte || {};
    const etat = (compte.etat || '').toLowerCase();
    if (etat && etat !== 'actif') {
      return { user: null, error: 'Compte bloqué, contactez un administrateur' };
    }

    const passwordMatches = (compte.password || '') === passwordTrim;
    if (passwordMatches) {
      writeFailCount(usernameTrim, 0);
      return {
        user: {
          id: Number(candidate.id) || 0,
          compte: { login: compte.login || '', password: compte.password || '', etat: compte.etat },
          nom: candidate.nom || '',
          prenom: candidate.prenom || '',
          role: candidate.role || '',
        },
      };
    }

    // password wrong -> increment fail count
    const nextFail = readFailCount(usernameTrim) + 1;
    writeFailCount(usernameTrim, nextFail);

    if (nextFail >= 4) {
      await lockAccount({
        id: Number(candidate.id) || 0,
        compte: { login: compte.login || '', password: compte.password || '', etat: compte.etat },
        nom: candidate.nom || '',
        prenom: candidate.prenom || '',
        role: candidate.role || '',
      });
      return { user: null, error: 'Compte bloqué après 4 échecs' };
    }

    return { user: null, error: `Identifiants incorrects` };
  } catch (error) {
    console.error('Erreur lors de la validation des credentials:', error);
    return { user: null, error: 'Erreur interne' };
  }
}
