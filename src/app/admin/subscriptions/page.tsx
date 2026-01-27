// src/app/admin/subscriptions/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Edit, Eye, Plus, CreditCard, Users, BarChart3, TrendingUp, Award, Star, Crown } from 'lucide-react'
import Image from 'next/image'

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: string
  interval: string
  activeCount: number
  features: string[]
  badgeImage?: string
  color: string
}

interface ActiveSubscription {
  id: string
  customerName: string
  email: string
  planName: string
  status: 'Active' | 'Cancelled' | 'Pending'
  startDate: string
  nextBilling: string
  revenue: string
}

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'active'>('plans')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Initial mock data for plans (reflecting the user's requested names and badges)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([
    {
      id: '1',
      name: 'Free',
      description: 'Basic listing',
      price: '$0',
      interval: 'month',
      activeCount: 0,
      features: ['Basic listing', 'Contact information', '✗ Photos', '✗ Featured placement'],
      color: 'gray',
    },
    {
      id: '2',
      name: 'Featured (Bronze)',
      description: 'Enhanced listing',
      price: '$29',
      interval: 'month',
      activeCount: 3,
      features: ['Everything in Free', 'Up to 10 photos', 'Business hours', '✗ Featured placement'],
      badgeImage: '/bronze-badge.png',
      color: 'amber',
    },
    {
      id: '3',
      name: 'Pro (Silver)',
      description: 'Full features',
      price: '$79',
      interval: 'month',
      activeCount: 7,
      features: ['Everything in Featured', 'Unlimited photos', 'Featured placement', 'Priority support'],
      badgeImage: '/silver-badge.png',
      color: 'emerald',
    },
    {
      id: '4',
      name: 'Premium (Gold)',
      description: 'Custom solution',
      price: 'Custom',
      interval: 'month',
      activeCount: 2,
      features: ['Everything in Pro', 'Multiple locations', 'Custom branding', 'API access'],
      badgeImage: '/gold-badge.png',
      color: 'blue',
    }
  ])

  // Initial mock data for active subscriptions
  const [subscriptions, setSubscriptions] = useState<ActiveSubscription[]>([
    {
      id: 's1',
      customerName: 'Toronto Archery Range',
      email: 'john@torontoarchery.com',
      planName: 'Premium (Gold)',
      status: 'Active',
      startDate: '1/15/2024',
      nextBilling: '4/15/2024',
      revenue: '$79/mo'
    },
    {
      id: 's2',
      customerName: 'Vancouver Archery Club',
      email: 'info@vancouverarchery.ca',
      planName: 'Featured (Bronze)',
      status: 'Active',
      startDate: '2/1/2024',
      nextBilling: '5/1/2024',
      revenue: '$29/mo'
    }
  ])

  const handleDeletePlan = (id: string) => {
    const plan = plans.find(p => p.id === id)
    if (confirm(`Are you sure you want to delete the "${plan?.name}" plan? This cannot be undone.`)) {
      setPlans(plans.filter(p => p.id !== id))
    }
  }

  const handleDeleteSubscription = (id: string) => {
    const sub = subscriptions.find(s => s.id === id)
    if (confirm(`Are you sure you want to cancel the subscription for "${sub?.customerName}"?`)) {
      setSubscriptions(subscriptions.filter(s => s.id !== id))
    }
  }

  const filteredSubscriptions = subscriptions.filter(s =>
    s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.planName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600 mt-1">Manage subscription plans and active subscriptions</p>
        </div>
        <button
          onClick={() => alert('Plan creation modal would go here')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Plan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Plans" value={plans.length.toString()} icon={<CreditCard className="w-6 h-6 text-gray-400" />} />
        <StatCard title="Active Subscriptions" value={subscriptions.length.toString()} icon={<Users className="w-6 h-6 text-blue-500" />} color="text-blue-600" />
        <StatCard title="Monthly Revenue" value="$1,845" icon={<BarChart3 className="w-6 h-6 text-green-500" />} color="text-green-600" />
        <StatCard title="Churn Rate" value="2.3%" icon={<TrendingUp className="w-6 h-6 text-orange-500" />} color="text-orange-600" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b bg-gray-50/50">
          <div className="flex">
            <TabButton
              active={activeTab === 'plans'}
              onClick={() => setActiveTab('plans')}
              label="Subscription Plans"
            />
            <TabButton
              active={activeTab === 'active'}
              onClick={() => setActiveTab('active')}
              label="Active Subscriptions"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'plans' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onDelete={() => handleDeletePlan(plan.id)} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search subscriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <TableTh>Customer</TableTh>
                      <TableTh>Plan</TableTh>
                      <TableTh>Status</TableTh>
                      <TableTh>Start Date</TableTh>
                      <TableTh>Next Billing</TableTh>
                      <TableTh>Revenue</TableTh>
                      <TableTh>Actions</TableTh>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSubscriptions.map((sub) => (
                      <SubscriptionRow key={sub.id} sub={sub} onDelete={() => handleDeleteSubscription(sub.id)} />
                    ))}
                    {filteredSubscriptions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          No subscriptions found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color = 'text-gray-900' }: { title: string, value: string, icon: React.ReactNode, color?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-start">
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
      </div>
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
        {icon}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-4 font-semibold text-sm transition-all relative ${active
          ? 'text-green-600'
          : 'text-gray-500 hover:text-gray-700'
        }`}
    >
      {label}
      {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600 rounded-t-full" />}
    </button>
  )
}

function TableTh({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">
      {children}
    </th>
  )
}

function PlanCard({ plan, onDelete }: { plan: SubscriptionPlan, onDelete: () => void }) {
  const isPremium = plan.id === '3' || plan.id === '4'; // Silver or Gold

  return (
    <div className={`
      relative border-2 rounded-2xl p-6 transition-all duration-300 flex flex-col h-full
      ${isPremium ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 hover:border-emerald-400 bg-white'}
    `}>
      {plan.id === '3' && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            Most Popular
          </span>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-xl text-gray-900 leading-tight">{plan.name}</h3>
          <p className="text-gray-500 text-sm mt-0.5">{plan.description}</p>
        </div>
        <div className="flex gap-2">
          <button className="text-gray-400 hover:text-blue-600 transition-colors">
            <Edit className="w-5 h-5" />
          </button>
          <button onClick={onDelete} className="text-gray-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {plan.badgeImage && (
        <div className="mb-4 bg-gray-50 rounded-xl p-3 flex justify-center items-center border border-gray-100">
          <img src={plan.badgeImage} alt={plan.name} className="h-16 w-auto object-contain drop-shadow-md" />
        </div>
      )}

      <div className="mb-6">
        <span className="text-4xl font-black text-gray-900">{plan.price}</span>
        {plan.price !== 'Custom' && <span className="text-gray-500 font-medium ml-1">/{plan.interval}</span>}
      </div>

      <ul className="space-y-3 text-sm text-gray-600 mb-8 flex-1">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2.5">
            {feature.startsWith('✓') ? (
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">✓</span>
            ) : feature.startsWith('✗') ? (
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-[10px] font-bold">✕</span>
            ) : (
              <span className="text-emerald-500 font-bold">✓</span>
            )}
            <span className={feature.startsWith('✗') ? 'text-gray-400' : 'text-gray-700 font-medium'}>
              {feature.replace(/^[✓✗] /, '')}
            </span>
          </li>
        ))}
      </ul>

      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">{plan.activeCount} active users</span>
        <button className="text-emerald-600 hover:text-emerald-700 text-xs font-bold uppercase tracking-widest">
          View Users
        </button>
      </div>
    </div>
  )
}

function SubscriptionRow({ sub, onDelete }: { sub: ActiveSubscription, onDelete: () => void }) {
  const getPlanBadgeStyle = (name: string) => {
    if (name.includes('Premium')) return 'bg-blue-50 text-blue-700 border-blue-200'
    if (name.includes('Pro')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }

  return (
    <tr className="hover:bg-gray-50/80 transition-colors group">
      <td className="px-6 py-4">
        <div>
          <div className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{sub.customerName}</div>
          <div className="text-sm text-gray-500 font-medium">{sub.email}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border rounded-full ${getPlanBadgeStyle(sub.planName)} shadow-sm`}>
          {sub.planName}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 rounded-full">
          {sub.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm font-medium text-gray-600">{sub.startDate}</td>
      <td className="px-6 py-4 text-sm font-medium text-gray-600">{sub.nextBilling}</td>
      <td className="px-6 py-4 text-sm font-black text-gray-900">{sub.revenue}</td>
      <td className="px-6 py-4">
        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="text-gray-400 hover:text-blue-600 transition-colors">
            <Eye className="w-5 h-5" />
          </button>
          <button onClick={onDelete} className="text-gray-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  )
}
