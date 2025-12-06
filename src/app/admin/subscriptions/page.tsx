// src/app/admin/subscriptions/page.tsx
'use client'
import { useState } from 'react'

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'active'>('plans')

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-gray-600 mt-1">Manage subscription plans and active subscriptions</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <span className="text-xl">+</span>
          Create Plan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Plans</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">4</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Active Subscriptions</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">12</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">$1,845</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Churn Rate</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">2.3%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'plans'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'active'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Active Subscriptions
            </button>
          </div>
        </div>

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Free Plan */}
              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Free</h3>
                    <p className="text-gray-500 text-sm">Basic listing</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Basic listing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Contact information
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <span>✗</span>
                    Photos
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <span>✗</span>
                    Featured placement
                  </li>
                </ul>
                <div className="text-sm text-gray-500">
                  <strong>0</strong> active subscriptions
                </div>
              </div>

              {/* Basic Plan */}
              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Basic</h3>
                    <p className="text-gray-500 text-sm">Enhanced listing</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$29</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Everything in Free
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Up to 10 photos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Business hours
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <span>✗</span>
                    Featured placement
                  </li>
                </ul>
                <div className="text-sm text-gray-500">
                  <strong>3</strong> active subscriptions
                </div>
              </div>

              {/* Premium Plan */}
              <div className="border-2 border-green-500 rounded-lg p-6 relative bg-green-50">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">Most Popular</span>
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Premium</h3>
                    <p className="text-gray-500 text-sm">Full features</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$79</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Everything in Basic
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Unlimited photos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Featured placement
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Priority support
                  </li>
                </ul>
                <div className="text-sm text-gray-500">
                  <strong>7</strong> active subscriptions
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Enterprise</h3>
                    <p className="text-gray-500 text-sm">Custom solution</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold">Custom</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Everything in Premium
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Multiple locations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Custom branding
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    API access
                  </li>
                </ul>
                <div className="text-sm text-gray-500">
                  <strong>2</strong> active subscriptions
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Subscriptions Tab */}
        {activeTab === 'active' && (
          <div className="p-6">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search subscriptions..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Billing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">Toronto Archery Range</div>
                      <div className="text-sm text-gray-500">john@torontoarchery.com</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">Premium</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Active</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">1/15/2024</td>
                  <td className="px-6 py-4 text-sm text-gray-500">4/15/2024</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">$79/mo</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">Vancouver Archery Club</div>
                      <div className="text-sm text-gray-500">info@vancouverarchery.ca</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Basic</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Active</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">2/1/2024</td>
                  <td className="px-6 py-4 text-sm text-gray-500">5/1/2024</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">$29/mo</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}