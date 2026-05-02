import React, { useState, useEffect, useRef } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const fetchUnreadNotifications = async () => {
        try {
            const response = await axios.get('/notifications/unread/');
            if (response.status === 200) {
                setNotifications(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchUnreadNotifications();

        // Start polling every 30 seconds
        const intervalId = setInterval(fetchUnreadNotifications, 30000);

        return () => clearInterval(intervalId); // Cleanup
    }, []);

    const markAsRead = async (id, target_url) => {
        try {
            await axios.post(`/notifications/${id}/mark_read/`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            
            if (target_url) {
                setIsOpen(false);
                navigate(target_url);
            }
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/mark_all_read/');
            setNotifications([]);
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
                {/* Bell Icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none z-50">
                    <div className="px-4 py-3 flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <p className="text-sm leading-5 font-medium text-gray-900">Notifications</p>
                        {notifications.length > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800">
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                No new notifications
                            </div>
                        ) : (
                            <ul className="flex flex-col">
                                {notifications.map(notification => (
                                    <li 
                                        key={notification.id} 
                                        onClick={() => markAsRead(notification.id, notification.target_url)}
                                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${notification.notification_type === 'PERSONAL' ? 'border-l-4 border-blue-500' : ''}`}
                                    >
                                        <p className="text-sm font-semibold text-gray-800">{notification.verb}</p>
                                        <p className="text-sm text-gray-600 truncate">{notification.message}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {notification.actor?.name || 'System'} • {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div 
                        onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                        className="px-4 py-3 bg-gray-50 text-center text-sm font-medium text-blue-600 hover:text-blue-800 rounded-b-lg border-t border-gray-100 cursor-pointer"
                    >
                        View All Notifications
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
