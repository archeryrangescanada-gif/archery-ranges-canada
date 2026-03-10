import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          About Canada's Most Comprehensive Archery Range Directory
        </h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Complete Guide to Finding Archery Ranges, Clubs, and Lessons Across Canada</h2>
            <p className="text-gray-700">
              Archery Ranges Canada is the most comprehensive online directory of archery facilities in the country. Whether you're searching for archery ranges near you, looking for beginner archery lessons, or trying to find specialized facilities for Olympic recurve, traditional archery, or compound bow shooting, we help Canadians discover and connect with quality archery facilities from coast to coast.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why We Built This Directory</h2>
            <p className="text-gray-700">
              Finding a quality archery range in Canada shouldn't be difficult. Yet for years, archers across the country have struggled to locate facilities near them. Information was scattered across outdated websites, buried in Facebook groups, or simply didn't exist online at all.
            </p>
            <p className="text-gray-700 mt-4">
              We created Archery Ranges Canada to solve this problem. Our comprehensive archery directory brings together verified information about indoor archery ranges, outdoor archery clubs, mobile archery services, and archery pro shops from British Columbia to Newfoundland—all in one easy-to-use platform.
            </p>
            <p className="text-gray-700 mt-4">
              Whether you're in Toronto, Vancouver, Montreal, Calgary, or a small town anywhere in Canada, we're making it easier to find archery facilities in your area.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Makes Archery Ranges Canada Different</h2>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Verified & Up-to-Date Listings</h3>
            <p className="text-gray-700 mb-3">We don't just scrape data from the internet. Every archery range, club, and facility in our directory is individually researched and verified. We ensure you get accurate information about:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Facility hours and contact details</li>
              <li>Available archery disciplines (Olympic recurve, compound, traditional, crossbow)</li>
              <li>Lesson availability and pricing</li>
              <li>Equipment rental options</li>
              <li>Range specifications (indoor vs outdoor, distance, number of lanes)</li>
              <li>Membership requirements</li>
              <li>Drop-in availability</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Complete Provincial Coverage</h3>
            <p className="text-gray-700 mb-3">We're systematically mapping every archery facility across Canada, with coverage in all provinces and territories.</p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Helping You Find the Right Type of Facility</h3>
            <p className="text-gray-700 mb-3">Different archers have different needs. Our directory helps you find:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Indoor archery ranges</strong> - Perfect for year-round shooting regardless of weather</li>
              <li><strong>Outdoor archery ranges</strong> - For longer distances and field archery experiences</li>
              <li><strong>Archery clubs</strong> - Community-focused facilities with membership options</li>
              <li><strong>Commercial archery ranges</strong> - Professional facilities with equipment rental and lessons</li>
              <li><strong>3D archery courses</strong> - For bowhunters and those who enjoy realistic target practice</li>
              <li><strong>Traditional archery schools</strong> - Specialized instruction in historical archery techniques</li>
              <li><strong>Youth archery programs</strong> - Facilities offering kids' archery lessons and camps</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">Supporting Every Archery Discipline</h3>
            <p className="text-gray-700 mb-3">Whether you practice Olympic recurve, compound bow, traditional archery, barebow, or crossbow, our directory identifies which facilities support your specific discipline. We also highlight ranges that offer:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Beginner archery lessons</li>
              <li>Advanced coaching and competitive training</li>
              <li>Bowhunting preparation courses</li>
              <li>Adaptive archery programs</li>
              <li>Family-friendly drop-in sessions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Commitment to the Archery Community</h2>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">To Archers and Beginners</h3>
            <p className="text-gray-700">
              We're committed to maintaining the most accurate, comprehensive directory of archery facilities in Canada. If you're wondering "where can I try archery near me?" or "which archery range offers equipment rental?", our directory is designed to answer those questions immediately.
            </p>
            <p className="text-gray-700 mt-4">
              Can't find what you're looking for? <Link href="/contact" className="text-green-600 hover:underline">Let us know</Link> and we'll research facilities in your area.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">To Archery Range Owners and Clubs</h3>
            <p className="text-gray-700">
              We're here to help you connect with more archers in your community. Our platform showcases what makes your facility special and helps you reach people actively searching for archery opportunities.
            </p>
            <p className="text-gray-700 mt-4">
              We offer a range of features designed to increase your visibility and help you attract new members or customers.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">To the Sport of Archery in Canada</h3>
            <p className="text-gray-700">
              We believe archery is one of the most accessible and rewarding sports anyone can try. By making it easier for Canadians to find archery ranges and get started with lessons, we're investing in the future growth of archery across the country.
            </p>
            <p className="text-gray-700 mt-4">
              Our directory supports provincial archery associations, helps new archers discover the sport, and connects experienced archers with new facilities when they travel or relocate.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Verify Our Listings</h2>
            <p className="text-gray-700 mb-3">Quality matters. Every archery facility in our directory goes through our verification process:</p>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li><strong>Research</strong> - We identify archery ranges through provincial associations, archer recommendations, and systematic provincial searches</li>
              <li><strong>Verification</strong> - We confirm facility details through direct contact, website review, and community feedback</li>
              <li><strong>Updates</strong> - We regularly review and update listings to ensure information remains current</li>
              <li><strong>Community Input</strong> - We encourage archers to report changes or suggest facilities we're missing</li>
            </ol>
            <p className="text-gray-700 mt-4">
              This ensures when you search for "archery ranges near me" on our platform, you get reliable, current information.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Coverage Areas</h2>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Major Cities with Complete Archery Range Listings:</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Toronto area archery ranges</strong> - GTA, Mississauga, Brampton, Markham, Vaughan</li>
              <li><strong>Vancouver area archery ranges</strong> - Lower Mainland, Surrey, Burnaby, Richmond</li>
              <li><strong>Montreal area archery ranges</strong> - Greater Montreal, Laval, Longueuil</li>
              <li><strong>Calgary archery ranges</strong> - Calgary and surrounding areas</li>
              <li><strong>Ottawa archery ranges</strong> - Ottawa-Gatineau region</li>
              <li><strong>Edmonton archery ranges</strong> - Edmonton and area</li>
              <li>Plus comprehensive coverage in smaller cities and rural areas across Canada</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">How do I find archery ranges near me?</h3>
                <p className="text-gray-700">
                  Use our search function on the <Link href="/" className="text-green-600 hover:underline">homepage</Link> to find archery facilities by city, province, or postal code. Our directory includes indoor ranges, outdoor clubs, and mobile archery services across Canada.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Do archery ranges provide equipment rental?</h3>
                <p className="text-gray-700">
                  Many facilities offer equipment rental for beginners. Each listing in our directory indicates whether rental equipment is available, along with pricing information when provided by the facility.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Can I take archery lessons as a complete beginner?</h3>
                <p className="text-gray-700">
                  Absolutely! Most archery ranges and clubs offer beginner lessons. Our directory clearly identifies facilities that provide instruction, from introductory lessons to advanced coaching.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">What's the difference between an archery range and an archery club?</h3>
                <p className="text-gray-700">
                  Archery ranges are typically commercial facilities offering drop-in shooting, rentals, and lessons. Archery clubs are often membership-based organizations focused on community and competitive shooting. Many facilities operate as both. Our listings specify which model each facility uses.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">How much does it cost to try archery?</h3>
                <p className="text-gray-700">
                  Introductory archery sessions typically range from $20-$50 for a beginner lesson with equipment rental. Many ranges offer trial sessions or "come and try" events. Check individual facility listings for current pricing.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">What age can kids start archery?</h3>
                <p className="text-gray-700">
                  Most facilities accept children as young as 8-10 years old, though some offer programs for younger kids. Youth archery programs are increasingly popular across Canada. Check facility listings for age requirements and youth programs.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Can I practice archery year-round in Canada?</h3>
                <p className="text-gray-700">
                  Yes! Indoor archery ranges operate year-round regardless of weather. Many archers practice indoors during winter and outdoors during summer months. Our directory identifies both indoor and outdoor facilities.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Is your directory free to use?</h3>
                <p className="text-gray-700">
                  Yes! Archery Ranges Canada is completely free for archers searching for facilities. Range owners can claim free basic listings, with optional premium features available for enhanced visibility.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-gray-700 mb-4">
              Have a suggestion? Know of an archery range we're missing? Want to learn more about premium listings for your facility?
            </p>
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Contact Us:</strong> <Link href="/contact" className="text-green-600 hover:underline">Submit a contact form</Link>
              </p>
              <p className="text-gray-700">
                <strong>Missing A Range?</strong> Fill out the form on our <Link href="/" className="text-green-600 hover:underline">homepage</Link>
              </p>
            </div>
            <p className="text-gray-700 mt-6">
              We'd love to hear from you. Whether you're an archer looking for the perfect range or a facility owner wanting to improve your listing, we're here to help grow archery across Canada.
            </p>
          </section>

          <section className="border-t border-gray-200 pt-8 mt-8">
            <p className="text-gray-600 italic text-sm">
              Archery Ranges Canada is an independent directory service dedicated to promoting archery across the country. We are not affiliated with any specific archery organization, though we work closely with archery ranges, clubs, and provincial associations to ensure our information serves the community.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
