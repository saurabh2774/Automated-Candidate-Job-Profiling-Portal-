"use client";

import { useState } from "react";

// Add retry utility
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 1) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

export default function ResumePortal() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    desiredJobTitle: "",
    skills: "",
    experienceLevel: "entry",
    autoApply: false,
    resume: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
          // Ensure skills are properly formatted
          formDataToSend.append(key, formData[key].trim());
        } else if (key === 'autoApply') {
          // Convert boolean to string
          formDataToSend.append(key, formData[key].toString());
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      const makeRequest = async () => {
        const response = await fetch('/api/resume-upload', {
          method: 'POST',
          body: formDataToSend,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to submit application');
        }

        return response;
      };

      const response = await retryRequest(makeRequest);
      const data = await response.json();
      
      if (data.success) {
        console.log("Form submitted successfully");
        setSubmitSuccess(true);
        
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          desiredJobTitle: "",
          skills: "",
          experienceLevel: "entry",
          autoApply: false,
          resume: null,
        });
      } else {
        throw new Error(data.message || 'Failed to submit application');
      }
      
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-white">Resume Portal</h1>
      
      {submitSuccess ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Success!</p>
          <p>Your resume has been submitted successfully.</p>
          <button 
            onClick={() => setSubmitSuccess(false)}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Submit Another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8">
          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {submitError}
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="fullName" className="block text-gray-700 font-bold mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="John Doe"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="johndoe@example.com"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="desiredJobTitle" className="block text-gray-700 font-bold mb-2">
              Desired Job Title *
            </label>
            <input
              type="text"
              id="desiredJobTitle"
              name="desiredJobTitle"
              value={formData.desiredJobTitle}
              onChange={handleChange}
              required
              className="appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Software Engineer"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="skills" className="block text-gray-700 font-bold mb-2">
              Skills (comma-separated) *
            </label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              required
              className="appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="JavaScript, React, Node.js"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="experienceLevel" className="block text-gray-700 font-bold mb-2">
              Experience Level *
            </label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              required
              className="appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="executive">Executive Level</option>
            </select>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoApply"
                name="autoApply"
                checked={formData.autoApply}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600"
              />
              <label htmlFor="autoApply" className="ml-2 block text-gray-700 font-bold">
                Auto Apply to Matching Jobs
              </label>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              We'll automatically submit your resume to jobs matching your profile.
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="resume" className="block text-gray-700 font-bold mb-2">
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
                className="cursor-pointer flex items-center justify-center border-2 border-dashed border-purple-300 rounded-lg p-6 hover:border-purple-500 transition-colors"
              >
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-purple-400"
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
                  <p className="mt-1 text-sm text-gray-600">
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
            {submitError && (
              <p className="text-red-500 text-sm mt-2">{submitError}</p>
            )}
          </div>
          
          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline w-full transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit Resume"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}