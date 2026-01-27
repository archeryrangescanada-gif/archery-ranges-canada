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

  // Initial data for plans (strictly Bronze, Silver, Gold, Platinum)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([
    {
      id: '1',
      name: 'Bronze',
      description: 'Free listing',
      price: '$0',
      interval: 'month',
      activeCount: 0,
      features: ['Basic listing', 'Contact information', '✗ Photos', '✗ Featured placement'],
      badgeImage: '/bronze-badge.png',
      color: 'amber',
    },
    {
      id: '2',
      name: 'Silver',
      description: 'Enhanced visibility',
      price: '$49.99',
      interval: 'month',
      activeCount: 3,
      features: ['Everything in Bronze', 'Up to 10 photos', 'Business hours', '✗ Featured placement'],
      badgeImage: '/silver-badge.png',
      color: 'slate',
    },
    {
      id: '3',
      name: 'Gold',
      description: 'Full featured exposure',
      price: '$149.99',
      interval: 'month',
      activeCount: 7,
      features: ['Everything in Silver', 'Unlimited photos', 'Featured placement', 'Priority support'],
      badgeImage: '/gold-badge.png',
      color: 'yellow',
    },
    {
      id: '4',
      name: 'Platinum',
      description: 'Maximum dominance',
      price: '$399.99',
      interval: 'month',
      activeCount: 2,
      features: ['Everything in Gold', 'Multiple locations', 'Custom branding', 'API access'],
      badgeImage: '/platinum-badge.png',
      color: 'indigo',
    }
  ])

  // Initial data for active subscriptions (using new tier names)
  const [subscriptions, setSubscriptions] = useState<ActiveSubscription[]>([
    {
      id: 's1',
      customerName: 'Toronto Archery Range',
      email: 'john@torontoarchery.com',
      planName: 'Gold',
      status: 'Active',
      startDate: '1/15/2024',
      nextBilling: '4/15/2024',
      revenue: '$149.99/mo'
    },
    {
      id: 's2',
      customerName: 'Vancouver Archery Club',
      email: 'info@vancouverarchery.ca',
      planName: 'Silver',
      status: 'Active',
      startDate: '2/1/2024',
      nextBilling: '5/1/2024',
      revenue: '$49.99/mo'
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

  const handleViewUsers = (planName: string) => {
    setSearchQuery(planName)
    setActiveTab('active')
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
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Subscriptions</h1>
          <p className="text-gray-500 mt-1 font-bold">Manage subscription plans and active subscriptions</p>
        </div>
        <button
          onClick={() => alert('Plan creation modal would go here')}
          className="bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 font-black flex items-center gap-2 shadow-xl shadow-green-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 stroke-[4px]" />
          Create Plan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Plans" value={plans.length.toString()} icon={<CreditCard className="w-6 h-6 text-gray-400" />} />
        <StatCard title="Active Subscriptions" value={subscriptions.length.toString()} icon={<Users className="w-6 h-6 text-blue-600" />} color="text-blue-700" />
        <StatCard title="Monthly Revenue" value="$2,450" icon={<BarChart3 className="w-6 h-6 text-green-600" />} color="text-green-700" />
        <StatCard title="Churn Rate" value="1.8%" icon={<TrendingUp className="w-6 h-6 text-orange-500" />} color="text-orange-700" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="border-b bg-gray-50/20">
          <div className="flex">
            <TabButton
              active={activeTab === 'plans'}
              onClick={() => { setActiveTab('plans'); setSearchQuery(''); }}
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
        <div className="p-8 lg:p-12">
          {activeTab === 'plans' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onDelete={() => handleDeletePlan(plan.id)}
                  onViewUsers={() => handleViewUsers(plan.name)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search subscriptions by name, email, or plan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-5 border-2 border-gray-100 rounded-[1.5rem] focus:outline-none focus:border-green-500 text-gray-900 font-black placeholder:text-gray-300 transition-all text-lg shadow-inner bg-gray-50/30"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 font-black uppercase tracking-widest text-xs"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-[2rem] border-2 border-gray-50/50">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b-2 border-gray-50">
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
                  <tbody className="divide-y-2 divide-gray-50">
                    {filteredSubscriptions.map((sub) => (
                      <SubscriptionRow key={sub.id} sub={sub} onDelete={() => handleDeleteSubscription(sub.id)} />
                    ))}
                    {filteredSubscriptions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-24 text-center text-gray-400 font-bold italic text-lg capitalize">
                          No matching subscriptions found.
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
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex justify-between items-start transition-all hover:shadow-xl hover:-translate-y-1">
      <div>
        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
        <p className={`text-4xl font-black mt-2 tracking-tighter ${color}`}>{value}</p>
      </div>
      <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 shadow-inner">
        {icon}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-12 py-6 font-black text-sm transition-all relative uppercase tracking-widest ${active
          ? 'text-green-700'
          : 'text-gray-300 hover:text-gray-500'
        }`}
    >
      {label}
      {active && <div className="absolute bottom-0 left-0 right-0 h-2 bg-green-600 rounded-t-full mx-8" />}
    </button>
  )
}

function TableTh({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-8 py-6 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] leading-none">
      {children}
    </th>
  )
}

function PlanCard({ plan, onDelete, onViewUsers }: { plan: SubscriptionPlan, onDelete: () => void, onViewUsers: () => void }) {
  const isMostPopular = plan.id === '3'; // Gold

  return (
    <div className={`
      relative border-4 rounded-[3rem] p-10 transition-all duration-700 flex flex-col h-full group
      ${isMostPopular ? 'border-yellow-400 bg-yellow-50/30' : 'border-gray-50 bg-white'}
      hover:shadow-2xl hover:shadow-gray-200/50
    `}>
      {isMostPopular && (
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl border-4 border-white">
            Most Popular
          </span>
        </div>
      )}

      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <h3 className="font-black text-3xl text-gray-900 tracking-tighter leading-none mb-2">{plan.name}</h3>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{plan.description}</p>
        </div>
        <div className="flex gap-2">
          <button className="text-gray-300 hover:text-blue-600 transition-all p-2 hover:bg-white hover:shadow-md rounded-xl">
            <Edit className="w-5 h-5" />
          </button>
          <button onClick={onDelete} className="text-gray-300 hover:text-red-600 transition-all p-2 hover:bg-white hover:shadow-md rounded-xl">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mb-10 bg-white rounded-3xl p-6 flex justify-center items-center border-2 border-gray-50 shadow-inner group-hover:scale-105 transition-transform duration-500 min-h-[160px]">
        <img
          src={plan.badgeImage}
          alt={plan.name}
          className="h-28 w-auto object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.1)] brightness-110 contrast-110"
        />
      </div>

      <div className="mb-10">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black text-gray-900 tracking-tighter leading-none">{plan.price}</span>
          {plan.price.includes('$') && (
            <span className="text-gray-400 text-xs font-black uppercase tracking-widest ml-1">/ Month</span>
          )}
        </div>
      </div>

      <ul className="space-y-5 text-sm mb-12 flex-1">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-4">
            {feature.startsWith('✗') ? (
              <div className="flex-shrink-0 w-6 h-6 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-[11px] font-black shadow-inner translate-y-0.5 border border-red-100">✕</div>
            ) : (
              <div className="flex-shrink-0 w-6 h-6 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-[11px] font-black shadow-inner translate-y-0.5 border border-green-100">✓</div>
            )}
            <span className={`leading-relaxed text-[13px] ${feature.startsWith('✗') ? 'text-gray-300 line-through decoration-gray-200' : 'text-gray-900 font-black'}`}>
              {feature.replace(/^[✓✗] /, '')}
            </span>
          </li>
        ))}
      </ul>

      <div className="pt-8 border-t-2 border-gray-50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-black text-gray-900 leading-none">{plan.activeCount}</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Users</span>
        </div>
        <button
          onClick={onViewUsers}
          className={`
            px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-90 shadow-lg shadow-gray-100
            ${isMostPopular ? 'bg-yellow-400 text-yellow-900 hover:shadow-yellow-100' : 'bg-gray-900 text-white hover:bg-black'}
          `}
        >
          View Members
        </button>
      </div>
    </div>
  )
}

function SubscriptionRow({ sub, onDelete }: { sub: ActiveSubscription, onDelete: () => void }) {
  const getPlanBadgeStyle = (name: string) => {
    const base = 'px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-2 rounded-2xl shadow-sm transition-transform active:scale-95 text-center block'
    if (name.includes('Platinum')) return `${base} bg-indigo-50 text-indigo-700 border-indigo-100`
    if (name.includes('Gold')) return `${base} bg-yellow-50 text-yellow-700 border-yellow-200`
    if (name.includes('Silver')) return `${base} bg-slate-50 text-slate-700 border-slate-200`
    return `${base} bg-orange-50 text-orange-800 border-orange-100` // Bronze
  }

  return (
    <tr className="hover:bg-gray-50/30 transition-all group">
      <td className="px-8 py-7">
        <div>
          <div className="font-black text-gray-900 group-hover:text-green-700 transition-colors tracking-tight text-lg">{sub.customerName}</div>
          <div className="text-xs text-gray-400 font-bold mt-1 tracking-wider">{sub.email}</div>
        </div>
      </td>
      <td className="px-8 py-7 min-w-[160px]">
        <span className={getPlanBadgeStyle(sub.planName)}>
          {sub.planName}
        </span>
      </td>
      <td className="px-8 py-7">
        <span className="px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-200/50">
          {sub.status}
        </span>
      </td>
      <td className="px-8 py-7 text-sm font-black text-gray-700">{sub.startDate}</td>
      <td className="px-8 py-7 text-sm font-black text-gray-700">{sub.nextBilling}</td>
      <td className="px-8 py-7 text-lg font-black text-gray-900">{sub.revenue}</td>
      <td className="px-8 py-7">
        <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
          <button className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all hover:-translate-y-1">
            <Eye className="w-6 h-6" />
          </button>
          <button onClick={onDelete} className="bg-white p-3 rounded-2xl shadow-lg border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 transition-all hover:-translate-y-1">
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      </td>
    </tr>
  )
}
