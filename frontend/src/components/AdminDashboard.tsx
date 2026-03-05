import React, { useState, useEffect } from 'react';
import { Layers, Users, GraduationCap, Search, Filter, X, TrendingUp, Award, BookOpen, ChevronRight, Plus, Loader2, Check } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../api';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

interface ClasseInfo {
  id: number;
  nom: string;
  filiere: string;
}
interface FiliereInfo {
  id: number;
  nom: string;
}
interface AdminStats {
  nb_etudiants: number;
  nb_profs: number;
  nb_classes: number;
  moyenne_generale: number;
  taux_reussite: number;
  repartition_filieres: { filiere: string; count: number }[];
  moyennes_classes: { classe: string; moyenne: number; nb_etudiants: number }[];
}
interface ClasseDetails {
  classe: string;
  filiere: string;
  nb_etudiants: number;
  moyenne: number;
  taux_reussite: number;
  repartition_notes: { tranche: string; count: number }[];
  stats_par_matiere: { matiere: string; moyenne: number; nb_notes: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3">
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-bold text-indigo-700">{p.value}{p.unit || ''}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'classes' | 'professors' | 'filieres'>('classes');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterField, setFilterField] = useState('');
  const [selectedClasse, setSelectedClasse] = useState<ClasseDetails | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [classes, setClasses] = useState<ClasseInfo[]>([]);
  const [filieres, setFilieres] = useState<FiliereInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState<'classe' | 'filiere' | 'etudiant' | null>(null);
  const [formData, setFormData] = useState({ nom: '', prenom: '', nom_classe: '', nom_filiere: '', id_filiere: '', id_classe: '', matricule: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, classesRes, filieresRes] = await Promise.all([
        api.get('/stats/admin'),
        api.get('/etudiants/classes'),
        api.get('/etudiants/filieres'),
      ]);
      setStats(statsRes.data);
      setClasses(classesRes.data);
      setFilieres(filieresRes.data);
    } catch (e) {
      console.error('Erreur chargement données admin', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVoirDetails = async (id: number) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/stats/classe/${id}`);
      setSelectedClasse(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (showAddModal === 'filiere') {
        await api.post('/etudiants/filieres', { nom_filiere: formData.nom_filiere });
      } else if (showAddModal === 'classe') {
        await api.post('/etudiants/classes', { nom_classe: formData.nom_classe, id_filiere: parseInt(formData.id_filiere) });
      } else if (showAddModal === 'etudiant') {
        await api.post('/etudiants/creer', { 
          nom: formData.nom, 
          prenom: formData.prenom, 
          matricule: formData.matricule, 
          id_classe: parseInt(formData.id_classe) 
        });
      }
      setSuccessMsg('Création réussie !');
      setTimeout(() => {
        setShowAddModal(null);
        setSuccessMsg('');
        setFormData({ nom: '', prenom: '', nom_classe: '', nom_filiere: '', id_filiere: '', id_classe: '', matricule: '' });
        fetchData();
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.msg || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClasses = (stats?.moyennes_classes || []).filter(c => {
    const matchSearch = c.classe.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterField ? c.classe.toLowerCase().includes(filterField.toLowerCase()) : true;
    return matchSearch && matchFilter;
  });

  const filteredDisplayClasses = classes.filter(c =>
    c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.filiere.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Administration Overview</h1>
          <p className="text-slate-500 mt-1">Gérez toutes les entités académiques depuis un seul espace.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Rechercher...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`p-2 border rounded-lg transition-colors shadow-sm ${filterOpen ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-11 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-20">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filtres</p>
                  <button onClick={() => { setFilterField(''); setFilterOpen(false); }}>
                    <X className="w-4 h-4 text-slate-400 hover:text-red-500 transition-colors" />
                  </button>
                </div>
                <label className="block text-xs text-slate-500 mb-1">Nom de la classe / filière</label>
                <input
                  type="text"
                  value={filterField}
                  onChange={e => setFilterField(e.target.value)}
                  placeholder="ex: Info, Master..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => setFilterOpen(false)}
                  className="mt-3 w-full py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Appliquer
                </button>
              </div>
            )}
          </div>
          <button 
             onClick={() => setShowAddModal('etudiant')}
             className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 shadow-sm transition-all shadow-indigo-200"
          >
            <Users className="w-4 h-4" /> + Étudiant
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Étudiants', value: stats.nb_etudiants, icon: Users, color: 'from-indigo-500 to-violet-500' },
            { label: 'Professeurs', value: stats.nb_profs, icon: GraduationCap, color: 'from-violet-500 to-purple-500' },
            { label: 'Classes', value: stats.nb_classes, icon: Layers, color: 'from-blue-500 to-indigo-500' },
            { label: 'Taux Réussite', value: `${stats.taux_reussite}%`, icon: Award, color: 'from-emerald-500 to-teal-500' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center mb-3 shadow-md`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{kpi.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm font-sans">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Moyenne par classe
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={filteredClasses.length > 0 ? filteredClasses : stats.moyennes_classes} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="classe" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="moyenne" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-5 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Répartition par filière
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.repartition_filieres}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="filiere"
                >
                  {stats.repartition_filieres.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [`${val} étudiants`, name]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50">
          <button onClick={() => setActiveTab('classes')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'classes' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <Layers className="w-4 h-4" /> Classes
          </button>
          <button onClick={() => setActiveTab('filieres')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'filieres' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <BookOpen className="w-4 h-4" /> Filières
          </button>
          <button onClick={() => setActiveTab('professors')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'professors' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <GraduationCap className="w-4 h-4" /> Professeurs
          </button>
        </div>
        
        {activeTab === 'classes' && (
          <button onClick={() => setShowAddModal('classe')} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
            <Plus className="w-5 h-5" />
          </button>
        )}
        {activeTab === 'filieres' && (
          <button onClick={() => setShowAddModal('filiere')} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Table Content */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {activeTab === 'classes' && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Classe</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Filière</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Étudiants</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDisplayClasses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-5 px-6 font-medium text-slate-900">{c.nom}</td>
                  <td className="py-5 px-6 text-slate-600">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm border border-indigo-100 font-medium">{c.filiere}</span>
                  </td>
                  <td className="py-5 px-6 text-slate-600">
                    <div className="flex items-center gap-2 bg-slate-100 w-fit px-3 py-1 rounded-full text-sm border border-slate-200">
                      <Users className="w-4 h-4 text-slate-400" /> <span className="font-medium">{stats?.moyennes_classes.find(mc => mc.classe === c.nom)?.nb_etudiants ?? 0}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <button
                      onClick={() => handleVoirDetails(c.id)}
                      disabled={loadingDetail}
                      className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                    >
                      {loadingDetail ? '...' : <>Voir Détails <ChevronRight className="w-3.5 h-3.5" /></>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'filieres' && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">ID</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Nom de la Filière</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filieres.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-5 px-6 font-mono text-slate-400 text-sm">#{f.id}</td>
                  <td className="py-5 px-6 font-medium text-slate-900">{f.nom}</td>
                  <td className="py-5 px-6 text-right">
                    <button className="text-slate-400 hover:text-slate-600 text-sm font-medium">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'professors' && (
          <div className="p-12 text-center text-slate-400">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">Gestion des professeurs bientôt disponible.</p>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {showAddModal === 'filiere' ? 'Nouvelle Filière' : showAddModal === 'classe' ? 'Nouvelle Classe' : 'Nouvel Étudiant'}
              </h3>
              <button onClick={() => setShowAddModal(null)} className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {successMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" /> {successMsg}
                </div>
              )}

              {showAddModal === 'filiere' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom de la filière</label>
                  <input required value={formData.nom_filiere} onChange={e => setFormData({...formData, nom_filiere: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ex: Génie Logiciel" />
                </div>
              )}

              {showAddModal === 'classe' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom de la classe</label>
                    <input required value={formData.nom_classe} onChange={e => setFormData({...formData, nom_classe: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ex: GL 1-A" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Filière associée</label>
                    <select required value={formData.id_filiere} onChange={e => setFormData({...formData, id_filiere: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                      <option value="">Sélectionner une filière</option>
                      {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                    </select>
                  </div>
                </>
              )}

              {showAddModal === 'etudiant' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom</label>
                      <input required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Nom" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Prénom</label>
                      <input required value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Prénom" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Matricule</label>
                    <input required value={formData.matricule} onChange={e => setFormData({...formData, matricule: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ex: E001" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Classe</label>
                    <select required value={formData.id_classe} onChange={e => setFormData({...formData, id_classe: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                      <option value="">Sélectionner une classe</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.nom} ({c.filiere})</option>)}
                    </select>
                  </div>
                </>
              )}

              <button disabled={submitting} type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmer la création'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal - Already there, keeping structure */}
      {selectedClasse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedClasse(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedClasse.classe}</h3>
                <p className="text-sm text-indigo-600 font-medium mt-0.5 uppercase tracking-wider">{selectedClasse.filiere}</p>
              </div>
              <button onClick={() => setSelectedClasse(null)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Étudiants', value: selectedClasse.nb_etudiants },
                  { label: 'Moyenne', value: `${selectedClasse.moyenne}/20` },
                  { label: 'Taux Réussite', value: `${selectedClasse.taux_reussite}%` },
                ].map((kpi, i) => (
                  <div key={i} className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 text-center">
                    <p className="text-2xl font-bold text-indigo-700">{kpi.value}</p>
                    <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-tight">{kpi.label}</p>
                  </div>
                ))}
              </div>
              {selectedClasse.repartition_notes.some(r => r.count > 0) && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Répartition des Notes</h4>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={selectedClasse.repartition_notes} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="tranche" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {selectedClasse.stats_par_matiere.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Performances par Matière</h4>
                  <div className="space-y-4">
                    {selectedClasse.stats_par_matiere.map((m, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between items-end">
                          <p className="text-sm text-slate-700 font-bold">{m.matiere}</p>
                          <span className="text-sm font-bold text-indigo-700">{m.moyenne}/20</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000" style={{ width: `${(m.moyenne / 20) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
