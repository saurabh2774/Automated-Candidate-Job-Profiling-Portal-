"use client";

import React, { useState, useEffect, use } from 'react'; // 1. Import 'use'
import { FiDownload, FiMail, FiUser } from 'react-icons/fi';

const JobApplicantsPage = ({ params }) => {
  // 2. Unwrap the params promise using React.use()
  const { id } = use(params);

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        // 3. Use 'id' directly instead of 'params.id'
        const res = await fetch(`/api/job-applicants/${id}`);
        const data = await res.json();
        if (data.success) {
          setApplicants(data.applicants);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Only run if id exists
    if (id) {
        fetchApplicants();
    }
  }, [id]); // 4. Depend on 'id'

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Applicants...</div>;

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold mb-4 text-white">
            Applicant <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Pool</span>
          </h1>
          <p className="text-gray-400">Reviewing candidates for <span className="text-white font-semibold">{applicants[0]?.role || "this role"}</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applicants.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 py-20">No applicants found for this job yet.</div>
          ) : (
            applicants.map((app) => (
              <div key={app.id} className="bg-slate-900/60 rounded-xl border border-gray-700 hover:border-emerald-500/50 transition-all p-6 flex flex-col relative overflow-hidden group">
                
                {/* Score Badge */}
                <div className="absolute top-4 right-4">
                  <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border ${
                    app.visualClass === 'A' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                  }`}>
                    <span className="font-bold text-sm">{app.score}</span>
                  </div>
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                        <FiUser />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{app.name}</h3>
                        <p className="text-xs text-gray-500">Applied: {app.appliedAt}</p>
                    </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-6 bg-black/20 p-2 rounded">
                    <FiMail className="text-emerald-500" />
                    <span className="truncate">{app.email}</span>
                </div>

                {/* Sustainability / Class */}
                <div className="mb-6">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Sustainability</span>
                        <span className={`text-sm font-bold ${app.visualClass === 'A' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {app.visualClass === 'A' ? 'High Match' : 'Medium Match'}
                        </span>
                    </div>
                    <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${app.visualClass === 'A' ? 'bg-emerald-500' : 'bg-yellow-500'}`} 
                            style={{ width: `${app.score}%` }}
                        ></div>
                    </div>
                </div>

                {/* Download Button */}
                <div className="mt-auto">
                    <a 
                        href={`/api/download-resume/${app.resumeId}`} 
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/5 hover:bg-emerald-600 hover:text-white text-gray-300 border border-gray-600 hover:border-emerald-500 transition-all font-medium text-sm"
                    >
                        <FiDownload />
                        Download Resume
                    </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JobApplicantsPage;