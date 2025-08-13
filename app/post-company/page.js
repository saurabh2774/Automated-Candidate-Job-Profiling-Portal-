'use client'
import React, { useState } from 'react'

const post_company = () => {
    
    const [formData, setFormData] = useState({
        companyName: '',
        jobTitle: '',
        location: '',
        skills: '',
        experienceLevel: '',
        email: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Convert skills string to array
        const skillsArray = formData.skills.split(',').map(skill => skill.trim());

        try {
            const response = await fetch('/api/post-company', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.companyName,
                    jobTitle: formData.jobTitle,
                    location: formData.location,
                    skills: skillsArray,
                    experienceLevel: formData.experienceLevel,
                    email: formData.email
                }),
            });

            if (response.ok) {
                alert('Job posted successfully!');
                // Reset form
                setFormData({
                    companyName: '',
                    jobTitle: '',
                    location: '',
                    skills: '',
                    experienceLevel: '',
                    email: ''
                });
            } else {
                alert('Error posting job');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error posting job');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-5xl font-extrabold mb-12 text-center text-white tracking-tight">
                    Companies <span className="text-purple-400">Portal</span>
                </h1>

                <div className="bg-white backdrop-blur-lg bg-opacity-90 shadow-2xl rounded-2xl p-8 space-y-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label htmlFor="companyName" className="block text-gray-900 font-bold mb-2">
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    id="companyName"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                                    placeholder="Enter company name"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="jobTitle" className="block text-gray-900 font-bold mb-2">
                                    Job Title *
                                </label>
                                <input
                                    type="text"
                                    id="jobTitle"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                                    placeholder="Enter job title"
                                    value={formData.jobTitle}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="location" className="block text-gray-900 font-bold mb-2">
                                Location *
                            </label>
                            <input
                                type="text"
                                id="location"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                                placeholder="Enter job location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="skills" className="block text-gray-900 font-bold mb-2">
                                Required Skills (comma-separated) *
                            </label>
                            <textarea
                                id="skills"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                                placeholder="e.g., React, JavaScript, Node.js"
                                rows="3"
                                value={formData.skills}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="experienceLevel" className="block text-gray-900 font-bold mb-2">
                                Required Experience Level *
                            </label>
                            <select
                                id="experienceLevel"
                                name="experienceLevel"
                                value={formData.experienceLevel}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                            >
                                <option value="entry">Entry Level</option>
                                <option value="mid">Mid Level</option>
                                <option value="senior">Senior Level</option>
                                <option value="executive">Executive Level</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-gray-900 font-bold mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                                placeholder="Enter contact email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transform transition-all hover:scale-[1.02]"
                        >
                            Submit Job Posting
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default post_company