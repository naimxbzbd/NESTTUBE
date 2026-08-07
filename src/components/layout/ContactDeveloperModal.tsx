import React, { useState } from 'react';
import { X, Mail, Code2, Send, Check, Copy, Phone, ExternalLink, Sparkles, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContactDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactDeveloperModal({ isOpen, onClose }: ContactDeveloperModalProps) {
  const [formData, setFormData] = useState({ name: 'Naim Xbz', email: 'naimxbz@gmail.com', subject: 'Feedback / Inquiry', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen) return null;

  const developerEmail = 'naimxbz@gmail.com';
  const developerPhone = '+8801703223141';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(developerEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(developerPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setFormData({ name: 'Naim Xbz', email: 'naimxbz@gmail.com', subject: 'Feedback / Inquiry', message: '' });
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#181818] border border-neutral-200 dark:border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-neutral-900 dark:text-white flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-[#212121]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Developer Profile & Contact</h2>
              <p className="text-xs text-neutral-500 dark:text-white/60">Connect with Naim Xbz (@naimxbz)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 dark:text-white/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Developer Quick Profile Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 dark:border-blue-400/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
                NX
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">Naim Xbz</h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider">
                    Lead Developer
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-white/60">@naimxbz</p>
                <div className="space-y-0.5 mt-1">
                  <p className="text-xs text-neutral-600 dark:text-white/80 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-mono text-[11px] font-semibold">{developerEmail}</span>
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-white/80 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span className="font-mono text-[11px] font-semibold">{developerPhone}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
              <Link
                to="/channel/UCX6OQ3DkcsbYNE6H8uQQuVA"
                onClick={onClose}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit Channel</span>
              </Link>

              <button
                onClick={handleCopyEmail}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 hover:bg-neutral-100 dark:hover:bg-white/20 border border-neutral-200 dark:border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">Email Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social / Direct Action Links */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <a
              href={`mailto:${developerEmail}`}
              className="p-3 rounded-xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
            >
              <Mail className="w-4 h-4 text-red-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold truncate">Direct Email</div>
                <div className="text-[10px] font-mono text-neutral-500 dark:text-white/50 truncate">{developerEmail}</div>
              </div>
            </a>

            <a
              href={`tel:${developerPhone}`}
              className="p-3 rounded-xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
            >
              <Phone className="w-4 h-4 text-green-500 shrink-0" />
              <div className="min-w-0">
                <div className="font-bold truncate">Phone Call</div>
                <div className="text-[10px] font-mono text-neutral-500 dark:text-white/50 truncate">{developerPhone}</div>
              </div>
            </a>
          </div>

          {/* Feedback Form */}
          {isSent ? (
            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 mx-auto flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-green-600 dark:text-green-400">Message Sent Successfully!</h4>
              <p className="text-xs text-neutral-600 dark:text-white/70">
                Thank you for your feedback. The developer will review it shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <div className="text-xs font-bold text-neutral-700 dark:text-white/80 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Send a message directly to the developer
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-white/60 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Naim Xbz"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-white/60 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    placeholder="naimxbz@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-white/60 mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Feedback / Inquiry">General Feedback / Inquiry</option>
                  <option value="Bug Report">Report a Bug</option>
                  <option value="Feature Request">Request a New Feature</option>
                  <option value="Collaboration">Collaboration Opportunities</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-white/60 mb-1">Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type your message or bug details here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-white/10 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || !formData.message.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  {isSending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
