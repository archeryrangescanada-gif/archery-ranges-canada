'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Eye, BarChart3, Star, MoreVertical } from 'lucide-react';
import { Range } from '@/types/database';

interface ListingManagerProps {
    listings: Range[];
}

export function ListingManager({ listings }: ListingManagerProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
                <h3 className="font-semibold text-stone-900">My Listings</h3>
                <Link
                    href="/add-range"
                    className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    Add New Listing
                </Link>
            </div>

            {listings.length === 0 ? (
                <div className="p-8 text-center text-stone-500">
                    <p>You haven't claimed or created any listings yet.</p>
                    <Link href="/add-range" className="text-emerald-600 hover:underline mt-2 inline-block">
                        Get started by adding a range
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-stone-600">
                        <thead className="bg-stone-50 text-stone-900 font-medium">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Views</th>
                                <th className="px-6 py-3">Plan</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {listings.map((listing) => (
                                <tr key={listing.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-stone-900">
                                        <div className="flex items-center gap-3">
                                            <Link href={`/${listing.slug}`} className="hover:text-emerald-600 truncate max-w-[200px]">
                                                {listing.name}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${listing.status === 'active' ? 'bg-green-100 text-green-700' :
                                            listing.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {listing.views_count || 0}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${listing.is_premium ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-700'
                                            }`}>
                                            {listing.is_premium ? 'Premium' : 'Free'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/listings/${listing.id}/analytics`}
                                                className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                title="View Analytics"
                                            >
                                                <BarChart3 className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                href={`/admin/listings/${listing.id}/edit`}
                                                className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                title="Edit Listing"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                href={`/${listing.slug}`} // Assuming route structure
                                                className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                title="View Live Page"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
