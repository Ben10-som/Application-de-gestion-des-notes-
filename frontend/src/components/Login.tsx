import { useState } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import PixelPattern from './PixelPattern';
import api from '../api';

interface LoginProps {
  onLogin: (role: 'student' | 'professor' | 'admin') => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        nom,
        prenom,
        mot_de_passe: motDePasse
      });

      const data = response.data;
      localStorage.setItem('access_token', data.access_token);
      
      // role string maps slightly differently maybe: 'Etudiant' -> 'student', 'Professeur' -> 'professor', 'Admin' -> 'admin'
      const roleMap: Record<string, 'student' | 'professor' | 'admin'> = {
        'Etudiant': 'student',
        'Professeur': 'professor',
        'Admin': 'admin'
      };

      onLogin(roleMap[data.user.role]);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to fill test credentials
  const fillTestCredentials = (r: string) => {
    setMotDePasse(r.toLowerCase() + '123'); // e.g. admin123, prof123, etu123
    if (r === 'Admin') { setNom('Admin'); setPrenom('Super'); }
    if (r === 'Prof') { setNom('Prof'); setPrenom('Test'); }
    if (r === 'Etu') { setNom('Etu'); setPrenom('Test'); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Pixel decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-full text-indigo-600 opacity-20 pointer-events-none">
         <PixelPattern />
      </div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 text-indigo-400 opacity-10 pointer-events-none">
         <PixelPattern />
      </div>

      <div className="max-w-4xl mx-auto text-center px-6 z-10 w-full">
        <div className="mb-8 flex justify-center">
          <div className="w-12 h-12 bg-indigo-600 grid grid-cols-2 gap-0.5 p-1.5 rounded-md shadow-lg shadow-indigo-200">
             <div className="bg-white/80 rounded-sm"></div>
             <div className="bg-white/40 rounded-sm"></div>
             <div className="bg-white/60 rounded-sm"></div>
             <div className="bg-white/90 rounded-sm"></div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 mb-6">
          Application de <br/>
          <span className="flex items-center justify-center gap-2 md:gap-4 mt-2 text-indigo-600">
            <Sparkles className="w-8 h-8 md:w-12 md:h-12" />
            Gestion des Notes
            <Sparkles className="w-8 h-8 md:w-12 md:h-12" />
          </span>
        </h1>
        <p className="text-xl text-slate-500 mb-8 max-w-2xl mx-auto">
          Plateforme pour étudiants, professeurs et administrateurs.
        </p>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-8 max-w-md mx-auto relative text-left">
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-indigo-500 rounded-sm rotate-12"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-slate-800 rounded-sm -rotate-6"></div>
          
          <h2 className="text-2xl font-semibold mb-6 text-slate-900 text-center">Connexion</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
              <input 
                type="text" 
                required
                value={nom}
                onChange={e => setNom(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Votre nom"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
              <input 
                type="text" 
                required
                value={prenom}
                onChange={e => setPrenom(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Votre prénom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <input 
                type="password" 
                required
                value={motDePasse}
                onChange={e => setMotDePasse(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium disabled:opacity-70 mt-6"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se Connecter'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* Quick test buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-3 text-center uppercase tracking-wider font-semibold">Générer Identifiants de test</p>
            <div className="flex justify-center gap-2">
               <button type="button" onClick={() => fillTestCredentials('Etu')} className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 font-medium transition-colors">Étudiant</button>
               <button type="button" onClick={() => fillTestCredentials('Prof')} className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 font-medium transition-colors">Professeur</button>
               <button type="button" onClick={() => fillTestCredentials('Admin')} className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700 font-medium transition-colors">Admin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
