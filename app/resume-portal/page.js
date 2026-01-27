"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ResumePortalContent() {
  const searchParams = useSearchParams();
  const targetCompanyId = searchParams.get('companyId');
  const targetCompanyName = searchParams.get('companyName');

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    desiredJobTitle: "",
    skills: "",
    experienceLevel: "entry",
    autoApply: !targetCompanyId, // Default to false if applying to specific company
    resume: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [matchNotification, setMatchNotification] = useState({ show: false, message: "" });

  // Effect to handle direct application state
  useEffect(() => {
    if (targetCompanyId) {
      setFormData(prev => ({ ...prev, autoApply: false }));
    }
  }, [targetCompanyId]);

  const validateFile = (file) => {
    // Check if file exists
    if (!file) return 'Please select a file';

    // Check file type
    const validTypes = ['application/pdf'];
    if (!validTypes.includes(file.type)) {
      return 'Only PDF files are allowed';
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "file") {
      const file = files[0];
      const error = validateFile(file);
      if (error) {
        setSubmitError(error);
        e.target.value = ''; // Reset file input
        return;
      }
      setSubmitError('');
      setFormData({
        ...formData,
        [name]: file,
      });
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setMatchNotification({ show: false, message: "" });
    
    try {
        const fileError = validateFile(formData.resume);
        if (fileError) {
            setSubmitError(fileError);
            setIsSubmitting(false);
            return;
        }

        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'skills') {
                formDataToSend.append(key, formData[key].trim());
            } else if (key === 'autoApply') {
                formDataToSend.append(key, formData[key].toString());
            } else {
                formDataToSend.append(key, formData[key]);
            }
        });

        // --- KEY ADDITION: Pass the target company ID if it exists ---
        if (targetCompanyId) {
            formDataToSend.append('targetCompanyId', targetCompanyId);
        }

        const response = await fetch('/api/resume-upload', {
            method: 'POST',
            body: formDataToSend,
        });

        if (!response.ok) {
            let errorMessage;
            const contentType = response.headers.get("content-type");
            
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const errorData = await response.json();
                errorMessage = errorData.message || 'Failed to submit application';
            } else {
                const errorText = await response.text();
                console.error("Server returned non-JSON error:", errorText);
                errorMessage = `Server error: ${response.status} ${response.statusText}. Check console for details.`;
            }
            throw new Error(errorMessage);
        }
        

        const data = await response.json();
        
        if (data.success) {
            setSubmitSuccess(true);
            setMatchNotification({
                show: true,
                message: targetCompanyId 
                  ? `Application sent successfully to ${targetCompanyName || 'the company'}!`
                  : (data.matches > 0 ? `Match found: ${data.matches} matches found` : "Match not found")
            });
            
            setFormData({
                fullName: "",
                email: "",
                desiredJobTitle: "",
                skills: "",
                experienceLevel: "entry",
                autoApply: false,
                resume: null,
            });
            e.target.reset(); 
        } else {
            throw new Error(data.message || 'Failed to submit application');
        }
        
    } catch (error) {
        console.error("Error submitting form:", error);
        const errorMessage = error.message.includes('duplicate') || error.message.includes('already applied')
            ? "You have already applied for this position"
            : error.message || 'Failed to submit application';
        
        setSubmitError(errorMessage);
        
        setMatchNotification({
            show: true,
            message: errorMessage,
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-5xl font-extrabold mb-12 text-center text-white tracking-tight">
          {targetCompanyId ? (
             <>Apply to <span className="text-purple-400">{targetCompanyName || 'Company'}</span></>
          ) : (
             <>Resume <span className="text-purple-400">Portal</span></>
          )}
        </h1>
        
        {matchNotification.show && (
          <div className={`${
              matchNotification.message.includes('already applied') || matchNotification.message.includes('Failed')
                  ? 'bg-red-100 border-red-400 text-red-700'
                  : matchNotification.message.includes('not')
                  ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                  : 'bg-blue-100 border-blue-400 text-blue-700'
          } border px-6 py-4 rounded-lg mb-8 shadow-lg`}>
              {matchNotification.message}
          </div>
        )}
        
        {submitSuccess ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-8 shadow-lg backdrop-blur-sm bg-opacity-90">
            <p className="font-bold text-lg mb-2">Success!</p>
            <p className="mb-4">Your resume has been submitted successfully.</p>
            <button 
              onClick={() => setSubmitSuccess(false)}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white backdrop-blur-lg bg-opacity-90 shadow-2xl rounded-2xl p-8 space-y-8">
            {submitError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                {submitError}
              </div>
            )}
            
            <div>
              <label htmlFor="resume" className="block text-gray-900 font-bold mb-2">
                Resume (PDF) *
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  onChange={handleChange}
                  accept=".pdf"
                  required
                  className="hidden"
                />
                <label
                  htmlFor="resume"
                  className="cursor-pointer flex items-center justify-center border-2 border-dashed border-purple-300 rounded-lg p-8 hover:border-purple-500 hover:bg-purple-50 transition-all group"
                >
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-purple-400 group-hover:text-purple-500 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600 group-hover:text-gray-700">
                      {formData.resume
                        ? `Selected: ${formData.resume.name}`
                        : "Drop your PDF here, or click to select"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF up to 5MB
                    </p>
                  </div>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="fullName" className="block text-gray-900 font-bold mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-900 font-bold mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                  placeholder="johndoe@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="desiredJobTitle" className="block text-gray-900 font-bold mb-2">
                  Desired Job Title *
                </label>
                <input
                  type="text"
                  id="desiredJobTitle"
                  name="desiredJobTitle"
                  value={formData.desiredJobTitle}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <label htmlFor="experienceLevel" className="block text-gray-900 font-bold mb-2">
                  Experience Level *
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
            </div>

            <div>
              <label htmlFor="skills" className="block text-gray-900 font-bold mb-2">
                Skills (comma-separated) *
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                placeholder="JavaScript, React, Node.js"
              />
            </div>

            {/* Conditional Auto Apply Section */}
            <div className={`rounded-lg p-6 ${targetCompanyId ? 'bg-gray-100' : 'bg-purple-50'}`}>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoApply"
                  name="autoApply"
                  checked={formData.autoApply}
                  onChange={handleChange}
                  disabled={!!targetCompanyId}
                  className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50"
                />
                <label htmlFor="autoApply" className={`font-bold ${targetCompanyId ? 'text-gray-500' : 'text-gray-900'}`}>
                  {targetCompanyId ? 'Direct Application' : 'Auto Apply to Matching Jobs'}
                </label>
              </div>
              <p className="text-gray-800 text-sm mt-2 ml-8">
                {targetCompanyId 
                  ? `You are applying directly to ${targetCompanyName || 'this company'}.` 
                  : "We'll automatically submit your resume to jobs matching your profile."}
              </p>
            </div>


            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transform transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                targetCompanyId ? "Submit Application" : "Submit Resume"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResumePortal() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-purple-900 flex items-center justify-center text-white">Loading...</div>}>
      <ResumePortalContent />
    </Suspense>
  );
}
