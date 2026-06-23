"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiUser, FiBriefcase } from "react-icons/fi";

const SelectTypePage = () => {
  const { data: session, update } = useSession();
  const router = useRouter();

  // If user already has a type, send them to home
  useEffect(() => {
    if (session?.user?.type) {
      router.push("/");
    }
  }, [session, router]);

  const handleSelectType = async (selectedType) => {
    try {
      const res = await fetch("/api/user/set-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType }),
      });

      if (res.ok) {
        // Force NextAuth to re-fetch the session so it grabs the new 'type'
        await update(); 
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to set type:", error);
    }
  };

  if (!session) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl font-extrabold mb-4 text-white">
          Welcome to <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">JobHunt</span>
        </h1>
        <p className="text-xl text-gray-400 mb-12">How do you want to use our platform?</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Candidate Card */}
          <div 
            onClick={() => handleSelectType("candidate")}
            className="group cursor-pointer bg-slate-900/50 rounded-2xl border border-purple-500/20 p-8 hover:border-purple-500/80 hover:bg-purple-900/20 transition-all duration-300 relative overflow-hidden flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FiUser className="text-4xl text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">I am a Candidate</h2>
            <p className="text-gray-400 text-center">I want to upload my resume, find perfectly matched jobs, and track my applications.</p>
          </div>

          {/* Employer Card */}
          <div 
            onClick={() => handleSelectType("employer")}
            className="group cursor-pointer bg-slate-900/50 rounded-2xl border border-pink-500/20 p-8 hover:border-pink-500/80 hover:bg-pink-900/20 transition-all duration-300 relative overflow-hidden flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FiBriefcase className="text-4xl text-pink-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">I am an Employer</h2>
            <p className="text-gray-400 text-center">I want to host jobs, discover top talent, and manage my job postings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectTypePage;