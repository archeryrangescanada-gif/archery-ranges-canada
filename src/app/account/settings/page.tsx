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
    first_name: string | null;
    last_name: string | null;
    gender: string | null;
    bow_types: string[] | null;
    experience_level: string | null;
    shooting_styles: string[] | null;
    avatar_url: string | null;
    email?: string;
}

const BOW_OPTIONS = ['Compound', 'Recurve', 'Longbow', 'Crossbow', 'Barebow', 'Olympic Recurve'];
const STYLE_OPTIONS = ['Target', '3D', 'Hunter', 'Field', 'Recreational'];
const EXP_OPTIONS = ['Beginner', '1-3 years', '4-10 years', '10+ years'];

export default function SettingsPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState('');
    const [bowTypes, setBowTypes] = useState<string[]>([]);
    const [experience, setExperience] = useState('');
    const [shootingStyles, setShootingStyles] = useState<string[]>([]);

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
                setFirstName(data.first_name || '');
                setLastName(data.last_name || '');
                setGender(data.gender || '');
                setBowTypes(Array.isArray(data.bow_types) ? data.bow_types : []);
                setExperience(data.experience_level || '');
                setShootingStyles(Array.isArray(data.shooting_styles) ? data.shooting_styles : []);
            }
            setLoading(false);
        }

        getProfile();
    }, [supabase, router]);

    const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, array: string[], item: string) => {
        if (array.includes(item)) {
            setter(array.filter(i => i !== item));
        } else {
            setter([...array, item]);
        }
    };

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        if (!profile) return;

        setSaving(true);
        setMessage(null);

        try {
            const fullName = [firstName, lastName].filter(Boolean).join(' ');
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    first_name: firstName,
                    last_name: lastName,
                    full_name: fullName, 
                    gender: gender,
                    bow_types: bowTypes,
                    experience_level: experience,
                    shooting_styles: shootingStyles
                })
                .eq('id', profile.id);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="min-h-screen bg-stone-50 py-12 pt-24">
            <div className="container mx-auto px-4 max-w-3xl">
                <h1 className="text-3xl font-bold text-stone-900 mb-8">My Profile Settings</h1>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg font-medium shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Archery Profile Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
                        <div className="flex flex-col items-center mb-10 pb-10 border-b border-stone-100">
                            <h2 className="text-lg font-semibold text-stone-800 mb-6 self-start w-full">Profile Photo</h2>
                            {profile && (
                                <AvatarUpload
                                    uid={profile.id}
                                    url={profile.avatar_url}
                                    onUpload={handleAvatarUpload}
                                />
                            )}
                            <p className="text-sm text-stone-500 mt-4 text-center">Upload a photo of yourself or your bow! <br/>This will be visible on reviews or empty event slots you sign up for.</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-8">
                            
                            <div>
                                <h2 className="text-lg font-semibold text-stone-800 border-b border-stone-100 pb-2 mb-6">Personal Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-stone-700 mb-2">First Name</label>
                                        <input
                                            id="firstName"
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
                                            placeholder="Jane"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-stone-700 mb-2">Last Name</label>
                                        <input
                                            id="lastName"
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
                                            placeholder="Doe"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="gender" className="block text-sm font-medium text-stone-700 mb-2">Gender</label>
                                        <select
                                            id="gender"
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Non-binary">Non-binary</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">Account Email</label>
                                        <input
                                            type="text"
                                            value={profile?.email || ''}
                                            disabled
                                            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-stone-800 border-b border-stone-100 pb-2 mb-6 mt-8">Archery Experience</h2>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-3">What type of bows do you shoot? (Select all that apply)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {BOW_OPTIONS.map(bow => (
                                                <button
                                                    key={bow}
                                                    type="button"
                                                    onClick={() => toggleArrayItem(setBowTypes, bowTypes, bow)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                                                        bowTypes.includes(bow) 
                                                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200' 
                                                        : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-50'
                                                    }`}
                                                >
                                                    {bow}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-3">What are your primary shooting styles?</label>
                                        <div className="flex flex-wrap gap-2">
                                            {STYLE_OPTIONS.map(style => (
                                                <button
                                                    key={style}
                                                    type="button"
                                                    onClick={() => toggleArrayItem(setShootingStyles, shootingStyles, style)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                                                        shootingStyles.includes(style) 
                                                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200' 
                                                        : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-50'
                                                    }`}
                                                >
                                                    {style}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-3">How long have you been shooting?</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {EXP_OPTIONS.map(exp => (
                                                <button
                                                    key={exp}
                                                    type="button"
                                                    onClick={() => setExperience(exp)}
                                                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border text-center ${
                                                        experience === exp 
                                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                                                        : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                                                    }`}
                                                >
                                                    {exp}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-stone-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 text-lg w-full sm:w-auto"
                                >
                                    {saving ? 'Saving Profile...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                                <Key className="w-5 h-5 text-stone-500" />
                                Password & Security
                            </h2>
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
                                        className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                {passwordMessage && (
                                    <div className={`p-3 rounded-lg text-sm ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        {passwordMessage.text}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(false)}
                                        className="px-5 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors font-medium border border-transparent"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
                        <h2 className="text-lg font-bold text-red-700 mb-6 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Danger Zone
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-red-50/50 rounded-xl border border-red-100">
                                <div>
                                    <h3 className="font-semibold text-red-900">Sign Out</h3>
                                    <p className="text-red-700/80 text-sm mt-1">Sign out of your account on this device</p>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="bg-white border border-red-200 text-red-600 px-5 py-2.5 rounded-lg hover:bg-red-50 transition-colors font-medium shadow-sm"
                                >
                                    <LogOut className="w-4 h-4 inline-block mr-2" />
                                    Sign Out
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-5 bg-red-50/50 rounded-xl border border-red-100">
                                <div>
                                    <h3 className="font-semibold text-red-900">Delete Account</h3>
                                    <p className="text-red-700/80 text-sm mt-1">Permanently delete your account and all associated data</p>
                                </div>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="bg-red-600 border border-transparent text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
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
