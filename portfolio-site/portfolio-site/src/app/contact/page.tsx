'use client';

import { useState } from 'react';
import { Header, Footer, SectionHeader } from '@/components';
import { Send, Check, AlertCircle } from 'lucide-react';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface FormData {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    // TODO: 実際のAPI呼び出し
    // 仮の送信処理（デモ用）
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 成功をシミュレート
    setStatus('success');
    setFormData({
      name: '',
      email: '',
      company: '',
      subject: '',
      message: '',
    });
  };

  const subjectOptions = [
    { value: '', label: '選択してください' },
    { value: 'project', label: 'プロジェクトのご依頼' },
    { value: 'collaboration', label: 'コラボレーションのご提案' },
    { value: 'interview', label: '取材・インタビュー' },
    { value: 'other', label: 'その他' },
  ];

  return (
    <>
      <Header />
      
      <main className="container-custom py-12">
        <SectionHeader title="Contact" number="01" className="mb-12" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 左側：説明 */}
          <div>
            <h2 
              className="text-3xl md:text-4xl uppercase mb-6"
              style={{ fontFamily: "'Archivo Black', sans-serif" }}
            >
              Let&apos;s Create<br />Something<br />Amazing
            </h2>
            
            <p className="text-lg leading-loose mb-8">
              お仕事のご依頼やご相談、コラボレーションのご提案など、
              お気軽にお問い合わせください。
              <br /><br />
              通常、2〜3営業日以内にご返信いたします。
            </p>

            {/* 連絡先情報 */}
            <div className="border-4 border-black p-6 bg-amber-400">
              <h3 className="text-xl font-bold uppercase mb-4">Direct Contact</h3>
              <ul className="space-y-2">
                <li>
                  <span className="font-bold">Email:</span>{' '}
                  <a href="mailto:hello@example.com" className="underline hover:no-underline">
                    hello@example.com
                  </a>
                </li>
                <li>
                  <span className="font-bold">Twitter:</span>{' '}
                  <a href="https://twitter.com/example" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                    @example
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* 右側：フォーム */}
          <div className="border-4 border-black p-6 md:p-8 shadow-[8px_8px_0_0_#000]">
            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} />
                </div>
                <h3 className="text-2xl font-bold uppercase mb-4">Thank You!</h3>
                <p className="text-gray-600 mb-6">
                  お問い合わせを受け付けました。<br />
                  2〜3営業日以内にご返信いたします。
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="btn-brutal"
                >
                  新しいお問い合わせ
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 名前 */}
                <div>
                  <label htmlFor="name" className="block text-sm font-bold uppercase mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-brutal"
                    placeholder="山田 太郎"
                  />
                </div>

                {/* メールアドレス */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold uppercase mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-brutal"
                    placeholder="example@email.com"
                  />
                </div>

                {/* 会社名 */}
                <div>
                  <label htmlFor="company" className="block text-sm font-bold uppercase mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="input-brutal"
                    placeholder="株式会社〇〇"
                  />
                </div>

                {/* 件名 */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-bold uppercase mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="input-brutal"
                  >
                    {subjectOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* メッセージ */}
                <div>
                  <label htmlFor="message" className="block text-sm font-bold uppercase mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="textarea-brutal"
                    placeholder="お問い合わせ内容をご記入ください..."
                    rows={6}
                  />
                </div>

                {/* エラーメッセージ */}
                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 border-2 border-red-500">
                    <AlertCircle size={20} />
                    <span>送信に失敗しました。もう一度お試しください。</span>
                  </div>
                )}

                {/* 送信ボタン */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn-brutal btn-brutal-accent w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      送信する
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  送信いただいた情報は、お問い合わせへの対応にのみ使用いたします。
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
