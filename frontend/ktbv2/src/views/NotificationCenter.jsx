import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../axiosConfig';

const NotificationCenter = () => {
  const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PERSONAL');
    const [currentPage, setCurrentPage] = useState(1);
    const notificationsPerPage = 10;

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/notifications/');
            if (response.status === 200) {
                setNotifications(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.post(`/notifications/${id}/mark_read/`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/mark_all_read/');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const filteredNotifications = notifications.filter(n => n.notification_type === activeTab);
    
    // Pagination logic
    const indexOfLastNotification = currentPage * notificationsPerPage;
    const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
    const currentNotifications = filteredNotifications.slice(indexOfFirstNotification, indexOfLastNotification);
    const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Notification Center</h3>
                            <p className="mt-1 text-sm leading-5 text-gray-500">
                                View and manage all your alerts and messages here.
                            </p>
                        </div>
                        <div className="mt-4 flex sm:mt-0 sm:ml-4">
                            <button
                                onClick={markAllAsRead}
                                className="order-0 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 active:bg-blue-200 transition duration-150 ease-in-out sm:order-1"
                            >
                                Mark All as Read
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex px-6" aria-label="Tabs">
                            <button
                                onClick={() => { setActiveTab('PERSONAL'); setCurrentPage(1); }}
                                className={`${activeTab === 'PERSONAL' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none flex-1 text-center transition-colors duration-150`}
                            >
                                Personal
                                {notifications.filter(n => n.notification_type === 'PERSONAL' && !n.is_read).length > 0 && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {notifications.filter(n => n.notification_type === 'PERSONAL' && !n.is_read).length}
                                    </span>
                                )}
                            </button>
                            {/* <button
                                onClick={() => { setActiveTab('GENERAL'); setCurrentPage(1); }}
                                className={`${activeTab === 'GENERAL' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none flex-1 text-center transition-colors duration-150`}
                            >
                                General
                                {notifications.filter(n => n.notification_type === 'GENERAL' && !n.is_read).length > 0 && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {notifications.filter(n => n.notification_type === 'GENERAL' && !n.is_read).length}
                                    </span>
                                )}
                            </button> */}
                        </nav>
                    </div>

                    {/* Notification List */}
                    <div className="bg-white min-h-[400px]">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : currentNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <svg className="h-12 w-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p>No notifications found in this tab.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {currentNotifications.map((notification) => (
                                    <li 
                                        key={notification.id} 
                                        className={`p-6 transition-colors duration-150 hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {!notification.is_read && (
                                                    <span className="h-2.5 w-2.5 bg-blue-600 rounded-full" aria-hidden="true"></span>
                                                )}
                                                <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.verb}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                {notification.email_sent ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Email Sent
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        Email Not Sent
                                                    </span>
                                                )}
                                                {!notification.is_read && (
                                                    <button 
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Mark as Read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600 ml-[22px]">
                                            <p>{notification.message}</p>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 ml-[22px]">
                                            <div className="flex items-center gap-2">
                                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                {notification.actor?.name || 'System'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {new Date(notification.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{indexOfFirstNotification + 1}</span> to <span className="font-medium">{Math.min(indexOfLastNotification, filteredNotifications.length)}</span> of <span className="font-medium">{filteredNotifications.length}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {/* Simple page indicators */}
                                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
