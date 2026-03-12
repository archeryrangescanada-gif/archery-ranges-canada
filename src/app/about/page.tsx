'use client';

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          {t('aboutPage.title')}
        </h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('aboutPage.guideTitle')}</h2>
            <p className="text-gray-700">
              {t('aboutPage.guideDesc')}
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('aboutPage.whyBuiltTitle')}</h2>
            <p className="text-gray-700">
              {t('aboutPage.whyBuiltP1')}
            </p>
            <p className="text-gray-700 mt-4">
              {t('aboutPage.whyBuiltP2')}
            </p>
            <p className="text-gray-700 mt-4">
              {t('aboutPage.whyBuiltP3')}
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('aboutPage.whatMakesDiffTitle')}</h2>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">{t('aboutPage.verifiedTitle')}</h3>
            <p className="text-gray-700 mb-3">{t('aboutPage.verifiedDesc')}</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>{t('aboutPage.verifiedL1')}</li>
              <li>{t('aboutPage.verifiedL2')}</li>
              <li>{t('aboutPage.verifiedL3')}</li>
              <li>{t('aboutPage.verifiedL4')}</li>
              <li>{t('aboutPage.verifiedL5')}</li>
              <li>{t('aboutPage.verifiedL6')}</li>
              <li>{t('aboutPage.verifiedL7')}</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">{t('aboutPage.coverageTitle')}</h3>
            <p className="text-gray-700 mb-3">{t('aboutPage.coverageDesc')}</p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">{t('aboutPage.findRightTitle')}</h3>
            <p className="text-gray-700 mb-3">{t('aboutPage.findRightDesc')}</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>{t('aboutPage.findRightL1')}</strong>{t('aboutPage.findRightL1Desc')}</li>
              <li><strong>{t('aboutPage.findRightL2')}</strong>{t('aboutPage.findRightL2Desc')}</li>
              <li><strong>{t('aboutPage.findRightL3')}</strong>{t('aboutPage.findRightL3Desc')}</li>
              <li><strong>{t('aboutPage.findRightL4')}</strong>{t('aboutPage.findRightL4Desc')}</li>
              <li><strong>{t('aboutPage.findRightL5')}</strong>{t('aboutPage.findRightL5Desc')}</li>
              <li><strong>{t('aboutPage.findRightL6')}</strong>{t('aboutPage.findRightL6Desc')}</li>
              <li><strong>{t('aboutPage.findRightL7')}</strong>{t('aboutPage.findRightL7Desc')}</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">{t('aboutPage.supportTitle')}</h3>
            <p className="text-gray-700 mb-3">{t('aboutPage.supportDesc')}</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>{t('aboutPage.supportL1')}</li>
              <li>{t('aboutPage.supportL2')}</li>
              <li>{t('aboutPage.supportL3')}</li>
              <li>{t('aboutPage.supportL4')}</li>
              <li>{t('aboutPage.supportL5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('aboutPage.commitmentTitle')}</h2>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">{t('aboutPage.archersTitle')}</h3>
            <p className="text-gray-700">
              {t('aboutPage.archersDesc1')}
            </p>
            <p className="text-gray-700 mt-4">
              {t('aboutPage.archersDesc2Lead')}<Link href="/contact" className="text-green-600 hover:underline">{t('aboutPage.archersDesc2Link')}</Link>{t('aboutPage.archersDesc2Trail')}
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">{t('aboutPage.ownersTitle')}</h3>
            <p className="text-gray-700">
              {t('aboutPage.ownersDesc1')}
            </p>
            <p className="text-gray-700 mt-4">
              {t('aboutPage.ownersDesc2')}
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-3 mt-6">{t('aboutPage.sportTitle')}</h3>
            <p className="text-gray-700">
              {t('aboutPage.sportDesc1')}
            </p>
            <p className="text-gray-700 mt-4">
              {t('aboutPage.sportDesc2')}
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('aboutPage.verifyTitle')}</h2>
            <p className="text-gray-700 mb-3">{t('aboutPage.verifyDesc')}</p>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li><strong>{t('aboutPage.verifyL1Lead')}</strong>{t('aboutPage.verifyL1Trail')}</li>
              <li><strong>{t('aboutPage.verifyL2Lead')}</strong>{t('aboutPage.verifyL2Trail')}</li>
              <li><strong>{t('aboutPage.verifyL3Lead')}</strong>{t('aboutPage.verifyL3Trail')}</li>
              <li><strong>{t('aboutPage.verifyL4Lead')}</strong>{t('aboutPage.verifyL4Trail')}</li>
            </ol>
            <p className="text-gray-700 mt-4">
              {t('aboutPage.verifyBottom')}
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('aboutPage.coverageAreasTitle')}</h2>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">{t('aboutPage.coverageMajor')}</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>{t('aboutPage.covL1Lead')}</strong>{t('aboutPage.covL1Trail')}</li>
              <li><strong>{t('aboutPage.covL2Lead')}</strong>{t('aboutPage.covL2Trail')}</li>
              <li><strong>{t('aboutPage.covL3Lead')}</strong>{t('aboutPage.covL3Trail')}</li>
              <li><strong>{t('aboutPage.covL4Lead')}</strong>{t('aboutPage.covL4Trail')}</li>
              <li><strong>{t('aboutPage.covL5Lead')}</strong>{t('aboutPage.covL5Trail')}</li>
              <li><strong>{t('aboutPage.covL6Lead')}</strong>{t('aboutPage.covL6Trail')}</li>
              <li>{t('aboutPage.covL7')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('aboutPage.faqTitle')}</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('aboutPage.faqQ1')}</h3>
                <p className="text-gray-700">
                  {t('aboutPage.faqA1Lead')}<Link href="/" className="text-green-600 hover:underline">{t('aboutPage.faqA1Link')}</Link>{t('aboutPage.faqA1Trail')}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('aboutPage.faqQ2')}</h3>
                <p className="text-gray-700">
                  {t('aboutPage.faqA2')}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('aboutPage.faqQ3')}</h3>
                <p className="text-gray-700">
                  {t('aboutPage.faqA3')}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('aboutPage.faqQ4')}</h3>
                <p className="text-gray-700">
                  {t('aboutPage.faqA4')}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('aboutPage.faqQ5')}</h3>
                <p className="text-gray-700">
                  {t('aboutPage.faqA5')}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('aboutPage.faqQ6')}</h3>
                <p className="text-gray-700">
                  {t('aboutPage.faqA6')}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('aboutPage.faqQ7')}</h3>
                <p className="text-gray-700">
                  {t('aboutPage.faqA7')}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('aboutPage.faqQ8')}</h3>
                <p className="text-gray-700">
                  {t('aboutPage.faqA8')}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('aboutPage.contactTitle')}</h2>
            <p className="text-gray-700 mb-4">
              {t('aboutPage.contactDesc')}
            </p>
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>{t('aboutPage.contactSubmitBold')}</strong><Link href="/contact" className="text-green-600 hover:underline">{t('aboutPage.contactSubmitLink')}</Link>
              </p>
              <p className="text-gray-700">
                <strong>{t('aboutPage.contactMissingBold')}</strong>{t('aboutPage.contactMissingLead')}<Link href="/" className="text-green-600 hover:underline">{t('aboutPage.contactMissingLink')}</Link>
              </p>
            </div>
            <p className="text-gray-700 mt-6">
              {t('aboutPage.contactEnd')}
            </p>
          </section>

          <section className="border-t border-gray-200 pt-8 mt-8">
            <p className="text-gray-600 italic text-sm">
              {t('aboutPage.disclaimer')}
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
