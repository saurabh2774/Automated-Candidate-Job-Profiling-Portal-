'use client';
import { useState, useEffect } from 'react';

const Dashboard = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matched-applications');
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Group matches by fullName
  const groupedMatches = matches.reduce((groups, match) => {
    const fullName = match.fullName || 'Unknown';
    if (!groups[fullName]) {
      groups[fullName] = [];
    }
    groups[fullName].push(match);
    return groups;
  }, {});

  if (loading) {
    return <div className="min-h-screen p-8 text-white text-2xl">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-12">
        <h1 className="text-5xl font-extrabold mb-12  text-white tracking-tight">
          Matched <span className="text-purple-300">Companies</span>
        </h1>
          <p className="text-gray-400">Track your job applications and matches</p>
        </div>
      
        {Object.entries(groupedMatches).map(([fullName, groupMatches]) => (
          <div key={fullName} className="mb-16">
            <div className="mb-8">
              <h2 className="text-4xl font-semibold text-center text-purple-900">
                {fullName}
              </h2>
            </div>
            <div className="h-px bg-gray-700 mb-8"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {groupMatches.map((match) => (
                <div 
                  key={match._id} 
                  className="card bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-purple-500/20 
                    transition-all duration-300 hover:-translate-y-1 border border-gray-700"
                >
                  <h3 className="text-2xl font-bold text-white mb-2 hover:text-purple-400 transition-colors">
                    {match.companyName}
                  </h3>
                  <p className="text-purple-400 text-lg mb-4 font-medium">{match.jobTitle}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {match.matchedSkills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="bg-purple-500/20 border border-purple-500/50 px-3 py-1 rounded-full 
                          text-sm text-purple-300 hover:bg-purple-500/30 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/50">
                    <p className="text-gray-400 text-sm">
                      Sent: {new Date(match.sentAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-green-400 font-medium">Status: {match.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

