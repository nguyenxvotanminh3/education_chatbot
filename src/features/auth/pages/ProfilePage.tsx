import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paymentService, SubscriptionHistoryItem } from '../../payment/services/paymentService'
import { toast } from 'react-toastify'
import { Loader2, Calendar, DollarSign, CreditCard, RefreshCw } from 'lucide-react'

type Plan = 'Free' | 'Go'

const getPlan = (): Plan => (localStorage.getItem('plan') as Plan) || 'Free'
const getQuota = () => ({ limit: 25, used: parseInt(localStorage.getItem('quota_used') || '0', 10) })

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value)
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'cancelled':
    case 'expired':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    case 'refunded':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  }
}

const ProfilePage = () => {
  const navigate = useNavigate()
  const [plan, setPlan] = useState<Plan>(getPlan())
  const [quota, setQuota] = useState(getQuota())
  const [subscriptions, setSubscriptions] = useState<SubscriptionHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPlan(getPlan())
    setQuota(getQuota())
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const data = await paymentService.getSubscriptionsHistory()
      setSubscriptions(data.subscriptions || [])
    } catch (error: any) {
      console.error('Failed to load subscriptions:', error)
      toast.error('Failed to load subscription history')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = () => navigate('/upgrade')
  const handleCancel = async () => {
    if (!confirm('Cancel subscription and switch to Free?')) {
      return;
    }
    
    try {
      // Call backend API to cancel subscription
      const response = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        localStorage.setItem('plan', 'Free')
        setPlan('Free')
        // Refresh page to update plan
        window.location.reload();
      } else {
        alert('Failed to cancel subscription. Please try again.');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-bg flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-semibold mb-6 text-text">Profile</h1>
        <div className="rounded-2xl bg-surface p-6 shadow-[inset_0_0_0_1px_var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-text-subtle">Plan</div>
              <div className="text-lg font-medium text-text">{plan}</div>
              {plan === 'Free' ? (
                <div className="text-sm text-text-subtle mt-1">{quota.used}/25 messages used</div>
              ) : (
                <div className="text-sm text-text-subtle mt-1">Unlimited messages</div>
              )}
            </div>
            {plan === 'Free' ? (
              <button onClick={handleUpgrade} className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600">Upgrade</button>
            ) : (
              <button onClick={handleCancel} className="px-4 py-2 rounded-xl bg-surface-muted hover:bg-primary-500/10">Cancel subscription</button>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-surface p-6 shadow-[inset_0_0_0_1px_var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-lg font-medium text-text">Subscription History</div>
              <div className="text-sm text-text-subtle mt-1">
                {subscriptions.length} {subscriptions.length === 1 ? 'subscription' : 'subscriptions'}
              </div>
            </div>
            <button
              onClick={loadSubscriptions}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-muted hover:bg-primary-500/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-text-subtle opacity-50" />
              <div className="text-sm text-text-subtle">No subscriptions found</div>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.subscriptionId}
                  className="rounded-lg border border-border p-4 hover:bg-surface-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-text">{subscription.orderId}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </div>
                      <div className="text-xs text-text-subtle">{subscription.user.name} • {subscription.user.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-text">
                        {formatCurrency(subscription.amount.value, subscription.amount.currency)}
                      </div>
                      <div className="text-xs text-text-subtle">{subscription.plan}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-text-subtle mt-0.5" />
                      <div>
                        <div className="text-xs text-text-subtle">Start Date</div>
                        <div className="text-sm text-text">{formatDate(subscription.startDate)}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-text-subtle mt-0.5" />
                      <div>
                        <div className="text-xs text-text-subtle">Renews</div>
                        <div className="text-sm text-text">
                          {formatDate(subscription.renews.date)} ({subscription.renews.type})
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-text-subtle mt-0.5" />
                      <div>
                        <div className="text-xs text-text-subtle">Account Status</div>
                        <div className="text-sm text-text">{subscription.accountStatus}</div>
                      </div>
                    </div>
                  </div>

                  {subscription.actions && subscription.actions.length > 0 && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                      <span className="text-xs text-text-subtle">Actions:</span>
                      {subscription.actions.map((action, index) => (
                        <button
                          key={index}
                          className="px-2 py-1 text-xs rounded bg-surface-muted hover:bg-primary-500/10 text-text transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage


