"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiCheckCircle, FiShare2, FiBell } from 'react-icons/fi';

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState({});

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // Fetch applications from backend
        const response = await fetch('/api/Myapplications', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }

        const data = await response.json();
        setApplications(data.applications || []);

        // Initialize notifications state for each application
        const notificationsState = {};
        data.applications?.forEach(app => {
          notificationsState[app.id] = app.emailNotifications || false;
        });
        setNotifications(notificationsState);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleNotificationToggle = (appId) => {
    setNotifications(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  const handleShare = (e, appId) => {
    e.preventDefault();
    // Share functionality placeholder
    console.log('Share application:', appId);
    alert("Share link copied to clipboard!");
  };

  // Group applications by applied date
  const groupedApplications = applications.reduce((groups, app) => {
    const appliedDate = app?.sentAt 
      ? new Date(app.sentAt)
      : app?.registeredOn && app.registeredOn !== 'N/A'
      ? new Date(app.registeredOn)
      : null;
    
    if (appliedDate && !Number.isNaN(appliedDate.getTime())) {
      // Use formatted date string as key for display
      const dateKey = appliedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = { date: appliedDate, apps: [] };
      }
      groups[dateKey].apps.push(app);
    } else {
      // Group items without valid dates under "Unknown Date"
      const unknownKey = 'Unknown Date';
      if (!groups[unknownKey]) {
        groups[unknownKey] = { date: new Date(0), apps: [] }; // Use epoch for sorting
      }
      groups[unknownKey].apps.push(app);
    }
    return groups;
  }, {});

  // Sort groups by date (most recent first)
  const sortedGroups = Object.entries(groupedApplications).sort(([, groupA], [, groupB]) => {
    return groupB.date - groupA.date;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-black/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400">Loading your applications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-black/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <p className="text-red-400">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold mb-4 text-white tracking-tight">
            My <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Applications</span>
          </h1>
          <p className="text-gray-400 text-lg">Track your job applications and matches</p>
        </div>

        {/* Applications Grid - Grouped by Date */}
        {applications.length === 0 ? (
          <div className="text-center py-20 ">
            <div className="inline-block p-4 bg-purple-500/10 rounded-full mb-4">
              <FiBell size={48} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Applications Yet</h3>
            <p className="text-gray-500">Your matched job applications will appear here</p>
            <Link href="/" className="mt-6 inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
              Browse Jobs
            </Link>
          </div>
        ) : (
          sortedGroups.map(([dateKey, groupData]) => (
            <div key={dateKey} className="mb-16">
              {/* Date Section Header */}
              <div className="mb-12 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-center text-gray-100">
                  {dateKey}
                </h2>
              </div>

              {/* Applications for this date */}
              <div className="grid grid-cols-1 gap-6">
                {groupData.apps.map((app) => (
                  // UPDATED: Linking to the companies-portal route as requested
                  <Link key={app.id} href={`/companies-portal/${app.companyId}`} className="block group ">
                    <div className=" bg-gradient-to-br from-slate-900/80 to-slate-900/40 rounded-2xl shadow-lg border border-purple-500/20 p-6 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 relative overflow-hidden h-full">
                      {/* Background Gradient Accent */}
                      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-600/10 to-transparent rounded-bl-full -z-0"></div>

                      {/* Top Section: Header */}
                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex gap-4 flex-1">
                          {/* Logo */}
                          <div className="bg-white/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4 text-2xl">
                            🏢
                          </div>

                          {/* Main Info */}
                          <div className="space-y-2 flex-1">
                            <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                              {app.role}
                            </h2>
                            <div className="text-lg font-medium text-purple-200">
                              {app.company}
                            </div>

                            <div className="text-sm text-gray-400 space-y-1">
                              <div>
                                Applied on:{' '}
                                <span className="text-gray-200 font-medium">
                                  {app?.sentAt
                                    ? new Date(app.sentAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                    : (app.registeredOn || 'N/A')}
                                </span>
                              </div>
                              <div>
                                By: <span className="text-gray-200 font-medium">{app.applicant}</span>
                              </div>
                            </div>

                            <div className="text-sm text-gray-400">
                              Deadline: <span className="font-semibold text-gray-200">{app.deadline}</span>
                              {app.status === "Closed" && (
                                <span className="ml-2 px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 font-semibold">
                                  Closed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Side: Notification Toggle */}
                        <div className="flex flex-col items-end gap-2 ml-4" onClick={(e) => e.preventDefault()}>
                          <button
                            onClick={() => handleNotificationToggle(app.id)}
                            className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 transition-colors ${notifications[app.id] ? "bg-gradient-to-r from-purple-600 to-purple-600" : "bg-gray-600"
                              }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${notifications[app.id] ? "translate-x-6" : ""
                                }`}
                            ></div>
                          </button>
                          <span className="text-xs text-gray-500 whitespace-nowrap">Notify</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0 my-4"></div>

                      {/* Bottom Section: Sustainability & Status */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                        {/* Left: Sustainability */}
                        <div className="flex items-center gap-4">
                          {/* Sustainability Badge */}
                          <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2.5 rounded-lg border border-emerald-500/30">
                            <div
                              className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-white text-sm ${app.sustainability?.class === 'A'
                                  ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                                  : 'bg-gradient-to-br from-lime-500 to-green-600'
                                }`}
                            >
                              {app.sustainability?.class || 'B'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-emerald-400 uppercase font-bold tracking-wider">Sustainability</span>
                              <span className="text-xs text-emerald-300 font-semibold">
                                Score: {app.sustainability?.score || 'N/A'}/100
                              </span>
                            </div>
                          </div>

                          {/* Application Steps */}
                          {app.steps && app.steps.length > 0 && (
                            <div className="flex items-center gap-2">
                              {app.steps.map((step, index) => (
                                <div key={index} className="flex flex-col items-center">
                                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs">
                                    <FiCheckCircle size={14} />
                                  </div>
                                  <span className="text-[10px] text-gray-500 mt-1 max-w-[50px] text-center leading-tight">
                                    {step.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            className="text-gray-500 hover:text-purple-400 transition-colors p-2 hover:bg-purple-500/10 rounded-lg"
                            onClick={(e) => handleShare(e, app.id)}
                          >
                            <FiShare2 size={18} />
                          </button>

                          <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30">
                            <FiCheckCircle size={16} />
                            <span className="text-sm capitalize">{app.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyApplicationsPage;