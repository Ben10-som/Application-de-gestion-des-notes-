import React, { useState, useEffect } from 'react';
import { Layers, Users, GraduationCap, Search, Filter, X, TrendingUp, Award, BookOpen, ChevronRight, Plus, Loader2, Check, Trash2, Edit } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../api';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

interface EtudiantInfo {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  username: string;
  classe: string;
  filiere: string;
}
interface ClasseInfo {
  id: number;
  nom: string;
  filiere: string;
  filiere_id: number;
}
interface FiliereInfo {
  id: number;
  nom: string;
}
interface MatiereInfo {
  id: number;
  nom: string;
  coef: number;
}
interface ProfesseurInfo {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  specialite: string;
  enseignements: { classe: string; matiere: string }[];
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
  const [activeTab, setActiveTab] = useState<'classes' | 'professors' | 'filieres' | 'etudiants' | 'matieres'>('classes');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterField, setFilterField] = useState('');
  const [selectedClasse, setSelectedClasse] = useState<ClasseDetails | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [classes, setClasses] = useState<ClasseInfo[]>([]);
  const [filieres, setFilieres] = useState<FiliereInfo[]>([]);
  const [matieres, setMatieres] = useState<MatiereInfo[]>([]);
  const [professeurs, setProfesseurs] = useState<ProfesseurInfo[]>([]);
  const [etudiantsList, setEtudiantsList] = useState<EtudiantInfo[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState<'classe' | 'filiere' | 'etudiant' | 'professeur' | 'matiere' | null>(null);
  const [showEditModal, setShowEditModal] = useState<'classe' | 'filiere' | null>(null);
  const [itemToEdit, setItemToEdit] = useState<any>(null); // Stores the object being edited
  
  const [formData, setFormData] = useState({ 
    nom: '', prenom: '', nom_classe: '', nom_filiere: '', nom_matiere: '', coef: '1', 
    id_filiere: '', id_classe: '', matricule: '', password: '', username: '', specialite: '' 
  });
  const [selectedEnseignements, setSelectedEnseignements] = useState<{id_classe: string, id_matiere: string}[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, classesRes, filieresRes, profsRes, matRes, etuRes] = await Promise.allSettled([
        api.get('/stats/admin'),
        api.get('/etudiants/classes'),
        api.get('/etudiants/filieres'),
        api.get('/etudiants/professeurs'),
        api.get('/etudiants/matieres'),
        api.get('/etudiants/all'),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (classesRes.status === 'fulfilled') setClasses(classesRes.value.data);
      if (filieresRes.status === 'fulfilled') setFilieres(filieresRes.value.data);
      if (profsRes.status === 'fulfilled') setProfesseurs(profsRes.value.data);
      if (matRes.status === 'fulfilled') setMatieres(matRes.value.data);
      if (etuRes.status === 'fulfilled') setEtudiantsList(etuRes.value.data);

      // Log errors for debugging
      [statsRes, classesRes, filieresRes, profsRes, matRes, etuRes].forEach((r, i) => {
        if (r.status === 'rejected') console.error(`Requête ${i} échouée:`, r.reason);
      });
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
      const [resClasse, resEtu] = await Promise.all([
        api.get(`/stats/classe/${id}`),
        api.get(`/etudiants/classe/${id}`)
      ]);
      setSelectedClasse(resClasse.data);
      setEtudiantsList(resEtu.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      if (showAddModal === 'filiere') {
        await api.post('/etudiants/filieres', { nom_filiere: formData.nom_filiere });
      } else if (showAddModal === 'matiere') {
        await api.post('/etudiants/matieres', { nom_matiere: formData.nom_matiere, coef: parseInt(formData.coef) });
      } else if (showAddModal === 'classe') {
        await api.post('/etudiants/classes', { nom_classe: formData.nom_classe, id_filiere: parseInt(formData.id_filiere) });
      } else if (showAddModal === 'professeur') {
        if (!/^[a-zA-Z\s\-]+$/.test(formData.nom) || !/^[a-zA-Z\s\-]+$/.test(formData.prenom)) {
            setErrorMsg("Nom et prénom doivent uniquement contenir des lettres");
            setSubmitting(false);
            return;
        }
        await api.post('/etudiants/professeurs', {
            username: formData.username,
            nom: formData.nom,
            prenom: formData.prenom,
            specialite: formData.specialite,
            password: formData.password,
            enseignements: selectedEnseignements.map(es => ({ id_classe: parseInt(es.id_classe), id_matiere: parseInt(es.id_matiere) }))
        });
      } else if (showAddModal === 'etudiant') {
        if (!/^[a-zA-Z]{2}\d{3}$/.test(formData.matricule)) {
            setErrorMsg("Format matricule invalide: 2 lettres suivies de 3 chiffres (ex: AB123)");
            setSubmitting(false);
            return;
        }
        await api.post('/etudiants/creer', { 
          username: formData.username,
          nom: formData.nom, 
          prenom: formData.prenom, 
          matricule: formData.matricule.toUpperCase(), 
          id_classe: parseInt(formData.id_classe),
          password: formData.password
        });
      }
      setSuccessMsg('Création réussie !');
      // Rafraîchir immédiatement les données
      await fetchData();
      setSearchQuery('');
      
      setTimeout(() => {
        resetModals();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.msg || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      if (showEditModal === 'filiere') {
        await api.put(`/etudiants/filieres/${itemToEdit.id}`, { nom_filiere: formData.nom_filiere });
      } else if (showEditModal === 'classe') {
        await api.put(`/etudiants/classes/${itemToEdit.id}`, { nom_classe: formData.nom_classe, id_filiere: parseInt(formData.id_filiere) });
      }
      setSuccessMsg('Modification réussie !');
      setTimeout(() => {
        setShowEditModal(null);
        setItemToEdit(null);
        setSuccessMsg('');
        setFormData({ nom: '', prenom: '', nom_classe: '', nom_filiere: '', id_filiere: '', id_classe: '', matricule: '', password: '', username: '', specialite: '' });
        fetchData();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.msg || 'Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet élément ?")) return;
    try {
        if (type === 'filiere') await api.delete(`/etudiants/filieres/${id}`);
        else if (type === 'classe') await api.delete(`/etudiants/classes/${id}`);
        else if (type === 'professeur') await api.delete(`/etudiants/professeurs/${id}`);
        else if (type === 'etudiant') await api.delete(`/etudiants/etudiants/${id}`);
        else if (type === 'matiere') await api.delete(`/etudiants/matieres/${id}`);
        
        fetchData();
        if (type === 'etudiant' && selectedClasse) {
            handleVoirDetails(classes.find(c => c.nom === selectedClasse.classe)?.id || 0);
        }
    } catch (err: any) {
        alert(err.response?.data?.msg || 'Erreur lors de la suppression');
    }
  };

  const openEditModal = (type: 'filiere' | 'classe', item: any) => {
    setItemToEdit(item);
    setShowEditModal(type);
    if (type === 'filiere') setFormData({ ...formData, nom_filiere: item.nom });
    if (type === 'classe') setFormData({ ...formData, nom_classe: item.nom, id_filiere: item.filiere_id?.toString() || '' });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const resetModals = () => {
    setShowAddModal(null);
    setShowEditModal(null);
    setItemToEdit(null);
    setFormData({ nom: '', prenom: '', nom_classe: '', nom_filiere: '', id_filiere: '', id_classe: '', matricule: '', password: '', username: '', specialite: '' });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setFilterField('');
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

  const filteredProfesseurs = professeurs.filter(p => 
    p.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.specialite.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="flex flex-wrap items-center gap-3">
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
          <button 
             onClick={() => setShowAddModal('professeur')}
             className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-violet-700 shadow-sm transition-all shadow-violet-200"
          >
            <GraduationCap className="w-4 h-4" /> + Professeur
          </button>
          <button 
             onClick={() => setShowAddModal('matiere')}
             className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-emerald-700 shadow-sm transition-all shadow-emerald-200"
          >
            <BookOpen className="w-4 h-4" /> + Matière
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
        <div className="flex space-x-2 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50 overflow-x-auto">
          <button onClick={() => handleTabChange('classes')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'classes' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <Layers className="w-4 h-4" /> Classes
          </button>
          <button onClick={() => handleTabChange('filieres')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'filieres' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <BookOpen className="w-4 h-4" /> Filières
          </button>
          <button onClick={() => handleTabChange('matieres')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'matieres' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <Award className="w-4 h-4" /> Matières
          </button>
          <button onClick={() => handleTabChange('professors')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'professors' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <GraduationCap className="w-4 h-4" /> Professeurs
          </button>
          <button onClick={() => handleTabChange('etudiants')} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'etudiants' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <Users className="w-4 h-4" /> Étudiants
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {activeTab === 'classes' && (
            <button onClick={() => setShowAddModal('classe')} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm">
              <Plus className="w-5 h-5" />
            </button>
          )}
          {activeTab === 'filieres' && (
            <button onClick={() => setShowAddModal('filiere')} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm">
              <Plus className="w-5 h-5" />
            </button>
          )}
          {activeTab === 'matieres' && (
            <button onClick={() => setShowAddModal('matiere')} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm">
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
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
                    <div className="flex justify-end gap-2 items-center">
                        <button
                          onClick={() => handleVoirDetails(c.id)}
                          disabled={loadingDetail}
                          className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                        >
                          {loadingDetail ? '...' : <>Détails</>}
                        </button>
                        <button onClick={() => openEditModal('classe', c)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete('classe', c.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDisplayClasses.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">Aucune classe trouvée.</td>
                </tr>
              )}
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
              {filieres.filter(f => f.nom.toLowerCase().includes(searchQuery.toLowerCase())).map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-5 px-6 font-mono text-slate-400 text-sm">#{f.id}</td>
                  <td className="py-5 px-6 font-medium text-slate-900">{f.nom}</td>
                  <td className="py-5 px-6 text-right flex justify-end gap-2">
                    <button onClick={() => openEditModal('filiere', f)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete('filiere', f.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filieres.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400 font-medium">Aucune filière trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'matieres' && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Matière</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Coefficient</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {matieres.filter(m => m.nom.toLowerCase().includes(searchQuery.toLowerCase())).map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-5 px-6 font-medium text-slate-900">{m.nom}</td>
                  <td className="py-5 px-6 text-slate-600 font-mono">{m.coef}</td>
                  <td className="py-5 px-6 text-right flex justify-end gap-2">
                    <button onClick={() => handleDelete('matiere', m.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {matieres.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400 font-medium">Aucune matière trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'professors' && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Professeur</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Identifiant</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Enseignements</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProfesseurs.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-5 px-6">
                    <div className="font-medium text-slate-900">{p.nom} {p.prenom}</div>
                    <div className="text-xs text-slate-400">{p.specialite}</div>
                  </td>
                  <td className="py-5 px-6 font-mono text-xs text-slate-500">{p.username}</td>
                  <td className="py-5 px-6">
                    <div className="flex flex-wrap gap-1">
                      {p.enseignements?.map((e, idx) => (
                        <span key={idx} className="bg-violet-50 text-violet-700 px-2 py-0.5 rounded text-[10px] border border-violet-100 whitespace-nowrap">
                          {e.matiere} ({e.classe})
                        </span>
                      ))}
                      {(!p.enseignements || p.enseignements.length === 0) && <span className="text-slate-300 text-xs">Aucun</span>}
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right flex justify-end gap-2">
                    <button onClick={() => handleDelete('professeur', p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProfesseurs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">Aucun professeur trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'etudiants' && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Matricule</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Nom complet</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Username</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Classe</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Filière</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {etudiantsList.filter(e =>
                e.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (e.classe || '').toLowerCase().includes(searchQuery.toLowerCase())
              ).map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-5 px-6 font-mono text-sm text-slate-500">{e.matricule}</td>
                  <td className="py-5 px-6 font-medium text-slate-900">{e.nom} {e.prenom}</td>
                  <td className="py-5 px-6 font-mono text-xs text-slate-400">{e.username}</td>
                  <td className="py-5 px-6 text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm border border-slate-200 font-medium">{e.classe || '—'}</span>
                  </td>
                  <td className="py-5 px-6 text-slate-600">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm border border-indigo-100 font-medium">{e.filiere || '—'}</span>
                  </td>
                </tr>
              ))}
              {etudiantsList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">Aucun étudiant trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Creation and Edit Modals */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={resetModals}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {showAddModal === 'filiere' || showEditModal === 'filiere' ? (showAddModal ? '+ Nouvelle Filière' : 'Modifier Filière') : 
                 showAddModal === 'matiere' ? '+ Nouvelle Matière' :
                 showAddModal === 'classe' || showEditModal === 'classe' ? (showAddModal ? '+ Nouvelle Classe' : 'Modifier Classe') : 
                 showAddModal === 'professeur' ? '+ Nouveau Professeur' : 
                 '+ Nouvel Étudiant'}
              </h3>
              <button onClick={resetModals} className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <form onSubmit={showEditModal ? handleEdit : handleCreate} className="p-6 space-y-4">
              {successMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium flex gap-2">
                  <X className="w-4 h-4 mt-0.5 shrink-0" /> {errorMsg}
                </div>
              )}

              {(showAddModal === 'filiere' || showEditModal === 'filiere') && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom de la filière</label>
                  <input required value={formData.nom_filiere} onChange={e => setFormData({...formData, nom_filiere: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ex: Génie Logiciel" />
                </div>
              )}

              {(showAddModal === 'classe' || showEditModal === 'classe') && (
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
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Identifiant (Login)</label>
                    <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Login unique" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Matricule</label>
                      <input required value={formData.matricule} onChange={e => setFormData({...formData, matricule: e.target.value.toUpperCase()})} maxLength={5} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none uppercase" placeholder="AB123" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mot de passe</label>
                      <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Mot de passe" />
                    </div>
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

              {showAddModal === 'matiere' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom de la matière</label>
                    <input required value={formData.nom_matiere} onChange={e => setFormData({...formData, nom_matiere: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="ex: Algorithmique" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Coefficient</label>
                    <input required type="number" min="1" max="10" value={formData.coef} onChange={e => setFormData({...formData, coef: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </>
              )}

              {showAddModal === 'professeur' && (
                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom</label>
                      <input required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none border-violet-100" placeholder="Nom" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Prénom</label>
                      <input required value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none border-violet-100" placeholder="Prénom" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Spécialité</label>
                    <input required value={formData.specialite} onChange={e => setFormData({...formData, specialite: e.target.value})} className="w-full px-4 py-2.5 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" placeholder="ex: Mathématiques" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Identifiant (Login)</label>
                      <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" placeholder="Login unique" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mot de passe</label>
                      <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2.5 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" placeholder="Mot de passe" />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center justify-between">
                      Affectation des cours
                      <button type="button" onClick={() => setSelectedEnseignements([...selectedEnseignements, {id_classe: '', id_matiere: ''}])} className="text-violet-600 hover:text-violet-800 text-[10px] font-bold">+ Ajouter un cours</button>
                    </p>
                    <div className="space-y-3">
                      {selectedEnseignements.map((ens, idx) => (
                        <div key={idx} className="flex gap-2 items-end bg-slate-50 p-3 rounded-xl border border-slate-200 relative">
                          <button type="button" onClick={() => setSelectedEnseignements(selectedEnseignements.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-red-500 shadow-sm"><X className="w-3 h-3" /></button>
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Classe</label>
                            <select required value={ens.id_classe} onChange={e => {
                                const newEns = [...selectedEnseignements];
                                newEns[idx].id_classe = e.target.value;
                                setSelectedEnseignements(newEns);
                            }} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none bg-white">
                              <option value="">Classe</option>
                              {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Matière</label>
                            <select required value={ens.id_matiere} onChange={e => {
                                const newEns = [...selectedEnseignements];
                                newEns[idx].id_matiere = e.target.value;
                                setSelectedEnseignements(newEns);
                            }} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none bg-white">
                              <option value="">Matière</option>
                              {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}
                      {selectedEnseignements.length === 0 && <p className="text-center text-xs text-slate-400 italic py-2">Aucun cours affecté pour le moment.</p>}
                    </div>
                  </div>
                </div>
              )}

              <button disabled={submitting} type="submit" className={`w-full py-3 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 ${showAddModal === 'professeur' ? 'bg-violet-600 hover:bg-violet-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (showEditModal ? 'Confirmer la modification' : 'Confirmer la création')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedClasse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => {setSelectedClasse(null); setEtudiantsList([]);}}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-white shrink-0 shadow-sm relative z-20">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{selectedClasse.classe}</h3>
                <p className="text-sm text-indigo-600 font-bold mt-1 uppercase tracking-wider bg-indigo-50 inline-block px-3 py-1 rounded-full">{selectedClasse.filiere}</p>
              </div>
              <button onClick={() => {setSelectedClasse(null); setEtudiantsList([]);}} className="p-2 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Étudiants', value: selectedClasse.nb_etudiants, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-100' },
                  { label: 'Moyenne Globale', value: `${selectedClasse.moyenne}/20`, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
                  { label: 'Taux Réussite', value: `${selectedClasse.taux_reussite}%`, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
                ].map((kpi, i) => (
                  <div key={i} className={`rounded-2xl p-6 border text-center shadow-sm ${kpi.bg}`}>
                    <p className={`text-4xl font-black tracking-tight ${kpi.color}`}>{kpi.value}</p>
                    <p className="text-sm mt-2 font-bold uppercase tracking-widest text-slate-500 opacity-80">{kpi.label}</p>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {selectedClasse.repartition_notes.some(r => r.count > 0) && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-indigo-500" /> Répartition des Notes
                        </h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={selectedClasse.repartition_notes} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="tranche" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    )}
                    {selectedClasse.stats_par_matiere.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" /> Performances par Matière
                        </h4>
                        <div className="space-y-5">
                            {selectedClasse.stats_par_matiere.map((m, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end">
                                <p className="text-sm text-slate-800 font-bold">{m.matiere}</p>
                                <span className={`text-sm font-black ${m.moyenne >= 10 ? 'text-emerald-600' : 'text-rose-500'}`}>{m.moyenne}/20</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner flex">
                                <div className={`h-full rounded-full transition-all duration-1000 ${m.moyenne >= 10 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-rose-400 to-rose-500'}`} style={{ width: `${(m.moyenne / 20) * 100}%` }} />
                                </div>
                            </div>
                            ))}
                        </div>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[600px]">
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-2"><Users className="w-5 h-5 text-indigo-500" /> Liste des Étudiants</div>
                    </h4>
                    <div className="overflow-y-auto pr-2 -mr-2 space-y-3">
                        {etudiantsList.map(etu => (
                            <div key={etu.id} className="p-4 border border-slate-100 rounded-xl hover:border-indigo-100 hover:shadow-sm transition-all bg-slate-50/50 flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                                    {etu.prenom.charAt(0)}{etu.nom.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 truncate">{etu.prenom} {etu.nom}</p>
                                    <p className="font-mono text-xs text-slate-500">{etu.matricule}</p>
                                </div>
                                <button onClick={() => handleDelete('etudiant', etu.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {etudiantsList.length === 0 && (
                            <div className="text-center py-10 text-slate-400 font-medium text-sm">
                                Aucun étudiant dans cette classe.
                            </div>
                        )}
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
