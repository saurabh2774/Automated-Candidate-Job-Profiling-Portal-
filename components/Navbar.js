'use client';

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react';


const Navbar = () => {
  
  const {data: session} = useSession()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Function to determine if the link is active
  const isActive = (path) => {
    return pathname === path ? 'text-purple-400' : '';
  }

  // if(session){
  //   return <>
  //   signout in as {session.user.email}<br/>
  //   <button onClick={() => signOut()}>Sign out</button>
  //   </>
  // }

  return (
    <nav className="w-full bg-black text-white sticky top-0 z-10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-white mr-2">Job</span>
              <span className="text-2xl font-bold text-purple-400">Hunt</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-10">
            <Link href="/companies-portal" className={`text-lg hover:text-purple-400 transition-colors ${isActive('/companies-portal')}`}>
              Companies
            </Link>
            <Link href="/resume-portal" className={`text-lg hover:text-purple-400 transition-colors ${isActive('/resume-portal')}`}>
              Resume Portal
            </Link>
            <Link href="/dashboard" className={`text-lg hover:text-purple-400 transition-colors ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {session && <div className='flex items-center'> 
              <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full mr-2" />
              <button  className="px-4 py-2 text-lg  text-white rounded hover:bg-slate-900 transition-colors" >
              {session.user.email}
            </button></div>}
            {session && <button onClick={()=>{signOut()}} className="px-4 py-2 text-lg bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors" >
              Sign Out
            </button>}

            {!session && <Link href="/login" className="px-4 py-2 text-lg bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors" >
              Login
            </Link>}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-3 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3 border-t border-gray-800">
            <Link 
              href="/companies-portal" 
              className={`block px-4 py-3 text-lg hover:bg-gray-800 hover:text-purple-400 rounded-md ${isActive('/companies-portal')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Companies
            </Link>
            <Link 
              href="/resume-portal" 
              className={`block px-4 py-3 text-lg hover:bg-gray-800 hover:text-purple-400 rounded-md ${isActive('/resume-portal')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Resume Portal
            </Link>
            <Link 
              href="/dashboard" 
              className={`block px-4 py-3 text-lg hover:bg-gray-800 hover:text-purple-400 rounded-md ${isActive('/dashboard')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            
            <div className="pt-4 pb-2 border-t border-gray-800 flex flex-col space-y-2">
              {session && <div className='flex items-center'>
                <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full mr-2" />
              <button
                
                className="px-4 py-3 text-lg bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors mx-3"
                onClick={() => {signOut}}
              >
                Sign Out
              </button></div>}
              
              {!session &&
              <Link 
                href="/login" 
                className="px-4 py-3 text-lg bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors mx-3"
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
