// src/app/admin/subscriptions/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Edit, Eye, Plus, CreditCard, Users, BarChart3, TrendingUp } from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: string
  activeCount: number
  features: string[]
  badgeImage: string
  color: string
  is_public: boolean
  max_quantity?: number
}

interface ActiveSubscription {
  id: string
  customerName: string
  email: string
  planName: string
  status: string
  startDate: string
  nextBilling: string
  revenue: string
  planId: string
}

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'active'>('plans')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [subscriptions, setSubscriptions] = useState<ActiveSubscription[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Hardcoded Plans (Since RLS blocks client reads on subscription_plans)
      const processedPlans: SubscriptionPlan[] = [
        {
          id: 'bronze-plan-id',
          name: 'Bronze',
          description: 'Free listing',
          price: 0,
          interval: 'month',
          activeCount: 0,
          features: ['1 photo', '100 words', 'Shows amenities', 'Non clickable website, email, phone', 'Address', 'Map location', 'Bow types'],
          badgeImage: '/bronze-badge.png',
          color: 'amber',
          is_public: true
        },
        {
          id: 'silver-plan-id',
          name: 'Silver',
          description: 'Enhanced visibility',
          price: 49.99,
          interval: 'month',
          activeCount: 0,
          features: ['Everything in bronze', '200 words', '5 photos', 'Analytics', 'Social media links', 'Clickable phone, email, website', 'Shows pricing', 'Reply to reviews'],
          badgeImage: '/silver-badge.png',
          color: 'slate',
          is_public: true
        },
        {
          id: 'gold-plan-id',
          name: 'Gold',
          description: 'Full featured exposure',
          price: 129.99,
          interval: 'month',
          activeCount: 0,
          features: ['Everything in silver', 'Featured listing', 'Ad of your club in free listings', 'Calender-agenda', 'Unlimited photos', '300 word description', 'Youtube Video Integration', 'Send a message'],
          badgeImage: '/gold-badge.png',
          color: 'yellow',
          is_public: true
        }
      ]

      // Set default layout first in case of query fail
      setPlans(processedPlans)

      // 2. Fetch Active Subscriptions from ranges table safely
      // Because the subscription_tier column has an extremely strict Postgres Enum applied to it,
      // using an `.in()` array with mixed values like 'premium' or 'pro' throws a DB error and halts fetching.
      // Instead, we will fetch any range that is claimed and not purely on the free tier.
      const { data: subsData, error: subsError } = await supabase
        .from('ranges')
        .select(`
          id,
          name,
          subscription_tier,
          subscription_status,
          subscription_updated_at,
          stripe_subscription_id,
          owner_id
        `)
        .not('owner_id', 'is', null)

      if (subsError) {
        console.error('Error fetching ranges subscriptions:', subsError);
      }

      // 3. Fetch user profiles manually for these ranges
      const ownerIdsArray = (subsData || []).map((r: any) => r.owner_id).filter(Boolean)
      const ownerIds = Array.from(new Set(ownerIdsArray)) as string[]
      let profilesMap: Record<string, any> = {}

      if (ownerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', ownerIds)

        if (profilesData) {
          profilesData.forEach((p: any) => {
            profilesMap[p.id] = p
          })
        }
      }

      // Process Subscriptions safely mapping them in memory instead
      const activeRows = (subsData || []).filter((sub: any) => sub.subscription_tier !== 'free');

      const processedSubs: ActiveSubscription[] = activeRows.map((sub: any) => {
        const profile = profilesMap[sub.owner_id] || {}

        let planId = 'bronze-plan-id'
        let planName = 'Bronze'
        let revenueStr = '$0/mo'

        if (sub.subscription_tier === 'pro' || sub.subscription_tier === 'silver') {
          planId = 'silver-plan-id'
          planName = 'Silver'
          revenueStr = '$49.99/mo'
        } else if (sub.subscription_tier === 'premium' || sub.subscription_tier === 'gold') {
          planId = 'gold-plan-id'
          planName = 'Gold'
          revenueStr = '$129.99/mo'
        }

        return {
          id: sub.id,
          customerName: profile.full_name || 'Unknown User',
          email: profile.email || 'No Email',
          planName: planName,
          status: sub.subscription_status || 'active',
          startDate: sub.subscription_updated_at ? new Date(sub.subscription_updated_at).toLocaleDateString() : 'N/A',
          nextBilling: 'Managed in Stripe', // Next billing isn't stored locally by default
          revenue: revenueStr,
          planId: planId
        }
      })

      setSubscriptions(processedSubs)

      // Calculate Revenue
      const monthlyRev = processedSubs.reduce((acc, sub) => {
        const price = parseFloat(sub.revenue.replace(/[^0-9.]/g, ''))
        return acc + (isNaN(price) ? 0 : price)
      }, 0)
      setTotalRevenue(monthlyRev)

      // Process Plans with active counts
      const counts = processedSubs.reduce((acc: { [key: string]: number }, sub) => {
        acc[sub.planId] = (acc[sub.planId] || 0) + 1
        return acc
      }, {})

      const plansWithCounts = processedPlans.map(plan => ({
        ...plan,
        activeCount: counts[plan.id] || 0
      }))

      setPlans(plansWithCounts)

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure? This will hide the plan, not delete it if used.')) return
    console.log('Delete plan', id)
  }

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('Revoke this subscription and revert to Bronze?')) return
    const { error } = await supabase
      .from('ranges')
      .update({ subscription_tier: 'basic', subscription_status: 'canceled' })
      .eq('id', id)

    if (error) {
      alert('Error cancelling subscription')
    } else {
      fetchData() // Refresh
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(price);

  if (loading) return <div className="p-10 text-center font-bold text-gray-500 animate-pulse">Loading subscriptions...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Subscriptions</h1>
          <p className="text-gray-500 mt-1 font-bold text-sm">Manage subscription plans and active users</p>
        </div>
        <button
          onClick={() => alert('Feature coming soon: Manual Plan Creation')}
          className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 font-bold flex items-center gap-2 shadow-lg shadow-green-200 transition-all active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4 stroke-[4px]" />
          Create Plan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Plans" value={plans.length.toString()} icon={<CreditCard className="w-5 h-5 text-gray-400" />} />
        <StatCard title="Active Subscriptions" value={subscriptions.length.toString()} icon={<Users className="w-5 h-5 text-blue-600" />} color="text-blue-700" />
        <StatCard title="Monthly Revenue" value={formatPrice(totalRevenue)} icon={<BarChart3 className="w-5 h-5 text-green-600" />} color="text-green-700" />
        <StatCard title="Churn Rate" value="0%" icon={<TrendingUp className="w-5 h-5 text-orange-500" />} color="text-orange-700" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
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
        <div className="p-6 lg:p-8">
          {activeTab === 'plans' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-green-500 text-gray-900 font-bold placeholder:text-gray-300 transition-all text-sm shadow-inner bg-gray-50/30"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 font-bold uppercase tracking-widest text-[10px]"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border-2 border-gray-50/50">
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
                          {loading ? 'Loading...' : 'No matching subscriptions found.'}
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex justify-between items-start transition-all hover:shadow-lg hover:-translate-y-1">
      <div>
        <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em]">{title}</h3>
        <p className={`text-3xl font-black mt-1 tracking-tight ${color}`}>{value}</p>
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
      className={`px-8 py-4 font-bold text-xs transition-all relative uppercase tracking-widest ${active
        ? 'text-green-700'
        : 'text-gray-300 hover:text-gray-500'
        }`}
    >
      {label}
      {active && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-green-600 rounded-t-full mx-6" />}
    </button>
  )
}

function TableTh({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none">
      {children}
    </th>
  )
}

function PlanCard({ plan, onDelete, onViewUsers }: { plan: SubscriptionPlan, onDelete: () => void, onViewUsers: () => void }) {
  const isMostPopular = plan.name === 'Gold';
  const isFounder = plan.name === 'The Founder';

  return (
    <div className={`
      relative border-2 rounded-3xl p-6 transition-all duration-700 flex flex-col h-full group
      ${isMostPopular ? 'border-yellow-400 bg-yellow-50/30' :
        isFounder ? 'border-gray-900 bg-gray-50' : 'border-gray-50 bg-white'}
      hover:shadow-xl hover:shadow-gray-200/50
    `}>
      {isMostPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-lg border-2 border-white">
            Most Popular
          </span>
        </div>
      )}

      {isFounder && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 w-full text-center">
          <span className="bg-black text-white text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-lg border-2 border-gray-800">
            Legacy • {plan.activeCount} / {plan.max_quantity} Taken
          </span>
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="font-black text-2xl text-gray-900 tracking-tight leading-none mb-1">{plan.name}</h3>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em]">{plan.description}</p>
        </div>
        {!isFounder && (
          <div className="flex gap-1">
            <button className="text-gray-300 hover:text-blue-600 transition-all p-1.5 hover:bg-white hover:shadow-sm rounded-lg">
              <Edit className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="text-gray-300 hover:text-red-600 transition-all p-1.5 hover:bg-white hover:shadow-sm rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mb-6 bg-white rounded-2xl p-4 flex justify-center items-center border border-gray-50 shadow-inner group-hover:scale-105 transition-transform duration-500 min-h-[100px]">
        {/* Fallback image if badgeImage fails or is simple path */}
        <img
          src={plan.badgeImage}
          onError={(e) => { e.currentTarget.src = '/placeholder-badge.png' }}
          alt={plan.name}
          className="h-20 w-auto object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.1)] brightness-110 contrast-110"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-gray-900 tracking-tight leading-none">${plan.price}</span>
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider ml-1">/ {plan.interval}</span>
        </div>
      </div>

      <ul className="space-y-3 text-sm mb-8 flex-1">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            {feature.startsWith('✗') ? (
              <div className="flex-shrink-0 w-5 h-5 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-[10px] font-bold shadow-inner translate-y-0.5 border border-red-100">✕</div>
            ) : (
              <div className="flex-shrink-0 w-5 h-5 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-[10px] font-bold shadow-inner translate-y-0.5 border border-green-100">✓</div>
            )}
            <span className={`leading-snug text-xs ${feature.startsWith('✗') ? 'text-gray-400 line-through decoration-gray-200' : 'text-gray-700 font-bold'}`}>
              {feature.replace(/^[✓✗] /, '')}
            </span>
          </li>
        ))}
      </ul>

      <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xl font-black text-gray-900 leading-none">{plan.activeCount}</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Users</span>
        </div>
        <button
          onClick={onViewUsers}
          className={`
            px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95 shadow-md shadow-gray-100
            ${isMostPopular ? 'bg-yellow-400 text-yellow-900 hover:shadow-yellow-100' :
              isFounder ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-900 text-white hover:bg-black'}
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
    if (name.includes('Founder')) return `${base} bg-gray-900 text-white border-black`
    return `${base} bg-orange-50 text-orange-800 border-orange-100` // Bronze
  }

  return (
    <tr className="hover:bg-gray-50/30 transition-all group">
      <td className="px-6 py-4">
        <div>
          <div className="font-bold text-gray-900 group-hover:text-green-700 transition-colors tracking-tight text-sm">{sub.customerName}</div>
          <div className="text-[10px] text-gray-400 font-medium mt-0.5 tracking-wide">{sub.email}</div>
        </div>
      </td>
      <td className="px-6 py-4 min-w-[140px]">
        <span className={getPlanBadgeStyle(sub.planName)}>
          {sub.planName}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] bg-emerald-500 text-white rounded-full shadow-md shadow-emerald-200/50">
          {sub.status}
        </span>
      </td>
      <td className="px-6 py-4 text-xs font-bold text-gray-700">{sub.startDate}</td>
      <td className="px-6 py-4 text-xs font-bold text-gray-700">{sub.nextBilling}</td>
      <td className="px-6 py-4 text-sm font-black text-gray-900">{sub.revenue}</td>
      <td className="px-6 py-4">
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
          <button className="bg-white p-2 rounded-xl shadow-md border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all hover:-translate-y-1">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="bg-white p-2 rounded-xl shadow-md border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 transition-all hover:-translate-y-1">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
