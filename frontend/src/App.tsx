import { useState } from 'react';
import { LogOut } from 'lucide-react';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import ProfessorDashboard from './components/ProfessorDashboard';
import AdminDashboard from './components/AdminDashboard';

export type Role = 'student' | 'professor' | 'admin' | null;

export default function App() {
  const [role, setRole] = useState<Role>(null);

  if (!role) {
    return <Login onLogin={setRole} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 grid grid-cols-2 gap-0.5 p-1 rounded-md shadow-sm shadow-indigo-200">
             <div className="bg-white/80 rounded-sm"></div>
             <div className="bg-white/40 rounded-sm"></div>
             <div className="bg-white/60 rounded-sm"></div>
             <div className="bg-white/90 rounded-sm"></div>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">EduDash</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span className="text-sm font-semibold text-slate-600 capitalize bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {role} Portal
            </span>
          </div>
          <button 
            onClick={() => setRole(null)} 
            className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {role === 'student' && <StudentDashboard />}
        {role === 'professor' && <ProfessorDashboard />}
        {role === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}
