'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function JobDetailsPage() {
    const params = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                // This now returns { ...job, hasApplied: true/false }
                const response = await fetch(`/api/companies/${params.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setJob(data);
                }
            } catch (error) {
                console.error("Error fetching job:", error);
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchJob();
    }, [params.id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white text-2xl">Loading Details...</div>;
    if (!job) return <div className="min-h-screen flex items-center justify-center text-white text-2xl">Job Not Found</div>;

    // Helper to render the Apply Button based on status
    const renderApplyButton = () => {
        if (job.hasApplied) {
            return (
                <button 
                    disabled
                    className="block w-full bg-green-600 text-gray-300 cursor-not-allowed text-center font-bold py-3 rounded-lg border border-gray-500"
                >
                    You&apos;ve Applied
                </button>
            );
        }
        return (
            <Link 
                href={`/resume-portal?companyId=${job._id}&companyName=${encodeURIComponent(job.name)}`}
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-green-500/30"
            >
                Apply Now
            </Link>
        );
    };

    return (
        <div className="min-h-screen pb-20 bg-gray-900">
            {/* Header Section */}
            <div className="bg-gray-800 border-b border-gray-700 pt-12 pb-8 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div>
                            <div className="bg-white/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4 text-2xl font-bold text-white">
                                {job.name ? job.name.charAt(0) : "C"}
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2">{job.jobTitle}</h1>
                            <div className="flex flex-wrap gap-4 text-gray-400 text-sm items-center">
                                <span className="flex items-center text-purple-300 font-medium">{job.name}</span>
                                <span className="flex items-center text-gray-300">{job.location}</span>
                                <span className="flex items-center text-gray-400">Posted: {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently"}</span>
                            </div>
                        </div>
                        
                        {/* Floating Action Card (Desktop) */}
                        <div className="hidden md:block bg-gray-900 border border-gray-700 p-6 rounded-xl min-w-[300px] shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-300">Deadline:</span>
                                <span className="text-red-400 font-bold">
                                    {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : "Open"}
                                </span>
                            </div>
                            
                            {/* Render Dynamic Button */}
                            {renderApplyButton()}
                            
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Main Content - Left Column */}
                <div className="md:col-span-2 space-y-8">
                    
                    {/* Description Section */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
                        <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-purple-500 pl-3">Details</h3>
                        
                        {/* Short Desc */}
                        <p className="text-gray-300 mb-6 leading-relaxed whitespace-pre-line">
                            {job.jobDescription}
                        </p>

                        {/* Responsibilities */}
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-white mb-3">Responsibilities of the Intern:</h4>
                            <div className="text-gray-300 whitespace-pre-line pl-4 border-l border-gray-600">
                                {job.responsibilities || "No specific responsibilities listed."}
                            </div>
                        </div>

                        {/* Requirements */}
                        <div>
                            <h4 className="text-lg font-semibold text-white mb-3">Requirements:</h4>
                            <div className="text-gray-300 whitespace-pre-line pl-4 border-l border-gray-600">
                                {job.requirements || "No specific requirements listed."}
                            </div>
                        </div>
                    </div>

                    {/* Skills Tags */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
                        <h3 className="text-xl font-bold text-white mb-4">Skills Required</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.skills && job.skills.map((skill, index) => (
                                <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    
                    {/* Mobile Apply Button (Visible only on mobile) */}
                    <div className="md:hidden bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-md">
                         {renderApplyButton()}
                    </div>

                    {/* Important Dates */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
                        <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-purple-500 pl-3">Important Dates</h3>
                        <div className="flex items-start gap-3">
                            <div className="bg-gray-700 p-2 rounded text-purple-400">📅</div>
                            <div>
                                <p className="text-xs text-gray-400">Application Deadline</p>
                                <p className="text-sm text-white font-medium">
                                    {job.applicationDeadline ? new Date(job.applicationDeadline).toDateString() : "Ongoing"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Eligibility */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
                        <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-purple-500 pl-3">Eligibility</h3>
                        <p className="text-gray-300 text-sm">{job.eligibility || "Open to all"}</p>
                    </div>

                    {/* Additional Info Cards */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-purple-500 pl-3">Additional Info</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-700/30 p-3 rounded-lg">
                                <p className="text-xs text-gray-400">Duration</p>
                                <p className="text-sm text-white font-bold">{job.duration || "N/A"}</p>
                            </div>
                            <div className="bg-gray-700/30 p-3 rounded-lg">
                                <p className="text-xs text-gray-400">Stipend</p>
                                <p className="text-sm text-white font-bold">{job.salary || "Unpaid"}</p>
                            </div>
                            <div className="bg-gray-700/30 p-3 rounded-lg">
                                <p className="text-xs text-gray-400">Work Mode</p>
                                <p className="text-sm text-white font-bold">{job.workMode || "Remote"}</p>
                            </div>
                            <div className="bg-gray-700/30 p-3 rounded-lg">
                                <p className="text-xs text-gray-400">Schedule</p>
                                <p className="text-sm text-white font-bold">{job.schedule || "Full Time"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Card */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
                        <h3 className="text-lg font-bold text-white mb-2 border-l-4 border-purple-500 pl-3">Contact</h3>
                        <p className="text-gray-300 text-sm mb-2">{job.name} HR Team</p>
                        <a href={`mailto:${job.email}`} className="text-purple-400 text-sm hover:underline">{job.email}</a>
                    </div>

                </div>
            </div>
        </div>
    );
}
