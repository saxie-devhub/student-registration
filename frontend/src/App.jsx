import { useState, useEffect } from 'react';

export default function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  // State for the Form
  const [formData, setFormData] = useState({
    id: null, full_name: '', email: '', phone: '', course: '', gender: '', dob: ''
  });

  // State to track if we are editing
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    const url = isEditing ? `/api/students/${formData.id}` : '/api/students';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Action failed');

      setMessage({ text: isEditing ? '✅ Student updated!' : '✅ Student registered!', type: 'success' });
      resetForm();
      fetchStudents();
    } catch (err) {
      setMessage({ text: '❌ ' + err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await fetch(`/api/students/${id}`, { method: 'DELETE' });
      fetchStudents();
    } catch (err) {
      alert("Failed to delete student");
    }
  };

  const handleEditClick = (student) => {
    setFormData(student);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to see form
  };

  const resetForm = () => {
    setFormData({ id: null, full_name: '', email: '', phone: '', course: '', gender: '', dob: '' });
    setIsEditing(false);
    setMessage({ text: '', type: '' });
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-12 overflow-x-hidden">
      
      <header className="py-10 px-6 text-center animate-fade-in-down">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          🎓 Student <span className="text-purple-700">Registration</span>
        </h1>
        <p className="text-gray-600 mt-3 font-medium text-lg">Manage and register records elegantly.</p>
      </header>

      <main className="max-w-5xl mx-auto mt-4 px-4 grid gap-8">
        
        {/* FORM CARD */}
        <section className={`bg-white/70 backdrop-blur-lg rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${isEditing ? 'border-purple-400 shadow-purple-500/20' : 'border-white/50'} p-6 md:p-8 transition-all duration-500`}>
          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-purple-600 pl-4">
              {isEditing ? 'Edit Student Details' : 'New Student'}
            </h2>
            {isEditing && (
              <button onClick={resetForm} className="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors">
                Cancel Edit
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="flex flex-col gap-2 group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-purple-700 transition-colors">Full Name *</label>
              <input required type="text" id="full_name" value={formData.full_name} onChange={handleChange} 
                className="px-5 py-3.5 bg-white/50 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-none transition-all duration-300 hover:bg-white/80" />
            </div>
            
            <div className="flex flex-col gap-2 group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-purple-700 transition-colors">Email *</label>
              <input required type="email" id="email" value={formData.email} onChange={handleChange} 
                className="px-5 py-3.5 bg-white/50 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-none transition-all duration-300 hover:bg-white/80" />
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-purple-700 transition-colors">Phone</label>
              <input type="tel" id="phone" value={formData.phone} onChange={handleChange} 
                className="px-5 py-3.5 bg-white/50 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-none transition-all duration-300 hover:bg-white/80" />
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-purple-700 transition-colors">Course *</label>
              <select required id="course" value={formData.course} onChange={handleChange}
                className="px-5 py-3.5 bg-white/50 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-none transition-all duration-300 text-gray-700 hover:bg-white/80 cursor-pointer">
                <option value="">-- Select Course --</option>
                <option>Computer Science</option>
                <option>Business Admin</option>
                <option>Engineering</option>
                <option>Nursing</option>
                <option>Law</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-purple-700 transition-colors">Gender *</label>
              <select required id="gender" value={formData.gender} onChange={handleChange}
                className="px-5 py-3.5 bg-white/50 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-none transition-all duration-300 text-gray-700 hover:bg-white/80 cursor-pointer">
                <option value="">-- Select Gender --</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider group-focus-within:text-purple-700 transition-colors">Date of Birth *</label>
              <input required type="date" id="dob" value={formData.dob} onChange={handleChange}
                className="px-5 py-3.5 bg-white/50 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-none transition-all duration-300 text-gray-700 hover:bg-white/80 cursor-pointer" />
            </div>
            
            <div className="md:col-span-2 lg:col-span-3 mt-4">
              <button disabled={isLoading} type="submit" 
                className={`w-full text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] disabled:bg-gray-400 disabled:shadow-none disabled:transform-none ${isEditing ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30'}`}>
                {isLoading ? 'Saving...' : (isEditing ? 'Update Student' : 'Register Student')}
              </button>
              
              {message.text && (
                <p className={`mt-5 text-center font-bold text-lg animate-fade-in ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {message.text}
                </p>
              )}
            </div>
          </form>
        </section>

        {/* TABLE CARD */}
        <section className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-6 md:p-8 animate-slide-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Registered Students</h2>
            
            {/* SEARCH BAR WITH ICON */}
            <div className="relative w-full md:w-80">
              <svg className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="search" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 pr-4 py-3 border border-gray-300/50 rounded-full focus:ring-2 focus:ring-purple-500 outline-none w-full bg-white/50 focus:bg-white transition-all duration-300"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/40">
            
            <div className="hidden md:grid grid-cols-6 gap-4 bg-white/60 p-5 font-bold text-gray-700 text-xs uppercase tracking-wider border-b border-white/50">
              <div>ID</div>
              <div className="col-span-2">Name & Email</div>
              <div>Course</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="flex flex-col divide-y divide-white/40">
              {filteredStudents.length === 0 ? (
                /* PREMIUM EMPTY STATE */
                <div className="p-16 flex flex-col items-center justify-center text-center animate-fade-in">
                  <svg className="w-16 h-16 text-purple-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  <p className="text-gray-500 font-medium text-lg">No students found.</p>
                  <p className="text-gray-400 text-sm mt-1">Register a new student or try a different search.</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div 
                    key={student.id} 
                    className={`grid grid-cols-1 md:grid-cols-6 gap-4 p-5 hover:bg-white/60 transition-colors duration-200 items-center bg-white/30 md:bg-transparent rounded-lg md:rounded-none mb-2 md:mb-0 ${formData.id === student.id ? 'bg-purple-50/50 border-l-4 border-purple-500' : ''}`}
                  >
                    <div className="flex justify-between md:block">
                      <span className="md:hidden text-xs font-bold text-gray-500 uppercase">ID</span>
                      <span className="font-bold text-gray-900 md:font-medium md:text-gray-600">#{student.id}</span>
                    </div>

                    <div className="flex flex-col md:col-span-2">
                      <span className="font-bold text-gray-900 text-base">{student.full_name}</span>
                      <span className="text-gray-500 text-sm">{student.email}</span>
                    </div>

                    <div className="flex justify-between md:block">
                      <span className="md:hidden text-xs font-bold text-gray-500 uppercase">Course</span>
                      <span className="bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold tracking-wide inline-block w-max">
                        {student.course}
                      </span>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex justify-end gap-2 mt-2 md:mt-0 md:col-span-2">
                      <button onClick={() => handleEditClick(student)} 
                        className="text-gray-600 hover:text-white hover:bg-gray-800 border border-gray-300 px-4 py-1.5 rounded-lg transition-all duration-300 text-sm font-bold active:scale-95 w-full md:w-auto">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(student.id)} 
                        className="text-red-600 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-4 py-1.5 rounded-lg transition-all duration-300 text-sm font-bold active:scale-95 w-full md:w-auto">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}