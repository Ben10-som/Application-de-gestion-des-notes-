import { useState, useEffect } from 'react';
import { Save, CheckCircle2, Search, Filter, X, BarChart2, ChevronDown, BookOpen, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import api from '../api';

interface Enseignement {
  id_enseignement: number;
  id_classe: number;
  nom_classe: string;
  id_matiere: number;
  nom_matiere: string;
  coef: number;
}

interface EtudiantNote {
  id_etudiant: number;
  nom: string;
  prenom: string;
  matricule: string;
  note: number | null;
  id_enseignement: number;
}

interface ClasseStats {
  classe: string;
  moyenne: number;
  taux_reussite: number;
  repartition_notes: { tranche: string; count: number }[];
}

const BAR_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="text-sm font-bold text-indigo-700">{payload[0].value} étudiant(s)</p>
      </div>
    );
  }
  return null;
};

export default function ProfessorDashboard() {
  const [enseignements, setEnseignements] = useState<Enseignement[]>([]);
  const [selectedEns, setSelectedEns] = useState<Enseignement | null>(null);
  const [etudiants, setEtudiants] = useState<EtudiantNote[]>([]);
  const [grades, setGrades] = useState<Record<number, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'missing' | 'graded'>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [classStats, setClassStats] = useState<ClasseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Group enseignements by class for sidebar display
  const classeMap = enseignements.reduce<Record<number, { nom: string; matieres: Enseignement[] }>>((acc, ens) => {
    if (!acc[ens.id_classe]) acc[ens.id_classe] = { nom: ens.nom_classe, matieres: [] };
    acc[ens.id_classe].matieres.push(ens);
    return acc;
  }, {});

  useEffect(() => {
    api.get('/notes/mes-enseignements')
      .then(res => {
        setEnseignements(res.data);
        if (res.data.length > 0) {
          setSelectedEns(res.data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEns) return;
    setLoadingStudents(true);
    setEtudiants([]);
    setGrades({});
    setClassStats(null);

    // Use the specific endpoint: class + subject -> students with their notes
    api.get(`/notes/classe/${selectedEns.id_classe}/matiere/${selectedEns.id_matiere}`)
      .then(res => {
        setEtudiants(res.data);
        // Pre-fill grades from existing data
        const existingGrades: Record<number, string> = {};
        res.data.forEach((e: EtudiantNote) => {
          if (e.note !== null) existingGrades[e.id_etudiant] = String(e.note);
        });
        setGrades(existingGrades);
      })
      .catch(console.error)
      .finally(() => setLoadingStudents(false));

    api.get(`/stats/classe/${selectedEns.id_classe}`)
      .then(res => setClassStats(res.data))
      .catch(console.error);
  }, [selectedEns]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(grades)
        .filter(([, note]) => note !== '')
        .map(([id_etudiant, note]: [string, string]) => {
          const etudiant = etudiants.find(e => e.id_etudiant === Number(id_etudiant));
          return api.post('/notes/saisir', {
            id_etudiant: Number(id_etudiant),
            id_enseignement: etudiant?.id_enseignement ?? selectedEns?.id_enseignement,
            valeur_note: parseFloat(note)
          });
        });

      await Promise.all(promises);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      console.error(e);
      alert('Erreur lors de la sauvegarde des notes.');
    } finally {
      setSaving(false);
    }
  };

  const filteredEtudiants = etudiants.filter(e => {
    const matchSearch = `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(searchQuery.toLowerCase());
    const currentNote = grades[e.id_etudiant];
    const isMissing = currentNote === undefined || currentNote === '';
    if (filterStatus === 'missing') return matchSearch && isMissing;
    if (filterStatus === 'graded') return matchSearch && !isMissing;
    return matchSearch;
  });

  const nbSaisies = etudiants.filter(e => grades[e.id_etudiant] !== undefined && grades[e.id_etudiant] !== '').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Chargement des cours...</p>
      </div>
    );
  }

  if (enseignements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <BookOpen className="w-12 h-12 text-slate-200" />
        <p className="text-slate-400 font-medium">Aucun enseignement assigné.</p>
        <p className="text-sm text-slate-400">L'administrateur doit vous assigner des classes et matières.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Portail Professeur</h1>
        <p className="text-slate-500 mt-1">Sélectionnez une matière et saisissez les notes pour chaque étudiant.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Sidebar: Class + Subject picker */}
        <div className="lg:col-span-1 space-y-4">
          {Object.entries(classeMap).map(([idClasse, classeData]: [string, any]) => (
            <div key={idClasse}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">{classeData.nom}</p>
              <div className="space-y-2">
                {classeData.matieres.map((ens: any) => (
                  <button
                    key={ens.id_enseignement}
                    onClick={() => setSelectedEns(ens)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${selectedEns?.id_enseignement === ens.id_enseignement
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02]'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                  >
                    <p className={`font-bold text-sm ${selectedEns?.id_enseignement === ens.id_enseignement ? 'text-white' : 'text-slate-900'}`}>
                      {ens.nom_matiere}
                    </p>
                    <p className={`text-xs mt-1 flex items-center gap-1 ${selectedEns?.id_enseignement === ens.id_enseignement ? 'text-indigo-200' : 'text-slate-400'}`}>
                      Coef. {ens.coef}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">

          {/* Stats Row */}
          {selectedEns && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Étudiants', value: etudiants.length },
                { label: 'Notes saisies', value: `${nbSaisies}/${etudiants.length}` },
                { label: 'Moy. classe', value: classStats ? `${classStats.moyenne}/20` : '—' },
              ].map((k, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xl font-bold text-indigo-700">{k.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{k.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Chart Toggle */}
          {classStats && classStats.repartition_notes.some(r => r.count > 0) && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setShowChart(!showChart)}
                className="w-full flex items-center justify-between p-5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-2"><BarChart2 className="w-4 h-4 text-indigo-500" /> Analyse des notes — {selectedEns?.nom_classe}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showChart ? 'rotate-180' : ''}`} />
              </button>
              {showChart && (
                <div className="px-5 pb-5">
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={classStats.repartition_notes} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="tranche" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {classStats.repartition_notes.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Grading Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedEns?.nom_matiere}</h2>
                <p className="text-sm text-indigo-600 font-medium">{selectedEns?.nom_classe} · Coefficient {selectedEns?.coef}</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <div className="relative flex-1 sm:w-52">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className={`p-2 border rounded-lg transition-colors ${filterOpen || filterStatus !== 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                  {filterOpen && (
                    <div className="absolute right-0 top-11 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-20">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filtrer</p>
                        <button onClick={() => setFilterOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
                      </div>
                      {(['all', 'missing', 'graded'] as const).map(s => (
                        <button key={s} onClick={() => { setFilterStatus(s); setFilterOpen(false); }}
                          className={`w-full text-left text-sm px-3 py-2 rounded-lg mb-1 transition-colors ${filterStatus === s ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-600'}`}>
                          {s === 'all' ? '✦ Tous les étudiants' : s === 'missing' ? '⚠ Notes manquantes' : '✓ Notes saisies'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || nbSaisies === 0}
                  className={`px-5 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-sm whitespace-nowrap ${saved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40'}`}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Sauvegardé !' : saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>

            {loadingStudents ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Chargement des étudiants...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-white">
                    <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Matricule</th>
                    <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Étudiant</th>
                    <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Note / 20</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEtudiants.map(s => {
                    const currentGrade = grades[s.id_etudiant] ?? '';
                    const isMissing = currentGrade === '';
                    return (
                      <tr key={s.id_etudiant} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 text-sm text-slate-500 font-mono">{s.matricule}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center font-bold text-indigo-700 text-xs border border-indigo-200/50">
                              {s.nom.charAt(0).toUpperCase()}{s.prenom.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{s.nom} {s.prenom}</p>
                              {isMissing && <span className="text-xs text-amber-500 font-medium">Note manquante</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.25"
                            value={currentGrade}
                            onChange={e => setGrades(prev => ({ ...prev, [s.id_etudiant]: e.target.value }))}
                            placeholder="—"
                            className={`w-24 px-3 py-2 text-right border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-900 bg-white shadow-sm transition-colors ${isMissing ? 'border-slate-200' : 'border-emerald-300 text-emerald-700'}`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEtudiants.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-14 text-center text-slate-400">
                        <p className="font-medium">Aucun étudiant trouvé</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* Footer with progress */}
            {etudiants.length > 0 && (
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <p className="text-xs text-slate-500">{nbSaisies} / {etudiants.length} notes saisies</p>
                <div className="w-40 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500" style={{ width: `${etudiants.length > 0 ? (nbSaisies / etudiants.length) * 100 : 0}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
