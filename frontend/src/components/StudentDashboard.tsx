import { FileText, Users, BookOpen, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import api from '../api';

const mockStudent = {
  name: 'Alice Dupont',
  id: 'ETU-2023-001',
  filiere: 'Génie Logiciel',
  classe: 'Licence 3',
  grades: [
    { subject: 'Bases de Données 2', grade: 16.5, professor: 'Dr. Smith' },
    { subject: 'Développement Web', grade: 18.0, professor: 'Prof. Johnson' },
    { subject: 'Réseaux Informatiques', grade: 14.0, professor: 'Dr. Alan' },
    { subject: 'Algorithmique Avancée', grade: 15.5, professor: 'Dr. Turing' },
  ],
  classmates: [
    { name: 'Bob Martin', id: 'ETU-2023-002' },
    { name: 'Charlie Durand', id: 'ETU-2023-003' },
    { name: 'Diana Prince', id: 'ETU-2023-004' },
    { name: 'Eve Adams', id: 'ETU-2023-005' },
    { name: 'Frank Castle', id: 'ETU-2023-006' },
    { name: 'Grace Hopper', id: 'ETU-2023-007' },
  ]
};

export default function StudentDashboard() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadBulletin = async () => {
    try {
      setIsDownloading(true);
      const response = await api.get('/notes/bulletin', {
        responseType: 'blob', // Important pour récupérer un fichier binaire (PDF)
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Mon_Bulletin.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur lors du téléchargement du bulletin', error);
      alert('Impossible de générer le bulletin.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, {mockStudent.name}</h1>
          <p className="text-slate-500 mt-1">Here is your academic overview for this semester.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10"></div>
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Academic Info
          </h2>
          <div className="space-y-5">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Student ID</p>
              <p className="font-mono font-medium text-slate-900 bg-slate-50 inline-block px-2 py-1 rounded border border-slate-100">{mockStudent.id}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Major (Filière)</p>
              <p className="font-medium text-slate-900">{mockStudent.filiere}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Class</p>
              <p className="font-medium text-slate-900">{mockStudent.classe}</p>
            </div>
          </div>
        </div>

        {/* Grades Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm md:col-span-2">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2">
            <FileText className="w-4 h-4" /> My Grades
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Subject</th>
                  <th className="pb-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Professor</th>
                  <th className="pb-3 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mockStudent.grades.map((g, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 font-medium text-slate-900">{g.subject}</td>
                    <td className="py-4 text-slate-500 text-sm">{g.professor}</td>
                    <td className="py-4 text-right">
                      <span className="font-mono font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                        {g.grade.toFixed(1)} <span className="text-indigo-300 font-normal text-xs">/ 20</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Classmates Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm md:col-span-3">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Users className="w-4 h-4" /> Classmates ({mockStudent.classe})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockStudent.classmates.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all cursor-default">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200/50">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{c.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
