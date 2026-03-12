'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ContactFormProps {
  rangeId: string;
  rangeName: string;
  whatsappNumber?: string | null;
  contactEmail?: string | null;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm({ rangeId, rangeName, whatsappNumber, contactEmail }: ContactFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rangeId, ...formData }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-stone-800 mb-2">{t('rangePage.messageSent')}</h3>
          <p className="text-stone-600">{t('rangePage.inquirySentTo', { name: rangeName })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <div className="p-6 bg-gradient-to-br from-stone-800 to-stone-900">
        <h3 className="text-lg font-semibold text-white mb-1">{t('rangePage.sendMessage')}</h3>
        <p className="text-stone-300 text-sm">{t('rangePage.haveAQuestion')}</p>
      </div>

      {whatsappNumber && (
        <div className="p-6 pb-0 space-y-4">
          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 text-center">
            <h4 className="font-semibold text-emerald-800 mb-2">{t('rangePage.chatDirectly', { name: rangeName })}</h4>
            <p className="text-sm text-emerald-600 mb-4">{t('rangePage.chatDirectlyDesc')}</p>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl shadow-sm transition-all duration-200"
            >
              <Send className="w-5 h-5" />
              {t('rangePage.chatOnWhatsApp')}
            </a>
          </div>
        </div>
      )}

      {contactEmail ? (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {whatsappNumber && (
            <div className="flex items-center gap-4 mb-2">
              <div className="h-px bg-stone-200 flex-1"></div>
              <span className="text-stone-400 text-sm font-medium">{t('rangePage.orSendAnEmail')}</span>
              <div className="h-px bg-stone-200 flex-1"></div>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">{t('rangePage.failedToSend')}</p>
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1.5">
              {t('rangePage.yourName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-stone-800 placeholder-stone-400"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
              {t('rangePage.emailAddress')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-stone-800 placeholder-stone-400"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1.5">
              {t('rangePage.phoneNumber')} <span className="text-stone-400">{t('rangePage.optional')}</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-stone-800 placeholder-stone-400"
              placeholder="(416) 555-0123"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-stone-700 mb-1.5">
              {t('rangePage.subject')}
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-stone-800 bg-white"
            >
              <option value="">{t('rangePage.selectTopic')}</option>
              <option value="general">{t('rangePage.topics.general')}</option>
              <option value="membership">{t('rangePage.topics.membership')}</option>
              <option value="lessons">{t('rangePage.topics.lessons')}</option>
              <option value="events">{t('rangePage.topics.events')}</option>
              <option value="equipment">{t('rangePage.topics.equipment')}</option>
              <option value="booking">{t('rangePage.topics.booking')}</option>
              <option value="other">{t('rangePage.topics.other')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1.5">
              {t('rangePage.yourMessage')} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-stone-800 placeholder-stone-400 resize-none"
              placeholder={t('rangePage.tellWhatYouLikeToKnow')}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-semibold rounded-xl shadow-sm transition-all duration-200 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('rangePage.sending')}
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {t('rangePage.sendMessage')}
              </>
            )}
          </button>

          <p className="text-xs text-stone-500 text-center">{t('rangePage.sharedWithOnly', { name: rangeName })}</p>
        </form>
      ) : (
        !whatsappNumber && (
          <div className="p-6 text-center text-stone-500">
            {t('rangePage.noContactMethodYet')}
          </div>
        )
      )}
    </div>
  );
}