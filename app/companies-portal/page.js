"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

const CompanyCard = ({ company }) => {
  const postDate = company.createdAt || company.postedOn;
  const formattedDate = postDate 
    ? new Date(postDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date not available';

  return (
    <Link href={`/companies-portal/${company._id}`} className="block h-full group">
      {/* Outer Card: flex col and h-full allow it to fill the grid cell */}
      <div className="relative bg-slate-900/50 p-6 rounded-2xl shadow-xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2 border border-purple-500/20 hover:border-purple-500/60 hover:bg-purple-900/10 h-full flex flex-col overflow-hidden">
        
        {/* Header: Title & Date */}
        <div className="flex justify-between items-start mb-3 relative z-10 gap-3">
          <h2 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300 line-clamp-2">
            {company.name || company.company_name}
          </h2>
          {/* shrink-0 and whitespace-nowrap prevent the date from squishing */}
          <span className="shrink-0 text-xs font-medium text-gray-400 bg-gray-800/80 px-2.5 py-1 rounded-md border border-gray-700/50 whitespace-nowrap">
            {formattedDate}
          </span>
        </div>

        {/* Job Title */}
        <h3 className="text-purple-400 text-lg mb-3 font-medium relative z-10 flex items-start gap-2 line-clamp-2">
          {/* shrink-0 keeps the icon perfectly round */}
          <svg className="w-5 h-5 opacity-80 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>{company.jobTitle || company.job_title}</span>
        </h3>

        {/* Location */}
        {company.location && (
          <div className="flex items-start text-gray-400 mb-5 relative z-10 gap-2">
            <svg className="w-4 h-4 text-pink-400/70 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm line-clamp-1">{company.location}</span>
          </div>
        )}

        {/* Skills Container: flex-grow pushes the bottom elements down */}
        <div className="flex-grow mb-6 relative z-10">
          <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {(company.skills || company.required_skills || []).map((skill, index) => (
              <span
                key={index}
                className="bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-lg text-xs font-medium text-purple-200 group-hover:border-purple-400/60 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Section: mt-auto forces this to the absolute bottom of the card universally */}
        <div className="relative z-10 mt-auto">
          {/* Experience Box */}
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50 mb-4">
            <p className="text-gray-400 text-sm flex items-center justify-between gap-3">
              <span className="shrink-0">Experience:</span>
              <span className="text-pink-300 font-semibold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20 truncate text-right">
                {company.experienceLevel || company.experience_required}
              </span>
            </p>
          </div>
          
          {/* Button */}
          <div className="pt-4 border-t border-gray-700/50">
            <div className="w-full bg-purple-500/20 text-purple-300 border border-purple-500/50 py-2 px-4 rounded-lg group-hover:bg-purple-500/30 transition-all duration-300 flex items-center justify-center font-medium">
              <svg className="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </div>
          </div>
        </div>
        
      </div>
    </Link>
  );
};

export default function CompaniesPortal() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        const data = await response.json();
        
        // Sorting logic: Newest first
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.postedOn || 0).getTime();
          const dateB = new Date(b.createdAt || b.postedOn || 0).getTime();
          return dateB - dateA; 
        });

        setCompanies(sortedData);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
           <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
           <h1 className="text-2xl font-bold text-white">Loading Opportunities...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      
      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white tracking-tight">
          Explore <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Opportunities</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Discover the latest roles from top companies looking for talent like you.
        </p>
      </div>
      
      {companies.length === 0 ? (
        <div className="text-center text-gray-400 text-xl py-10">
          No job postings available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          {companies.map((company) => (
            <CompanyCard key={company._id} company={company} />
          ))}
        </div>
      )}
    </div>
  );
}