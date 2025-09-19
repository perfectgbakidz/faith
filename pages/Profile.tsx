import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Input, Button } from '../components/ui';
import { UserIcon } from '../constants';
import { apiUpdatePassword } from '../services/mockApi';

const calculateMembershipDuration = (joinDate: string): string => {
    const start = new Date(joinDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    
    if (months < 0 || (months === 0 && now.getDate() < start.getDate())) {
        years--;
        months = (months + 12) % 12;
    }
    
    if (now.getDate() < start.getDate()) {
        months--;
         if (months < 0) {
            years--;
            months += 12;
        }
    }
    
    if (years === 0 && months === 0) {
        return "New member";
    }

    const yearStr = years > 0 ? `${years} year${years > 1 ? 's' : ''}` : '';
    const monthStr = months > 0 ? `${months} month${months > 1 ? 's' : ''}` : '';
    
    return [yearStr, monthStr].filter(Boolean).join(', ');
};

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    // Personal info state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [bvn, setBvn] = useState(user?.bvn || '');
    const [nin, setNin] = useState(user?.nin || '');
    
    // Security state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Messaging state
    const [message, setMessage] = useState('');
    const [securityMessage, setSecurityMessage] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Profile updated successfully! (This is a demo)');
        setTimeout(() => setMessage(''), 3000);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setSecurityMessage('');
        if (newPassword !== confirmPassword) {
            setSecurityMessage('New passwords do not match.');
            return;
        }
        if (!user) return;

        try {
            await apiUpdatePassword(user.id, currentPassword, newPassword);
            setSecurityMessage('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setSecurityMessage('Failed to change password. Please try again.');
        } finally {
            setTimeout(() => setSecurityMessage(''), 3000);
        }
    };

    const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            // Simulate upload
            setTimeout(() => {
                setMessage('ID uploaded successfully! (This is a demo)');
                setUploading(false);
                setTimeout(() => setMessage(''), 3000);
            }, 1500);
        }
    };

    if (!user) {
        return <p>Loading user profile...</p>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-secondary mb-6">Profile & Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Personal Information">
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
                                <Input label="User ID" value={user.userIdNumber} readOnly disabled />
                                <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                                <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
                                <Input label="Bank Verification Number (BVN)" value={bvn} onChange={e => setBvn(e.target.value)} />
                                <Input label="National Identification Number (NIN)" value={nin} onChange={e => setNin(e.target.value)} />
                                <div className="md:col-span-2">
                                    <Input label="Member Since" value={`${new Date(user.createdAt).toLocaleDateString()} (${calculateMembershipDuration(user.createdAt)})`} readOnly disabled />
                                </div>
                            </div>
                            <Button type="submit">Update Profile</Button>
                        </form>
                    </Card>
                    <Card title="Security Settings">
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                                <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                                <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                            </div>
                            {securityMessage && <p className={`text-sm ${securityMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{securityMessage}</p>}
                            <Button type="submit">Change Password</Button>
                        </form>
                    </Card>
                </div>
                <div>
                    <Card title="Picture ID" icon={<UserIcon className="w-6 h-6" />}>
                        {user.pictureIdUrl ? (
                            <img src={user.pictureIdUrl} alt="User ID" className="rounded-md w-full" />
                        ) : (
                            <p className="text-sm text-gray-500 mb-4">No ID has been uploaded yet.</p>
                        )}
                        <div className="mt-4">
                            <label htmlFor="id-upload" className="w-full text-center px-4 py-2 rounded-md font-semibold text-white bg-secondary hover:bg-gray-700 focus:ring-gray-500 cursor-pointer block">
                                {uploading ? 'Uploading...' : 'Upload New ID'}
                            </label>
                            <input id="id-upload" type="file" className="hidden" onChange={handleIdUpload} disabled={uploading} accept="image/*,.pdf"/>
                        </div>
                    </Card>
                </div>
            </div>
             {message && <div className="mt-4 fixed bottom-4 right-4 p-3 rounded-md shadow-lg bg-green-100 text-green-800 transition-opacity duration-300">{message}</div>}
        </div>
    );
};

export default ProfilePage;