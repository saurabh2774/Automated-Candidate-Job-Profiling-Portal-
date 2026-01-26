"use client";

import { useState } from "react";

export default function PostCompany() {
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    location: "",
    skills: "",
    jobDescription: "",
    responsibilities: "",
    requirements: "",
    salary: "",
    duration: "",
    workMode: "Remote",
    schedule: "Full Time",
    applicationDeadline: "",
    eligibility: "",
    experienceLevel: "entry",
    email: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    // Convert skills string to array
    const skillsArray = formData.skills.split(",").map((skill) => skill.trim());

    try {
      const response = await fetch("/api/post-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.companyName,
          jobTitle: formData.jobTitle,
          location: formData.location,
          skills: skillsArray,
          jobDescription: formData.jobDescription,
          // New fields
          responsibilities: formData.responsibilities,
          requirements: formData.requirements,
          salary: formData.salary,
          duration: formData.duration,
          workMode: formData.workMode,
          schedule: formData.schedule,
          applicationDeadline: formData.applicationDeadline,
          eligibility: formData.eligibility,
          experienceLevel: formData.experienceLevel,
          email: formData.email,
        }),
      });

      if (!response.ok) {
        let errorMessage;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          errorMessage = errorData.message || "Failed to post job";
        } else {
          const errorText = await response.text();
          console.error("Server returned non-JSON error:", errorText);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      setSubmitSuccess(true);
      // Reset form
      setFormData({
        companyName: "",
        jobTitle: "",
        location: "",
        skills: "",
        jobDescription: "",
        responsibilities: "",
        requirements: "",
        salary: "",
        duration: "",
        workMode: "Remote",
        schedule: "Full Time",
        applicationDeadline: "",
        eligibility: "",
        experienceLevel: "entry",
        email: "",
      });
    } catch (error) {
      console.error("Error posting job:", error);
      setSubmitError(error.message || "Error posting job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-5xl font-extrabold mb-12 text-center text-white tracking-tight">
          Post a <span className="text-purple-400">Job</span>
        </h1>

        {submitSuccess ? (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-6 py-8 rounded-lg mb-8 shadow-lg backdrop-blur-sm text-center">
            <p className="font-bold text-2xl mb-4">Success!</p>
            <p className="mb-6 text-lg">Job posted successfully.</p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 font-bold"
            >
              Post Another Job
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white backdrop-blur-lg bg-opacity-90 shadow-2xl rounded-2xl p-8 space-y-8"
          >
            {submitError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                {submitError}
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-gray-900 font-bold mb-2"
                >
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label
                  htmlFor="jobTitle"
                  className="block text-gray-900 font-bold mb-2"
                >
                  Job Title *
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            {/* Location & Mode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label
                  htmlFor="location"
                  className="block text-gray-900 font-bold mb-2"
                >
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label
                  htmlFor="workMode"
                  className="block text-gray-900 font-bold mb-2"
                >
                  Work Mode
                </label>
                <select
                  id="workMode"
                  value={formData.workMode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                >
                  <option>Remote</option>
                  <option>In-Office</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="schedule"
                  className="block text-gray-900 font-bold mb-2"
                >
                  Schedule
                </label>
                <select
                  id="schedule"
                  value={formData.schedule}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                >
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Internship</option>
                </select>
              </div>
            </div>

            {/* Details */}
            <div>
              <label
                htmlFor="jobDescription"
                className="block text-gray-900 font-bold mb-2"
              >
                Short Description *
              </label>
              <textarea
                id="jobDescription"
                rows="3"
                value={formData.jobDescription}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                placeholder="Brief overview of the role..."
              />
            </div>

            <div>
              <label
                htmlFor="responsibilities"
                className="block text-gray-900 font-bold mb-2"
              >
                Responsibilities (Bullet points)
              </label>
              <textarea
                id="responsibilities"
                rows="5"
                value={formData.responsibilities}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                placeholder="- Build features..."
              />
            </div>

            <div>
              <label
                htmlFor="requirements"
                className="block text-gray-900 font-bold mb-2"
              >
                Requirements (Bullet points)
              </label>
              <textarea
                id="requirements"
                rows="5"
                value={formData.requirements}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                placeholder="- Experience with React..."
              />
            </div>

            {/* Logistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label
                  htmlFor="salary"
                  className="block text-gray-900 font-bold mb-2"
                >
                  Salary / Stipend
                </label>
                <input
                  type="text"
                  id="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                  placeholder="e.g. $1000/mo or Unpaid"
                />
              </div>
              <div>
                <label
                  htmlFor="duration"
                  className="block text-gray-900 font-bold mb-2"
                >
                  Duration
                </label>
                <input
                  type="text"
                  id="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                  placeholder="e.g. 3 Months or Permanent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label
                  htmlFor="applicationDeadline"
                  className="block text-gray-900 font-bold mb-2"
                >
                  Deadline
                </label>
                <input
                  type="date"
                  id="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                />
              </div>
              <div>
                <label
                  htmlFor="eligibility"
                  className="block text-gray-900 font-bold mb-2"
                >
                  Eligibility
                </label>
                <input
                  type="text"
                  id="eligibility"
                  value={formData.eligibility}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                  placeholder="e.g. CS Students, Graduates"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label
                  htmlFor="experienceLevel"
                  className="block text-gray-900 font-bold mb-2"
                >
                  Required Experience Level *
                </label>
                <select
                  id="experienceLevel"
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
                <label
                  htmlFor="skills"
                  className="block text-gray-900 font-bold mb-2"
                >
                  Skills for AI Matching (Comma separated) *
                </label>
                <input
                  type="text"
                  id="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                  placeholder="React, Node.js, Python"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-gray-900 font-bold mb-2"
              >
                HR Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900"
                placeholder="hr@company.com"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-4 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transform transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Publishing...
                </span>
              ) : (
                "Post Job"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}