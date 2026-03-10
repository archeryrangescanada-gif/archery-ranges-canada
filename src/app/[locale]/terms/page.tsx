import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Terms and Conditions
        </h1>
        <p className="text-gray-600 mb-8">Last Updated: January 16, 2026</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700">
              By accessing and using Archery Ranges Canada ("the Website", "we", "us", or "our"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use this Website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700">
              Archery Ranges Canada is a directory service that provides information about archery facilities, ranges, clubs, and related businesses across Canada. We offer both free basic listings and premium enhanced listings with additional features and visibility.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of the Website</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Permitted Use</h3>
            <p className="text-gray-700 mb-3">You may use this Website for lawful purposes only, including:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Searching for archery facilities and ranges</li>
              <li>Viewing contact information and facility details</li>
              <li>Submitting facility information for inclusion in our directory</li>
              <li>Purchasing premium listing services</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Prohibited Use</h3>
            <p className="text-gray-700 mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Use the Website for any illegal or unauthorized purpose</li>
              <li>Scrape, harvest, or collect data from the Website using automated means without our express written permission</li>
              <li>Reproduce, duplicate, copy, sell, or exploit any portion of the Website for commercial purposes without our written consent</li>
              <li>Transmit any viruses, malware, or harmful code</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Post false, inaccurate, misleading, or defamatory content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User-Submitted Content</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Listing Information</h3>
            <p className="text-gray-700 mb-3">When you submit information about an archery facility, you represent and warrant that:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You have the right to submit this information</li>
              <li>The information is accurate and current</li>
              <li>The information does not violate any third-party rights or applicable laws</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 License Grant</h3>
            <p className="text-gray-700">
              By submitting content to our Website, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display that content in connection with operating the directory.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Content Moderation</h3>
            <p className="text-gray-700">
              We reserve the right to review, edit, or remove any content that we determine, in our sole discretion, violates these Terms or is otherwise objectionable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Premium Listings and Subscriptions</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.1 Service Tiers</h3>
            <p className="text-gray-700">
              We offer various premium listing tiers with enhanced features including priority placement, additional photos, detailed descriptions, and promotional opportunities.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.2 Payment Terms</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Premium listing fees are billed on a monthly or annual basis as selected</li>
              <li>All fees are in Canadian dollars (CAD) unless otherwise stated</li>
              <li>Payment is due at the beginning of each billing period</li>
              <li>We accept major credit cards and other payment methods as indicated on our Website</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.3 Refund Policy</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Monthly subscriptions may be cancelled at any time, with access continuing until the end of the current billing period</li>
              <li>Annual subscriptions are non-refundable except as required by applicable law</li>
              <li>Refund requests must be submitted within 14 days of initial purchase for consideration</li>
              <li>No refunds will be provided for partial months or unused portions of a subscription</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.4 Cancellation</h3>
            <p className="text-gray-700">
              You may cancel your premium listing subscription at any time through your account settings or by contacting us directly. Cancellations take effect at the end of the current billing period.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.5 Price Changes</h3>
            <p className="text-gray-700">
              We reserve the right to modify our pricing with 30 days' notice to existing subscribers. Continued use of the service after price changes constitutes acceptance of the new pricing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Accuracy of Information</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.1 Directory Listings</h3>
            <p className="text-gray-700">
              While we strive to maintain accurate and current information, we do not guarantee the accuracy, completeness, or reliability of any listings. Facility information, hours of operation, pricing, and services are subject to change without notice.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">6.2 User Responsibility</h3>
            <p className="text-gray-700">
              Users should verify all information directly with the facility before visiting or making commitments. We are not responsible for any errors, omissions, or changes in facility information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Links</h2>
            <p className="text-gray-700">
              Our Website may contain links to third-party websites or services. We are not responsible for the content, privacy practices, or terms of service of any third-party sites. Your use of third-party websites is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">8.1 Website Content</h3>
            <p className="text-gray-700">
              All content on this Website, including text, graphics, logos, images, and software, is the property of Archery Ranges Canada or its content suppliers and is protected by Canadian and international copyright laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">8.2 Trademarks</h3>
            <p className="text-gray-700">
              "Archery Ranges Canada" and related logos are trademarks. Unauthorized use of these trademarks is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-gray-700 mb-4 font-semibold">
              THE WEBSITE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
            <p className="text-gray-700 mb-3">We do not warrant that:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>The Website will be uninterrupted, secure, or error-free</li>
              <li>The information provided will be accurate or reliable</li>
              <li>Any defects will be corrected</li>
              <li>The Website is free from viruses or harmful components</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ARCHERY RANGES CANADA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE WEBSITE.
            </p>
            <p className="text-gray-700 mt-4">
              Our total liability to you for any claims arising from your use of the Website shall not exceed the amount you paid us in the twelve (12) months preceding the claim, or CAD $100, whichever is greater.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
            <p className="text-gray-700 mb-3">You agree to indemnify, defend, and hold harmless Archery Ranges Canada and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of or in any way connected with:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Your access to or use of the Website</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Any content you submit to the Website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Privacy</h2>
            <p className="text-gray-700">
              Your use of the Website is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Modifications to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on this page with a new "Last Updated" date. Your continued use of the Website after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law and Jurisdiction</h2>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of Canada, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Website shall be subject to the exclusive jurisdiction of the courts located in Canada.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Severability</h2>
            <p className="text-gray-700">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Entire Agreement</h2>
            <p className="text-gray-700">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Archery Ranges Canada regarding your use of the Website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-900">Archery Ranges Canada</p>
              <p className="text-gray-700">Email: archeryrangescanada@gmail.com</p>
              <p className="text-gray-700">Website: archeryrangescanada.ca</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Acknowledgment</h2>
            <p className="text-gray-700 font-semibold">
              BY USING THIS WEBSITE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS AND CONDITIONS, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
