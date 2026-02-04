import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Data Deletion Request | Archery Ranges Canada',
  description: 'Request deletion of your personal data from Archery Ranges Canada',
}

export default function DataDeletionPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-stone-900 mb-8">Data Deletion Request</h1>

          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-stone-800 mb-3">How to Request Data Deletion</h2>
              <p className="text-stone-600 mb-4">
                If you would like to request the deletion of your personal data from Archery Ranges Canada,
                please send an email to:
              </p>
              <a
                href="mailto:archeryrangescanada@gmail.com?subject=Data Deletion Request"
                className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                archeryrangescanada@gmail.com
              </a>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-800 mb-3">What to Include in Your Request</h2>
              <ul className="list-disc list-inside text-stone-600 space-y-2">
                <li>Your full name</li>
                <li>Email address associated with your account</li>
                <li>The subject line: "Data Deletion Request"</li>
                <li>Any specific data you want deleted (or "all data" for complete deletion)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-800 mb-3">What Data We Collect</h2>
              <p className="text-stone-600 mb-3">Depending on how you use our service, we may have collected:</p>
              <ul className="list-disc list-inside text-stone-600 space-y-2">
                <li>Account information (name, email address)</li>
                <li>Business listing information (if you claimed or created a listing)</li>
                <li>Contact form submissions</li>
                <li>Usage analytics (anonymized)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-800 mb-3">Processing Time</h2>
              <p className="text-stone-600">
                We will process your deletion request within <strong>30 days</strong> of receiving it.
                You will receive a confirmation email once your data has been deleted.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-stone-800 mb-3">Facebook Login Users</h2>
              <p className="text-stone-600 mb-3">
                If you logged in using Facebook, we only receive and store:
              </p>
              <ul className="list-disc list-inside text-stone-600 space-y-2">
                <li>Your name</li>
                <li>Your email address</li>
                <li>Your Facebook user ID (for authentication purposes)</li>
              </ul>
              <p className="text-stone-600 mt-3">
                To remove the connection between your Facebook account and Archery Ranges Canada,
                you can also revoke access from your{' '}
                <a
                  href="https://www.facebook.com/settings?tab=applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline"
                >
                  Facebook App Settings
                </a>.
              </p>
            </section>

            <section className="border-t border-stone-200 pt-6">
              <h2 className="text-xl font-semibold text-stone-800 mb-3">Questions?</h2>
              <p className="text-stone-600">
                If you have any questions about data deletion or our privacy practices, please visit our{' '}
                <a href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</a> or{' '}
                <a href="/contact" className="text-emerald-600 hover:underline">Contact Us</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
