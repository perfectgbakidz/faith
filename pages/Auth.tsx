import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Card } from '../components/ui';
import { BuildingIcon } from '../constants';

const LoginPage: React.FC = () => {
    const [identifier, setIdentifier] = useState('PMB-00001');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login({ identifier, password });
        } catch (err: any) {
            setError(err.message || 'Invalid credentials. Try one of the test accounts.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input id="identifier" type="text" label="User ID / Email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            <Input id="password" type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
                <p className="text-sm text-center text-gray-600">
                    Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Sign Up</Link>
                </p>
            </div>
        </form>
    );
};

const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [bvn, setBvn] = useState('');
    const [nin, setNin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await register({ name, email, phone, bvn, nin });
        } catch (err) {
            setError('Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" type="text" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input id="email" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input id="phone" type="tel" label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <Input id="bvn" type="text" label="Bank Verification Number (BVN)" value={bvn} onChange={(e) => setBvn(e.target.value)} required />
            <Input id="nin" type="text" label="National Identification Number (NIN)" value={nin} onChange={(e) => setNin(e.target.value)} required />
            <Input id="password" type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input id="confirmPassword" type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="space-y-4 pt-2">
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing up...' : 'Sign Up'}
                </Button>
                <p className="text-sm text-center text-gray-600">
                    Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Login</Link>
                </p>
            </div>
        </form>
    );
};

const TestCredentials: React.FC = () => (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg text-xs z-50">
        <h4 className="font-bold mb-2 border-b border-gray-600 pb-1">Test Credentials</h4>
        <ul className="space-y-1">
            <li><strong>Admin:</strong> <code className="bg-gray-700 px-1 rounded">admin@yahsalamuli.org</code></li>
            <li><strong>Officer:</strong> <code className="bg-gray-700 px-1 rounded">adebayo.adewale@yahsalamuli.org</code></li>
            <li><strong>Borrower:</strong> <code className="bg-gray-700 px-1 rounded">PMB-00001</code></li>
            <li className="pt-1"><strong>Password:</strong> <code className="bg-gray-700 px-1 rounded">password</code></li>
        </ul>
    </div>
);


const AuthPage: React.FC<{ isRegister?: boolean }> = ({ isRegister = false }) => {
    const location = useLocation();
    const effectiveIsRegister = isRegister || location.pathname === '/register';

    return (
        <div className="min-h-screen bg-light flex items-center justify-center p-4">
            <TestCredentials />
            <div className="max-w-md w-full">
                <div className="flex justify-center items-center mb-6">
                    <BuildingIcon className="w-12 h-12 text-primary" />
                    <h1 className="text-3xl font-bold ml-3 text-secondary">YAH SALAMULI ORG</h1>
                </div>
                <Card className="w-full">
                    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                        {effectiveIsRegister ? 'Sign Up for an Account' : 'Welcome Back'}
                    </h2>
                    {effectiveIsRegister ? <RegisterPage /> : <LoginPage />}
                </Card>
            </div>
        </div>
    );
};

export default AuthPage;