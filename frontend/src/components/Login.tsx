import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Eye, EyeOff, User } from 'lucide-react';
import PixelPattern from './PixelPattern';
import api from '../api';

interface LoginProps {
  onLogin: (role: 'student' | 'professor' | 'admin') => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        username,
        mot_de_passe: motDePasse
      });

      const data = response.data;
      localStorage.setItem('access_token', data.access_token);
      
      const roleMap: Record<string, 'student' | 'professor' | 'admin'> = {
        'Etudiant': 'student',
        'Professeur': 'professor',
        'Admin': 'admin'
      };

      onLogin(roleMap[data.user.role]);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to fill test credentials
  const fillTestCredentials = (type: 'Admin' | 'Prof' | 'Etu') => {
    if (type === 'Admin') { setUsername('admin'); setMotDePasse('admin123'); }
    if (type === 'Prof') { setUsername('jdupont'); setMotDePasse('prof123'); }
    if (type === 'Etu') { setUsername('alice'); setMotDePasse('etu123'); }
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
          Plateforme centralisée pour le suivi académique.
        </p>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-8 max-w-md mx-auto relative text-left overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <h2 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600" /> Connexion
          </h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Identifiant</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                placeholder="Ex: jdupont"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Mot de passe</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={motDePasse}
                  onChange={e => setMotDePasse(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all pr-12 placeholder:text-slate-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all font-bold disabled:opacity-70 mt-4 active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accéder au tableau de bord'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* Quick test buttons */}
          <div className="mt-10 pt-6 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 mb-4 text-center uppercase tracking-[0.2em] font-black">Accès rapide (Test)</p>
            <div className="flex justify-center gap-3">
               <button type="button" onClick={() => fillTestCredentials('Etu')} className="px-4 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 rounded-xl text-slate-600 text-xs font-bold transition-all">Étudiant</button>
               <button type="button" onClick={() => fillTestCredentials('Prof')} className="px-4 py-2 bg-slate-50 hover:bg-violet-50 hover:text-violet-600 border border-slate-100 rounded-xl text-slate-600 text-xs font-bold transition-all">Professeur</button>
               <button type="button" onClick={() => fillTestCredentials('Admin')} className="px-4 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 rounded-xl text-slate-600 text-xs font-bold transition-all">Admin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
