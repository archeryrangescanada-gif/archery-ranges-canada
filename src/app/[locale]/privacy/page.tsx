import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-600 mb-8">Last Updated: January 16, 2026</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700">
              Archery Ranges Canada ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website archeryrangescanada.ca.
            </p>
            <p className="text-gray-700 mt-4">
              Please read this Privacy Policy carefully. By using our Website, you consent to the data practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Personal Information</h3>
            <p className="text-gray-700 mb-3">We may collect personal information that you voluntarily provide when you:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Create an account or claim a listing</li>
              <li>Purchase a premium listing subscription</li>
              <li>Submit a contact form or inquiry</li>
              <li>Subscribe to our newsletter</li>
              <li>Interact with our website</li>
            </ul>
            <p className="text-gray-700 mt-4 mb-3">This information may include:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Name and business name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Mailing address</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Business information for archery facility listings</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <p className="text-gray-700 mb-3">When you visit our Website, we automatically collect certain information, including:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>IP address and geolocation data</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website</li>
              <li>Search terms used to find our website</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Cookies and Tracking Technologies</h3>
            <p className="text-gray-700">
              We use cookies and similar tracking technologies to enhance your browsing experience. See our <Link href="/cookies" className="text-green-600 hover:underline">Cookie Policy</Link> for more details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-3">We use the collected information for various purposes, including:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Providing and maintaining our directory service</li>
              <li>Processing your transactions and managing subscriptions</li>
              <li>Sending administrative information and updates</li>
              <li>Responding to your inquiries and providing customer support</li>
              <li>Personalizing your experience on our Website</li>
              <li>Improving our website and services</li>
              <li>Analyzing usage patterns and trends</li>
              <li>Detecting and preventing fraud or technical issues</li>
              <li>Complying with legal obligations</li>
              <li>Sending marketing communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>
            <p className="text-gray-700 mb-3">We may share your information in the following circumstances:</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Public Listings</h3>
            <p className="text-gray-700">
              Information submitted for archery facility listings (such as business name, address, phone number, website, and description) will be publicly visible on our directory.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Service Providers</h3>
            <p className="text-gray-700 mb-3">We may share information with third-party service providers who assist us in:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Payment processing (Stripe, PayPal, etc.)</li>
              <li>Email delivery and marketing</li>
              <li>Website hosting and infrastructure</li>
              <li>Analytics and performance monitoring</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Legal Requirements</h3>
            <p className="text-gray-700 mb-3">We may disclose your information if required to do so by law or in response to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Legal processes or government requests</li>
              <li>Enforcement of our Terms and Conditions</li>
              <li>Protection of our rights, property, or safety</li>
              <li>Investigation of fraud or security issues</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.4 Business Transfers</h3>
            <p className="text-gray-700">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure database storage</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="text-gray-700 mt-4">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Privacy Rights</h2>
            <p className="text-gray-700 mb-3">Depending on your location, you may have the following rights regarding your personal information:</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.1 Access and Portability</h3>
            <p className="text-gray-700">
              You have the right to request a copy of the personal information we hold about you.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.2 Correction</h3>
            <p className="text-gray-700">
              You may request that we correct any inaccurate or incomplete information.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.3 Deletion</h3>
            <p className="text-gray-700">
              You may request deletion of your personal information, subject to certain legal exceptions.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.4 Opt-Out of Marketing</h3>
            <p className="text-gray-700">
              You may opt out of receiving marketing communications by clicking the unsubscribe link in emails or contacting us directly.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.5 Cookie Management</h3>
            <p className="text-gray-700">
              You can control cookies through your browser settings. See our <Link href="/cookies" className="text-green-600 hover:underline">Cookie Policy</Link> for details.
            </p>

            <p className="text-gray-700 mt-6">
              To exercise any of these rights, please contact us at archeryrangescanada@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
            <p className="text-gray-700">
              Our Website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately so we can delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Websites</h2>
            <p className="text-gray-700">
              Our Website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Retention</h2>
            <p className="text-gray-700">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When information is no longer needed, we will securely delete or anonymize it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Data Transfers</h2>
            <p className="text-gray-700">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on this page with a new "Last Updated" date. Your continued use of the Website after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
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
