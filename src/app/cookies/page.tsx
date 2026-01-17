import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Cookie Policy
        </h1>
        <p className="text-gray-600 mb-8">Last Updated: January 16, 2026</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-700">
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p className="text-gray-700 mt-4">
              Cookies help us understand how you use our website, remember your preferences, and improve your browsing experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Cookies</h2>
            <p className="text-gray-700">
              Archery Ranges Canada uses cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
              <li>To remember your preferences and settings</li>
              <li>To analyze how you use our website and improve performance</li>
              <li>To remember your location for showing nearby archery ranges</li>
              <li>To provide security features and prevent fraud</li>
              <li>To deliver relevant content and advertisements</li>
              <li>To understand which pages are most popular</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Types of Cookies We Use</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Essential Cookies</h3>
            <p className="text-gray-700">
              These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <p className="text-sm text-gray-700"><strong>Examples:</strong> Authentication cookies, security cookies, load balancing cookies</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Analytics Cookies</h3>
            <p className="text-gray-700">
              We use analytics cookies to understand how visitors interact with our website. This helps us improve our content and user experience.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <p className="text-sm text-gray-700"><strong>Service:</strong> Google Analytics</p>
              <p className="text-sm text-gray-700"><strong>Purpose:</strong> Track page views, user behavior, traffic sources, and site performance</p>
              <p className="text-sm text-gray-700"><strong>Data Collected:</strong> IP address, browser type, pages visited, time spent, referring website</p>
              <p className="text-sm text-gray-700"><strong>Duration:</strong> Up to 2 years</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.3 Functional Cookies</h3>
            <p className="text-gray-700">
              These cookies allow the website to remember choices you make (such as your location preference) and provide enhanced, personalized features.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <p className="text-sm text-gray-700"><strong>Examples:</strong> Location preference, search history, user interface preferences</p>
              <p className="text-sm text-gray-700"><strong>Duration:</strong> Session or up to 1 year</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.4 Advertising Cookies</h3>
            <p className="text-gray-700">
              We may use advertising cookies to deliver relevant ads and track advertising campaign performance. These cookies may be set by our advertising partners.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <p className="text-sm text-gray-700"><strong>Purpose:</strong> Show relevant ads, measure ad effectiveness, limit ad frequency</p>
              <p className="text-sm text-gray-700"><strong>Duration:</strong> Up to 1 year</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
            <p className="text-gray-700 mb-3">
              Some cookies are placed by third-party services that appear on our pages. We do not control these cookies. Third-party services we use include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Google Analytics:</strong> Website analytics and performance tracking</li>
              <li><strong>Supabase:</strong> Authentication and database services</li>
              <li><strong>Payment Processors:</strong> Secure payment processing (Stripe, PayPal)</li>
            </ul>
            <p className="text-gray-700 mt-4">
              We recommend reviewing the privacy policies of these third-party services to understand their use of cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Managing Cookies</h2>
            <p className="text-gray-700">
              You have the right to decide whether to accept or reject cookies. Here are your options:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.1 Browser Settings</h3>
            <p className="text-gray-700 mb-3">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Block all cookies</li>
              <li>Block third-party cookies only</li>
              <li>Delete cookies when you close your browser</li>
              <li>Allow cookies from specific websites</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Please note that blocking cookies may impact your experience on our website and prevent you from using certain features.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.2 How to Manage Cookies by Browser</h3>
            <div className="space-y-3 mt-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">Google Chrome</p>
                <p className="text-sm text-gray-700">Settings → Privacy and Security → Cookies and other site data</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">Firefox</p>
                <p className="text-sm text-gray-700">Options → Privacy & Security → Cookies and Site Data</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">Safari</p>
                <p className="text-sm text-gray-700">Preferences → Privacy → Cookies and website data</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">Microsoft Edge</p>
                <p className="text-sm text-gray-700">Settings → Privacy, search, and services → Cookies</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.3 Opt-Out of Google Analytics</h3>
            <p className="text-gray-700">
              You can opt out of Google Analytics tracking by installing the{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                Google Analytics Opt-out Browser Add-on
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Do Not Track Signals</h2>
            <p className="text-gray-700">
              Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want to be tracked. Currently, there is no industry standard for how to respond to DNT signals. At this time, our website does not respond to DNT signals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to This Cookie Policy</h2>
            <p className="text-gray-700">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal compliance. We will notify you of any material changes by posting the updated policy on this page with a new "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-900">Archery Ranges Canada</p>
              <p className="text-gray-700">Email: archeryrangescanada@gmail.com</p>
              <p className="text-gray-700">Website: archeryrangescanada.ca</p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
