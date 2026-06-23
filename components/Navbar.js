'use client';

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
  const { data: session } = useSession()
  const userType = session?.user?.type; // "candidate" | "employer" | undefined

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const pathname = usePathname()
  const closeTimeoutRef = useRef(null)
  
  // Handle dropdown close with delay
  const handleDropdownLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    closeTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false)
    }, 3000) // 3 seconds
  }

  // Handle dropdown enter - clear timeout to keep it open
  const handleDropdownEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
  }
  
  // Function to determine if the link is active
  const isActive = (path) => {
    return pathname === path ? 'text-purple-400' : '';
  }

  return (
    <nav className="w-full bg-gradient-to-b from-black to-black/95 backdrop-blur-xl border-b border-purple-500/20 text-white sticky top-0 z-20 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center hover:scale-105 transition-transform duration-300">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Job</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Hunt</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            
            {/* Candidate-Only / Guest Links */}
            {(!userType || userType === "candidate") && (
              <>
                <Link href="/companies-portal" className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-purple-500/20 hover:text-purple-300 ${isActive('/companies-portal')} group relative`}>
                  Companies
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link href="/resume-portal" className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-purple-500/20 hover:text-purple-300 ${isActive('/resume-portal')} group relative`}>
                  Resume Portal
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link href="/dashboard" className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-purple-500/20 hover:text-purple-300 ${isActive('/dashboard')} group relative`}>
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </>
            )}

            {/* Employer-Only Links */}
            {userType === "employer" && (
              <>
                <Link href="/hosted-jobs" className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-purple-500/20 hover:text-purple-300 ${isActive('/hosted-jobs')} group relative`}>
                  My Hosted
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link href="/post-company" className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-purple-500/20 hover:text-purple-300 ${isActive('/post-company')} group relative`}>
                  Post Job
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </>
            )}

          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {session && <div className='relative group'>
              <div className='flex items-center cursor-pointer' onMouseEnter={() => { setDropdownOpen(true); handleDropdownEnter(); }} onMouseLeave={() => handleDropdownLeave()}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <Image src={session.user.image} alt="Profile" width={40} height={40} className="relative w-13 h-13 rounded-full mr-3 cursor-pointer ring-2 ring-purple-500/50 group-hover:ring-purple-400 transition-all duration-300 group-hover:scale-110 object-cover" onClick={() => setDropdownOpen(!dropdownOpen)} />
                </div>
                <button className=" px-4 py-2 text-sm font-medium text-gray-300 rounded-lg group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-all duration-300">
                  {session.user.email?.split('@')[0]}
                </button>
              </div>
              
              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-4 w-64 bg-gradient-to-br from-slate-950 via-slate-900/40 to-slate-950 border border-purple-500/40 rounded-2xl shadow-2xl z-30 animate-in fade-in slide-in-from-top-2 duration-300 origin-top-right backdrop-blur-xl overflow-hidden" onMouseEnter={() => handleDropdownEnter()} onMouseLeave={() => handleDropdownLeave()}>
                  {/* Header with user info */}
                  <div className="px-5 py-4 bg-gradient-to-r from-purple-900/40 to-transparent border-b border-purple-500/20">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Account ({userType || 'Guest'})</p>
                    <p className="text-sm text-gray-100 font-medium mt-1 truncate">{session.user.email}</p>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    {/* Candidate-Only Dropdown Item */}
                    {(!userType || userType === "candidate") && (
                      <Link href="/MyApplications" onClick={() => setDropdownOpen(false)} className="group/item flex items-center px-5 py-3 text-gray-200 hover:text-purple-300 transition-all duration-200 border-b border-purple-500/10 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-transparent relative overflow-hidden">
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-400 to-purple-600 transform origin-top scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300"></div>
                        <svg className="w-4 h-4 mr-3 flex-shrink-0 opacity-70 group-hover/item:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span className="text-sm font-medium">My Applications</span>
                        <span className="ml-auto text-xs text-gray-500 group-hover/item:text-purple-400 transition-colors">→</span>
                      </Link>
                    )}
                    {(!userType || userType === "employer") && (
                      <Link href="/hosted-jobs" onClick={() => setDropdownOpen(false)} className="group/item flex items-center px-5 py-3 text-gray-200 hover:text-purple-300 transition-all duration-200 border-b border-purple-500/10 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-transparent relative overflow-hidden">
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-400 to-purple-600 transform origin-top scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300"></div>
                        <svg className="w-4 h-4 mr-3 flex-shrink-0 opacity-70 group-hover/item:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span className="text-sm font-medium">My Hosted Jobs</span>
                        <span className="ml-auto text-xs text-gray-500 group-hover/item:text-purple-400 transition-colors">→</span>
                      </Link>
                    )}
                  </div>
                  
                  
                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
                  
                  {/* Sign Out Button */}
                  <button onClick={() => {signOut(); setDropdownOpen(false);}} className="group/item w-full flex items-center px-5 py-3 text-gray-200 hover:text-red-300 transition-all duration-200 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-transparent relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-400 to-red-600 transform origin-top scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300"></div>
                    <svg className="w-4 h-4 mr-3 flex-shrink-0 opacity-70 group-hover/item:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>}

            {!session && <Link href="/login" className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white rounded-lg shadow-lg hover:shadow-purple-500/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-black">
              Login
            </Link>}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-purple-500/20 transition-all duration-300 ring-1 ring-purple-500/20 hover:ring-purple-500/50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-purple-500/20 bg-gradient-to-b from-black to-black/95 backdrop-blur-lg" id="mobile-menu">
          <div className="px-4 pt-3 pb-4 space-y-2 sm:px-3">
            
            {/* Mobile Candidate / Guest Links */}
            {(!userType || userType === "candidate") && (
              <>
                <Link 
                  href="/companies-portal" 
                  className={`block px-4 py-3 text-base font-medium hover:bg-purple-500/20 hover:text-purple-300 rounded-lg transition-all duration-300 ${isActive('/companies-portal')}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Companies
                </Link>
                <Link 
                  href="/resume-portal" 
                  className={`block px-4 py-3 text-base font-medium hover:bg-purple-500/20 hover:text-purple-300 rounded-lg transition-all duration-300 ${isActive('/resume-portal')}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Resume Portal
                </Link>
                <Link 
                  href="/dashboard" 
                  className={`block px-4 py-3 text-base font-medium hover:bg-purple-500/20 hover:text-purple-300 rounded-lg transition-all duration-300 ${isActive('/dashboard')}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            )}

            {/* Mobile Employer Links */}
            {userType === "employer" && (
              <>
                <Link 
                  href="/hosted-jobs" 
                  className={`block px-4 py-3 text-base font-medium hover:bg-purple-500/20 hover:text-purple-300 rounded-lg transition-all duration-300 ${isActive('/hosted-jobs')}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Hosted
                </Link>
                <Link 
                  href="/post-company" 
                  className={`block px-4 py-3 text-base font-medium hover:bg-purple-500/20 hover:text-purple-300 rounded-lg transition-all duration-300 ${isActive('/post-company')}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Post Job
                </Link>
              </>
            )}
            
            <div className="pt-4 pb-2 border-t border-purple-500/20 flex flex-col space-y-3">
              {session && <div className='flex flex-col relative'>
                <div className="flex items-center mb-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-50"></div>
                    <Image src={session.user.image} alt="Profile" width={32} height={32} className="relative w-10 h-10 rounded-full mr-3 cursor-pointer ring-2 ring-purple-500/50 object-cover" onClick={() => setDropdownOpen(!dropdownOpen)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Account</p>
                    <p className="text-sm text-gray-200 font-medium truncate">{session.user.email?.split('@')[0]}</p>
                  </div>
                </div>
                {dropdownOpen && (
                  <div className="bg-gradient-to-br from-slate-950 via-slate-900/40 to-slate-950 border border-purple-500/30 rounded-xl shadow-lg backdrop-blur-xl overflow-hidden mb-3">
                    <div className="py-1">
                      
                      {/* Mobile Candidate Dropdown */}
                      {(!userType || userType === "candidate") && (
                        <Link href="/MyApplications" className="group/item flex items-center px-4 py-3 text-gray-200 hover:text-purple-300 transition-all duration-200 border-b border-purple-500/10 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-transparent relative overflow-hidden" onClick={() => {setIsMenuOpen(false); setDropdownOpen(false);}}>
                          <svg className="w-4 h-4 mr-3 flex-shrink-0 opacity-70 group-hover/item:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          <span className="text-sm font-medium">My Applications</span>
                        </Link>
                      )}

                      <div className="h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
                      <button onClick={() => {signOut(); setIsMenuOpen(false); setDropdownOpen(false);}} className="group/item w-full flex items-center px-4 py-3 text-gray-200 hover:text-red-300 transition-all duration-200 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-transparent relative overflow-hidden">
                        <svg className="w-4 h-4 mr-3 flex-shrink-0 opacity-70 group-hover/item:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>}
              
              {!session &&
              <Link 
                href="/login" 
                className="px-4 py-3 text-sm font-semibold bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white rounded-lg shadow-lg hover:shadow-purple-500/50 hover:shadow-2xl transition-all duration-300 text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar