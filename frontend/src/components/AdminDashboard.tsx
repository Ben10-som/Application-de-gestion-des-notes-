import { useState } from 'react';
import { Layers, Users, GraduationCap, Search, Filter } from 'lucide-react';

const mockAdminData = {
  classes: [
    { id: 'C1', name: 'Licence 1 - Tronc Commun', students: 120, professors: 8 },
    { id: 'C2', name: 'Licence 2 - Informatique', students: 85, professors: 6 },
    { id: 'C3', name: 'Licence 3 - Génie Logiciel', students: 45, professors: 5 },
    { id: 'C4', name: 'Master 1 - Data Science', students: 25, professors: 4 },
  ],
  professors: [
    { id: 'P1', name: 'Dr. Smith', department: 'Informatique', classes: ['Licence 3 - GL', 'Master 1 - DS'] },
    { id: 'P2', name: 'Prof. Johnson', department: 'Mathématiques', classes: ['Licence 1 - TC', 'Licence 2 - Info'] },
    { id: 'P3', name: 'Dr. Alan', department: 'Réseaux', classes: ['Licence 3 - GL'] },
  ]
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'classes' | 'professors'>('classes');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClasses = mockAdminData.classes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredProfessors = mockAdminData.professors.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Administration Overview</h1>
          <p className="text-slate-500 mt-1">Manage all academic entities from a single pane of glass.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-100/50 p-1.5 rounded-xl w-fit mb-6 border border-slate-200/50">
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'classes' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <Layers className="w-4 h-4" /> Classes
        </button>
        <button
          onClick={() => setActiveTab('professors')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'professors' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Professors
        </button>
      </div>

      {/* Content */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {activeTab === 'classes' && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Class Name</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Total Students</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Assigned Professors</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClasses.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-5 px-6 font-medium text-slate-900">{c.name}</td>
                  <td className="py-5 px-6 text-slate-600">
                    <div className="flex items-center gap-2 bg-slate-100 w-fit px-3 py-1 rounded-full text-sm border border-slate-200">
                      <Users className="w-4 h-4 text-slate-400" /> <span className="font-medium">{c.students}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-slate-600">
                    <div className="flex items-center gap-2 bg-slate-100 w-fit px-3 py-1 rounded-full text-sm border border-slate-200">
                      <GraduationCap className="w-4 h-4 text-slate-400" /> <span className="font-medium">{c.professors}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClasses.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    No classes found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'professors' && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Professor Name</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Department</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider">Assigned Classes</th>
                <th className="py-4 px-6 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProfessors.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-5 px-6 font-medium text-slate-900 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200/50 shadow-sm">
                        {p.name.split(' ').map(n => n[0]).join('').replace('.','')}
                      </div>
                    {p.name}
                  </td>
                  <td className="py-5 px-6 text-slate-600">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm border border-slate-200 font-medium">
                      {p.department}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-wrap gap-2">
                      {p.classes.map((c, j) => (
                        <span key={j} className="px-2.5 py-1 bg-white text-slate-600 text-xs font-medium rounded-md border border-slate-200 shadow-sm">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProfessors.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    No professors found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
