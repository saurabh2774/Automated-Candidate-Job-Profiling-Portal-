"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiBriefcase } from 'react-icons/fi';

const HostedJobsPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch('/api/my-posted-jobs');
        const data = await res.json();
        if (data.success) {
          setCompanies(data.companies);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold mb-4 text-white">
            Hosted <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Jobs</span>
          </h1>
          <p className="text-gray-400">Manage the roles you have posted.</p>
        </div>

        {/* Date Section - most recent posted job */}
        {companies.length > 0 && (() => {
          const latest = companies[0];
          const postedDate = latest?.createdAt ? new Date(latest.createdAt) : null;
          return postedDate ? (
            <div className="mb-12 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-center text-gray-100">
                {postedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
            </div>
          ) : null;
        })()}

        <div className="grid grid-cols-1 gap-6">
          {companies.length === 0 ? (
            <div className="text-gray-500 text-center py-20">You haven't posted any jobs yet.</div>
          ) : (
            companies.map((company) => (
              
              <Link key={company.id} href={`/hosted-jobs/${company.id}`} className="block group ">
                <div className="bg-slate-900/50 rounded-2xl border border-purple-500/20 p-6 hover:border-purple-500/50 transition-all relative overflow-hidden">
                  {/* Decorator */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-bl-full"></div>
                  
                  <div className="flex gap-4 items-start relative z-10">
                    <div className="bg-white/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4 text-2xl">
                      🏢
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{company.role}</h2>
                      <p className="text-purple-200 font-medium">{company.company}</p>
                      <div className="text-sm text-gray-400 mt-2 space-y-1">
                        <div>Posted on: <span className="text-gray-200 font-medium">{company.postedOn}</span></div>
                        
                        <div>
                          Deadline: <span className="font-semibold text-gray-200">{company.deadline}</span>
                          {company.status === "Closed" && (
                            <span className="ml-2 px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 font-semibold">
                              Closed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center gap-2" />
                    <span className="text-emerald-400 text-sm flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <FiBriefcase /> View Applicants
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HostedJobsPage;