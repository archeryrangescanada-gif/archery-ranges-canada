'use client'

import { useState } from 'react';
import { X, Mail, Shield, AlertCircle, Loader2 } from 'lucide-react';

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('admin_employee');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch('/api/admin/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send invitation');
            }

            setSuccessMessage(`Invitation sent to ${email}`);
            setTimeout(() => {
                onSuccess();
                onClose();
                setEmail('');
                setRole('admin_employee');
                setSuccessMessage('');
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-emerald-600" />
                        Invite Team Member
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-lg flex items-start gap-2">
                            <Shield className="w-5 h-5 shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            placeholder="colleague@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            <label className={`relative flex items-start p-3 rounded-lg border cursor-pointer transition-all ${role === 'admin_employee' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-200'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="admin_employee"
                                    checked={role === 'admin_employee'}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                />
                                <div className="ml-3">
                                    <span className="block text-sm font-medium text-gray-900">Admin (Employee)</span>
                                    <span className="block text-xs text-gray-500 mt-1">Can manage content and users, but cannot change site settings or manage other admins.</span>
                                </div>
                            </label>

                            <label className={`relative flex items-start p-3 rounded-lg border cursor-pointer transition-all ${role === 'super_admin' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-200'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="super_admin"
                                    checked={role === 'super_admin'}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                />
                                <div className="ml-3">
                                    <span className="block text-sm font-medium text-gray-900">Super Admin</span>
                                    <span className="block text-xs text-gray-500 mt-1">Full access to everything, including billing and team management.</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending Invite...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4" />
                                    Send Invitation
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
