import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, TrendingUp, Award, BookOpen } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell
} from 'recharts';
import api from '../api';

interface Note {
  matiere: string;
  coef: number;
  note: number;
  date: string;
}
interface StudentStats {
  nom: string;
  prenom: string;
  matricule: string;
  classe: string;
  notes: Note[];
  moyenne_generale: number;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e0e7ff'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="text-sm font-bold text-indigo-700">{payload[0].value}/20</p>
      </div>
    );
  }
  return null;
};

export default function StudentDashboard() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stats/etudiant')
      .then(res => setStats(res.data))
      .catch(e => {
        console.error(e);
        setError('Impossible de charger vos données.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadBulletin = async () => {
    try {
      setIsDownloading(true);
      const response = await api.get('/notes/bulletin', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Mon_Bulletin.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Impossible de générer le bulletin.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-sm">{error || 'Aucune donnée disponible.'}</p>
      </div>
    );
  }

  const radarData = stats.notes.map(n => ({ matiere: n.matiere, note: n.note, fullMark: 20 }));
  const barData = stats.notes.map(n => ({ matiere: n.matiere, note: n.note }));

  const mention = stats.moyenne_generale >= 16 ? 'Très Bien' :
    stats.moyenne_generale >= 14 ? 'Bien' :
    stats.moyenne_generale >= 12 ? 'Assez Bien' :
    stats.moyenne_generale >= 10 ? 'Passable' : 'Insuffisant';

  const mentionColor = stats.moyenne_generale >= 14 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
    stats.moyenne_generale >= 10 ? 'text-indigo-600 bg-indigo-50 border-indigo-100' :
    'text-red-500 bg-red-50 border-red-200';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Bonjour, {stats.prenom} {stats.nom}
          </h1>
          <p className="text-slate-500 mt-1">Voici votre tableau de bord académique.</p>
        </div>
        <button
          onClick={handleDownloadBulletin}
          disabled={isDownloading}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isDownloading ? 'Génération...' : 'Télécharger le Bulletin'}
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Matricule', value: stats.matricule, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
          { label: 'Classe', value: stats.classe, icon: Award, color: 'bg-violet-50 text-violet-600' },
          { label: 'Matières', value: `${stats.notes.length}`, icon: FileText, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Moyenne Générale', value: `${stats.moyenne_generale}/20`, icon: TrendingUp, color: stats.moyenne_generale >= 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <p className="text-xl font-bold text-slate-900 truncate">{kpi.value}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Mention */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${mentionColor}`}>
        <Award className="w-4 h-4" /> Mention : {mention}
      </div>

      {stats.notes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune note disponible pour l'instant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Profil de Compétences
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="matiere" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <PolarRadiusAxis domain={[0, 20]} tick={{ fontSize: 10, fill: '#cbd5e1' }} axisLine={false} />
                <Radar name="Note" dataKey="note" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} />
                <Tooltip formatter={(val) => [`${val}/20`, 'Note']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-5 flex items-center gap-2">
              <Award className="w-4 h-4" /> Notes par Matière
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="matiere" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-25} textAnchor="end" />
                <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="note" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.note >= 10 ? COLORS[i % COLORS.length] : '#fca5a5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grade Table */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4" /> Mes Notes
              </h2>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 pt-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Matière</th>
                  <th className="pb-3 pt-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Coef.</th>
                  <th className="pb-3 pt-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Date</th>
                  <th className="pb-3 pt-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.notes.map((n, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6 font-medium text-slate-900">{n.matiere}</td>
                    <td className="py-4 px-6 text-slate-500 text-sm">{n.coef}</td>
                    <td className="py-4 px-6 text-slate-400 text-sm font-mono">{n.date}</td>
                    <td className="py-4 px-6 text-right">
                      <span className={`font-mono font-semibold px-3 py-1 rounded-md border text-sm ${n.note >= 10 ? 'text-indigo-600 bg-indigo-50 border-indigo-100 group-hover:bg-indigo-100' : 'text-red-500 bg-red-50 border-red-100'} transition-colors`}>
                        {n.note.toFixed(1)} <span className="text-xs font-normal opacity-60">/ 20</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
