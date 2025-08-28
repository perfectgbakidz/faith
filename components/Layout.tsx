
import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SIDENAV_LINKS, LogOutIcon, BuildingIcon } from '../constants';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    if (!user) return null;

    const links = SIDENAV_LINKS[user.role];

    return (
        <aside className="w-64 flex-shrink-0 bg-secondary text-light flex flex-col">
            <div className="h-16 flex items-center justify-center px-4 border-b border-gray-700">
                <BuildingIcon className="w-8 h-8 text-primary-400" />
                <h1 className="text-xl font-bold ml-2">Perfect Bank</h1>
            </div>
            <nav className="flex-grow px-2 py-4">
                {links.map(link => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2 my-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                            isActive ? 'bg-primary text-white' : 'hover:bg-primary-900 hover:text-white'
                            }`
                        }
                    >
                        <span className="mr-3">{link.icon}</span>
                        {link.name}
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm font-medium rounded-md hover:bg-primary-900 hover:text-white transition-colors duration-200"
                >
                    <LogOutIcon className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white shadow-md flex items-center justify-between px-6">
             <button onClick={onMenuClick} className="text-gray-600 md:hidden">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div className="text-lg font-semibold text-secondary">
                Welcome, {user?.name}
            </div>
            <div className="text-sm text-gray-500">
                Role: <span className="font-medium text-primary">{user?.role.replace('_', ' ')}</span>
            </div>
        </header>
    );
};

const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-light">
            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="relative flex-1 flex flex-col max-w-xs w-full">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button onClick={() => setSidebarOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                            <span className="sr-only">Close sidebar</span>
                            <svg className="h-6 w-6 text-white" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <Sidebar />
                </div>
                <div className="flex-shrink-0 w-14" onClick={() => setSidebarOpen(false)} aria-hidden="true"></div>
            </div>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex">
                <Sidebar />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light">
                    <div className="container mx-auto px-6 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
