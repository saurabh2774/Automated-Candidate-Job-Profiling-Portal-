"use client"

import React, { useEffect } from 'react'
import Link from 'next/link'

const HomePage = () => {


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 mb-6">
          Find Your Dream Job Today
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Upload your resume and let our Algorithm match you with the perfect opportunities. Smart job hunting made simple.
        </p>
        <Link 
          href="/resume-portal" 
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
        >
          Upload Your Resume
        </Link>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <div className="text-purple-500 text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host A Job Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">Host  A  Job</h2>
          <p className="text-xl text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Ready to find the perfect candidate? Follow these simple steps to post your job and connect with talented professionals.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {hostingSteps.map((step, index) => (
              <div key={index} className="p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors relative">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {index + 1}
                </div>
                <div className="text-purple-500 text-4xl mb-4 mt-2">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link 
              href="/post-company" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors inline-block"
            >
              Start Posting Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join Today AND Found Your Perfectly Matched Job Through Our Platform.
          </p>
          <Link 
            href="/resume-portal" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors inline-block"
          >
            Get Started For Free
          </Link>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: "📄",
    title: "Upload Resume",
    description: "Simply upload your resume and let our Algorithm analyze your skills and experience."
  },
  {
    icon: "🎯",
    title: "Smart Matching",
    description: "Our advanced algorithms match you with the most relevant job opportunities."
  },
  {
    icon: "🚀",
    title: "Apply with Ease",
    description: "Apply to multiple positions with a single click and track your applications."
  }
]

const hostingSteps = [
  {
    icon: "🏢",
    title: "Go to Companies",
    description: "Navigate to the companies section to access job posting features."
  },
  {
    icon: "📋",
    title: "Click Post a Job",
    description: "Click on the 'Post a Job' button to start creating your job listing."
  },
  {
    icon: "✍️",
    title: "Fill & Submit Form",
    description: "Complete the job posting form with all required details and submit to host your job."
  }
]


export default HomePage
