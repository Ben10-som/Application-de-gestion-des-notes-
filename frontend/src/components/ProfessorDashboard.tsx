import { useState } from 'react';
import { Save, CheckCircle2, Search } from 'lucide-react';

const mockProfessor = {
  name: 'Dr. Smith',
  classes: [
    {
      id: 'C1',
      name: 'Licence 3 - Génie Logiciel',
      subject: 'Bases de Données 2',
      students: [
        { id: 'ETU-001', name: 'Alice Dupont', grade: 16.5 },
        { id: 'ETU-002', name: 'Bob Martin', grade: null },
        { id: 'ETU-003', name: 'Charlie Durand', grade: 14.0 },
        { id: 'ETU-004', name: 'Diana Prince', grade: 19.0 },
        { id: 'ETU-005', name: 'Eve Adams', grade: null },
      ]
    },
    {
      id: 'C2',
      name: 'Master 1 - Data Science',
      subject: 'Bases de Données Avancées',
      students: [
        { id: 'ETU-101', name: 'Frank Castle', grade: null },
        { id: 'ETU-102', name: 'Grace Hopper', grade: 18.5 },
        { id: 'ETU-103', name: 'Heidi Klum', grade: null },
      ]
    }
  ]
};

export default function ProfessorDashboard() {
  const [selectedClassId, setSelectedClassId] = useState(mockProfessor.classes[0].id);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedClass = mockProfessor.classes.find(c => c.id === selectedClassId);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const filteredStudents = selectedClass?.students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Professor Portal</h1>
        <p className="text-slate-500 mt-1">Manage your classes and submit grades efficiently.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Classes List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">My Classes</h2>
          {mockProfessor.classes.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                selectedClassId === c.id 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02]' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <p className={`font-semibold ${selectedClassId === c.id ? 'text-white' : 'text-slate-900'}`}>{c.name}</p>
              <p className={`text-xs mt-1 ${selectedClassId === c.id ? 'text-indigo-100' : 'text-slate-500'}`}>{c.subject}</p>
              <div className={`mt-3 text-xs inline-flex items-center px-2 py-1 rounded-md ${selectedClassId === c.id ? 'bg-indigo-500/50 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {c.students.length} Students
              </div>
            </button>
          ))}
        </div>

        {/* Main Area: Student List & Grading */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 rounded-t-2xl">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedClass?.name}</h2>
              <p className="text-sm text-indigo-600 font-medium mt-1">{selectedClass?.subject}</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search student..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button 
                onClick={handleSave}
                className={`px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shadow-sm whitespace-nowrap ${
                  saved 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 border border-transparent'
                }`}
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved' : 'Save Grades'}
              </button>
            </div>
          </div>
          
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white sticky top-0 z-10 shadow-sm shadow-slate-100">
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Student ID</th>
                  <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Name</th>
                  <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Grade (/20)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents?.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6 text-sm text-slate-500 font-mono">{s.id}</td>
                    <td className="py-4 px-6 font-medium text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
                        {s.name.charAt(0)}
                      </div>
                      {s.name}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {s.grade === null && <span className="text-xs text-amber-500 font-medium bg-amber-50 px-2 py-1 rounded border border-amber-100 mr-2">Missing</span>}
                        <input 
                          type="number" 
                          min="0" 
                          max="20" 
                          step="0.5"
                          defaultValue={s.grade || ''}
                          placeholder="--"
                          className="w-24 px-3 py-2 text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono font-medium text-slate-900 bg-white shadow-sm transition-shadow"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents?.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-500">
                      No students found matching "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
