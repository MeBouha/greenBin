"use client"

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
// Images are served from the `public/` folder — reference by path instead of importing
// (importing from /public is not supported by Next.js)
import { validateUserCredentials } from './auth';

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    
    if (!username || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const user = await validateUserCredentials(username, password);
    
    if (user) {
      console.log('User connecté:', user);
      const role = (user.role || '').toLowerCase().trim();
      // store user in session so dashboard pages can read it
      try { sessionStorage.setItem('user', JSON.stringify(user)); } catch (e) {}

      // map role to route under /gestion_utilisateurs
      let path = '/';
      if (role.includes('admin')) path = '/gestion_utilisateurs/admin';
      else if (role.includes('responsable municipalite') || role.includes('responsable municipalité') || role.includes('responsable municipalité')) path = '/gestion_utilisateurs/responsable-municipalite';
      else if (role.includes('responsable service de voirie') || role.includes('voirie')) path = '/gestion_utilisateurs/responsable-service-voirie';
      else if (role.includes("responsable service d'environnement") || role.includes('environnement')) path = '/gestion_utilisateurs/responsable-service-environnement';
      else if (role.includes('chef de tournee') || role.includes('chef de tournée') || role.includes('chef')) path = '/gestion_utilisateurs/chef-de-tournee';
      else if (role.includes('ouvrier')) path = '/gestion_utilisateurs/ouvrier';
      else if (role.includes('citoyen')) path = '/gestion_utilisateurs/citoyen';
      else path = '/';

      router.push(path);
    } else {
      setError('Identifiants incorrects ou compte inactif');
    }
  };

  return (
    <>
      <div className="logo">
        <Image src="/logo.png" alt="logo" width={120} height={60} />
      </div>

      <div className="bigBox">
        <div className="templeftBox">
          <Image src="/cleanLogin.png" alt="cleanLogin" className='cleanLogin' width={400} height={400} />
        </div>
        <div className="temprightBox">
          <h1>Bonjour à Nouveau</h1>
          <p>Bienvenue, Gardons le Monde Propre!</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <div>
            <input 
              type="text" 
              placeholder='Enter username' 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="password-container">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder='Password' 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button" 
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button className="login-button" onClick={handleLogin}>
            Connecter
          </button>
        </div>
      </div>
    </>
  );
}
