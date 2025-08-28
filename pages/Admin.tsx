
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { apiGetAllLoans, apiGetAllSmsLogs, apiGetAllUsers, apiAdminCreateUser, apiAdminDeleteUser, apiAdminToggleFreezeUser, apiAdminSendBulkSms } from '../services/mockApi';
import { Loan, User, SmsLog, LoanStatus, Role } from '../types';
import { Card, Table, Badge, Button, Modal, Input, Select } from '../components/ui';
import { UsersIcon, BanknoteIcon, MessageSquareIcon } from '../constants';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ users: 0, loans: 0, sms: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const users = await apiGetAllUsers();
            const loans = await apiGetAllLoans();
            const smsLogs = await apiGetAllSmsLogs();
            setStats({
                users: users.length,
                loans: loans.length,
                sms: smsLogs.length,
            });
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h2 className="text-3xl font-bold text-secondary mb-6">Admin Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Total Users" icon={<UsersIcon className="w-6 h-6" />}>
                    <p className="text-3xl font-bold text-primary">{stats.users}</p>
                </Card>
                <Card title="Total Loans" icon={<BanknoteIcon className="w-6 h-6" />}>
                    <p className="text-3xl font-bold text-primary">{stats.loans}</p>
                </Card>
                <Card title="SMS Sent" icon={<MessageSquareIcon className="w-6 h-6" />}>
                    <p className="text-3xl font-bold text-primary">{stats.sms}</p>
                </Card>
            </div>
        </div>
    );
};

const AddUserModal: React.FC<{ isOpen: boolean; onClose: () => void; onUserAdded: (newUser: User) => void; }> = ({ isOpen, onClose, onUserAdded }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const newUser = await apiAdminCreateUser({ name, email, phone, role: Role.LOAN_OFFICER });
            onUserAdded(newUser);
            onClose();
            // Reset form
            setName(''); setEmail(''); setPhone(''); setPassword('');
        } catch (err: any) {
            setError(err.message || 'Failed to create user.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Loan Officer">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
                <Input label="Initial Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="User will be prompted to change this" />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex justify-end space-x-3 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add User'}</Button>
                </div>
            </form>
        </Modal>
    );
};


const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = async () => {
        const allUsers = await apiGetAllUsers();
        setUsers(allUsers);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleFreeze = async (userId: string) => {
        const updatedUser = await apiAdminToggleFreezeUser(userId);
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await apiAdminDeleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        }
    };

    const columns: Array<{ header: string; accessor: keyof User | ((item: User) => React.ReactNode) }> = [
        { header: 'User ID', accessor: 'userIdNumber' },
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', accessor: (item: User) => <Badge color={item.role === Role.ADMIN ? 'red' : item.role === Role.LOAN_OFFICER ? 'blue' : 'gray'}>{item.role.replace('_', ' ')}</Badge> },
        { header: 'Status', accessor: (item: User) => item.isFrozen ? <Badge color="orange">Frozen</Badge> : <Badge color="green">Active</Badge> },
        {
            header: 'Actions',
            accessor: (item: User) => (
                <div className="space-x-2">
                    <Button 
                        variant={item.isFrozen ? 'success' : 'secondary'} 
                        className="py-1 px-3 text-sm" 
                        onClick={() => handleToggleFreeze(item.id)}
                        disabled={item.role === Role.ADMIN}
                    >
                        {item.isFrozen ? 'Unfreeze' : 'Freeze'}
                    </Button>
                    <Button 
                        variant="danger" 
                        className="py-1 px-3 text-sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={item.role === Role.ADMIN}
                    >
                        Delete
                    </Button>
                </div>
            )
        }
    ];

    return (
        <>
            <AddUserModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUserAdded={(newUser) => setUsers([...users, newUser])}
            />
            <Card title="User Management">
                <div className="flex justify-end mb-4">
                    <Button onClick={() => setIsModalOpen(true)}>Add Loan Officer</Button>
                </div>
                <Table columns={columns} data={users} />
            </Card>
        </>
    );
};

const LoanOversight: React.FC = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
    const [filter, setFilter] = useState<LoanStatus | 'ALL'>('ALL');

    useEffect(() => {
        const fetchLoans = async () => {
            const allLoans = await apiGetAllLoans();
            setLoans(allLoans);
            setFilteredLoans(allLoans);
        };
        fetchLoans();
    }, []);
    
    useEffect(() => {
        if (filter === 'ALL') {
            setFilteredLoans(loans);
        } else {
            setFilteredLoans(loans.filter(loan => loan.status === filter));
        }
    }, [filter, loans]);

    const columns: Array<{ header: string; accessor: keyof Loan | ((item: Loan) => React.ReactNode) }> = [
        { header: 'Borrower', accessor: 'userName' },
        { header: 'Amount', accessor: (item: Loan) => `₦${item.amount.toLocaleString()}` },
        { header: 'Applied On', accessor: (item: Loan) => new Date(item.applicationDate).toLocaleDateString() },
        { header: 'Status', accessor: (item: Loan) => {
            const colorMap: { [key in LoanStatus]: 'green' | 'yellow' | 'red' | 'gray' } = {
                [LoanStatus.APPROVED]: 'green',
                [LoanStatus.PENDING]: 'yellow',
                [LoanStatus.REJECTED]: 'red',
                [LoanStatus.COMPLETED]: 'gray',
            };
            return <Badge color={colorMap[item.status]}>{item.status}</Badge>
        }},
    ];

    const filterButtons: Array<{ status: LoanStatus | 'ALL', label: string }> = [
        { status: 'ALL', label: 'All' },
        { status: LoanStatus.PENDING, label: 'Pending' },
        { status: LoanStatus.APPROVED, label: 'Approved' },
        { status: LoanStatus.REJECTED, label: 'Rejected' },
        { status: LoanStatus.COMPLETED, label: 'Completed' },
    ];

    return (
        <Card title="Loan Oversight">
            <div className="flex space-x-2 mb-4">
                {filterButtons.map(btn => (
                     <button 
                        key={btn.status} 
                        onClick={() => setFilter(btn.status)}
                        className={`px-3 py-1 text-sm rounded-md ${filter === btn.status ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                     >
                         {btn.label}
                     </button>
                ))}
            </div>
            <Table columns={columns} data={filteredLoans} />
        </Card>
    );
};

const SmsManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState('send');
    const [logs, setLogs] = useState<SmsLog[]>([]);
    const [borrowers, setBorrowers] = useState<User[]>([]);
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState('');

    const fetchLogs = async () => {
        const allLogs = await apiGetAllSmsLogs();
        setLogs(allLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

    useEffect(() => {
        const fetchData = async () => {
            const allUsers = await apiGetAllUsers();
            setBorrowers(allUsers.filter(u => u.role === Role.BORROWER));
            await fetchLogs();
        };
        fetchData();
    }, []);

    const handleRecipientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedRecipients(options);
    };

    const handleSubmit = async (isScheduled: boolean) => {
        if (selectedRecipients.length === 0 || !message) {
            setFeedback('Please select at least one recipient and write a message.');
            return;
        }
        if (isScheduled && !scheduleDate) {
            setFeedback('Please select a date and time for scheduled messages.');
            return;
        }

        setIsSubmitting(true);
        setFeedback('');
        try {
            await apiAdminSendBulkSms({
                recipientIds: selectedRecipients,
                message,
                scheduleDate: isScheduled ? new Date(scheduleDate).toISOString() : undefined,
            });
            setFeedback('Message sent/scheduled successfully!');
            setSelectedRecipients([]);
            setMessage('');
            setScheduleDate('');
            if (activeTab === 'logs') {
                await fetchLogs();
            }
        } catch (error) {
            setFeedback('Failed to send message.');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setFeedback(''), 4000);
        }
    };
    
    const columns: Array<{ header: string; accessor: keyof SmsLog | ((item: SmsLog) => React.ReactNode) }> = [
        { header: 'Borrower', accessor: 'borrowerName' },
        { header: 'Message', accessor: 'message' },
        { header: 'Date', accessor: (item: SmsLog) => new Date(item.date).toLocaleString() },
        { header: 'Status', accessor: (item: SmsLog) => {
            const colorMap: { [key in SmsLog['status']]: 'green' | 'red' | 'blue' } = {
                'SENT': 'green',
                'FAILED': 'red',
                'SCHEDULED': 'blue'
            };
            return <Badge color={colorMap[item.status]}>{item.status}</Badge>
        }},
    ];

    return (
        <Card title="SMS Management">
            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('send')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'send' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Send & Schedule</button>
                    <button onClick={() => { setActiveTab('logs'); fetchLogs(); }} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Message Logs</button>
                </nav>
            </div>

            {activeTab === 'send' && (
                <div className="space-y-4">
                     <div>
                        <label htmlFor="recipients" className="block text-sm font-medium text-gray-700">Recipients (hold Ctrl/Cmd to select multiple)</label>
                        <select
                            id="recipients"
                            multiple
                            value={selectedRecipients}
                            onChange={handleRecipientChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md h-40"
                        >
                            {borrowers.map(b => <option key={b.id} value={b.id}>{b.name} ({b.userIdNumber})</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                        <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required></textarea>
                     </div>
                     <div>
                        <Input label="Schedule for later (optional)" type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                     </div>
                     {feedback && <p className={`text-sm ${feedback.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>}
                     <div className="flex space-x-3">
                        <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Now'}</Button>
                        <Button onClick={() => handleSubmit(true)} disabled={isSubmitting} variant="secondary">{isSubmitting ? 'Scheduling...' : 'Schedule SMS'}</Button>
                     </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <Table columns={columns} data={logs} />
            )}
        </Card>
    );
};


const AdminPage: React.FC = () => {
    return (
        <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="loans" element={<LoanOversight />} />
            <Route path="sms-management" element={<SmsManagement />} />
        </Routes>
    );
}

export default AdminPage;
