'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AvatarUpload from '@/components/AvatarUpload';
import { LogOut, Trash2, Key, AlertTriangle } from 'lucide-react';

interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email?: string;
}

export default function SettingsPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');

    // Password state
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setProfile({ ...data, email: user.email });
                setFullName(data.full_name || '');
            }
            setLoading(false);
        }

        getProfile();
    }, [supabase, router]);

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        if (!profile) return;

        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', profile.id);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            window.location.reload();
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Error updating profile.' });
        } finally {
            setSaving(false);
        }
    }

    async function handleAvatarUpload(url: string) {
        if (!profile) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ avatar_url: url })
                .eq('id', profile.id);

            if (error) throw error;
            // Refresh profile data locally
            setProfile({ ...profile, avatar_url: url });
        } catch (error) {
            console.error('Error updating avatar:', error);
        }
    }

    async function handleUpdatePassword(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setPasswordMessage({ type: 'success', text: 'Password updated successfully' });
            setPassword('');
            setConfirmPassword('');
            setShowPassword(false);
        } catch (error: any) {
            setPasswordMessage({ type: 'error', text: error.message });
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const handleDeleteAccount = async () => {
        if (confirm("Are you sure? This action cannot be undone. All your data will be permanently deleted.")) {
            // In a real app we'd call an admin function or verify password again
            // For now, let's assume we can't easily self-delete via client SDK without special RPC or config
            // We'll mostly just sign out for MVP or show an alert that this requires support
            alert("Please contact support to delete your account permanently.");
        }
    };

    if (loading) return (
        <>
            <Header />
            <div className="p-8 text-center bg-stone-50 min-h-screen pt-20">Loading...</div>
            <Footer />
        </>
    );

    return (
        <>
        <Header />
        <div className="min-h-screen bg-stone-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="text-3xl font-bold text-stone-900 mb-8">Account Settings</h1>

                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8">
                        <div className="flex flex-col items-center mb-8">
                            {profile && (
                                <AvatarUpload
                                    uid={profile.id}
                                    url={profile.avatar_url}
                                    onUpload={handleAvatarUpload}
                                />
                            )}
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 mb-2">
                                    Display Name
                                </label>
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    placeholder="Your Name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    value={profile?.email || ''}
                                    disabled
                                    className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-stone-400 mt-1">Contact support to change your email address.</p>
                            </div>

                            {message && (
                                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="pt-4 border-t border-stone-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Password Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-stone-900">Password</h2>
                            {!showPassword && (
                                <button
                                    onClick={() => setShowPassword(true)}
                                    className="text-emerald-600 font-medium hover:underline text-sm"
                                >
                                    Change Password
                                </button>
                            )}
                        </div>

                        {showPassword && (
                            <form onSubmit={handleUpdatePassword} className="space-y-4 animate-in slide-in-from-top-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>

                                {passwordMessage && (
                                    <div className={`p-3 rounded-lg text-sm ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {passwordMessage.text}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(false)}
                                        className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8">
                        <h2 className="text-lg font-bold text-red-700 mb-6 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Danger Zone
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-red-900">Sign Out</h3>
                                    <p className="text-red-700/80 text-sm">Sign out of your account on this device</p>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium"
                                >
                                    <LogOut className="w-4 h-4 inline-block mr-2" />
                                    Sign Out
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                                <div>
                                    <h3 className="font-semibold text-red-900">Delete Account</h3>
                                    <p className="text-red-700/80 text-sm">Permanently delete your account and all data</p>
                                </div>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    <Trash2 className="w-4 h-4 inline-block mr-2" />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        </>
    );
}
