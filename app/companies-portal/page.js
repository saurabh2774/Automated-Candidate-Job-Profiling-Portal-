"use client";
import { useEffect, useState } from 'react';

const CompanyCard = ({ company }) => {
  
  return (
    <div className="card bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-white hover:text-purple-400 transition-colors">
          {company.name || company.company_name}
        </h2>
      </div>

      <h3 className="text-purple-400 text-lg mb-4 font-medium">
        {company.jobTitle || company.job_title}
      </h3>

      {company.location && (
        <div className="flex items-center text-gray-400 mb-4">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm">{company.location}</span>
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-3">Required Skills:</p>
        <div className="flex flex-wrap gap-2">
          {(company.skills || company.required_skills || []).map((skill, index) => (
            <span
              key={index}
              className="bg-purple-500/20 border border-purple-500/50 px-3 py-1 rounded-full text-sm text-purple-300 hover:bg-purple-500/30 transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
        <p className="text-gray-400 text-sm mt-4">
          Experience Required: <span className="text-purple-300 font-medium">
            {company.experienceLevel || company.experience_required}
          </span>
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <button
          onClick={() => window.location.href = `mailto:${company.email}`}
          className="w-full bg-purple-500/20 text-purple-300 border border-purple-500/50 py-2 px-4 rounded-lg hover:bg-purple-500/30 transition-all duration-300 flex items-center justify-center font-medium"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Apply Now
        </button>
      </div>
    </div>
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
        setCompanies(data);
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
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="items-center text-center">

      <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 mb-6">
          Willing to Hire Candidates ?
      </h1>
      </div>
      <div className="flex justify-center mb-12">
        <button
          onClick={() => window.location.href = '/post-company'}
          className="bg-purple-600 text-white text-xl font-semibold px-10 py-4 rounded-xl
    hover:bg-purple-700 transform hover:-translate-y-1 transition-all duration-200
    shadow-lg hover:shadow-purple-500/30 flex items-center space-x-2 border-2 border-purple-500"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Post Your Job</span>
        </button>
      </div>

      <div className="text-center mb-12">

      </div>
      <div className="h-px bg-gray-700 mb-8"></div>
      <h1 className="text-5xl font-extrabold mb-12 text-center text-white tracking-tight">
        Company <span className="text-purple-400">Hiring</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {companies && companies.map((company) => (
          <CompanyCard key={company._id} company={company} />
        ))}
      </div>
    </div>
  );
}
