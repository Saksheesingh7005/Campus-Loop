import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from './CategoryIcon';
import {
  X,
  Send,
  MessageSquare,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  User,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export function ChatModal({ request, isOpen, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const isLender = user && request && user.id === request.ownerId;
  const peerName = isLender ? request?.borrowerName : request?.ownerName;
  const peerRole = isLender ? 'Borrower' : 'Lender';
  const peerDept = isLender ? request?.borrowerDept : '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (isInitial = false) => {
    if (!request) return;
    if (isInitial) setLoading(true);
    try {
      const res = await api.getRequestMessages(request.id);
      setMessages(res.messages || []);
    } catch (err) {
      console.warn('Failed to fetch messages:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && request) {
      fetchMessages(true);
      // Auto-refresh chat every 3 seconds while open
      const interval = setInterval(() => {
        fetchMessages(false);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, request?.id]);

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading]);

  if (!isOpen || !request) return null;

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await api.sendRequestMessage(request.id, text);
      setMessages(res.allMessages || [...messages, res.newMessage]);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      alert('Failed to send message: ' + (err.message || 'Please try again.'));
    } finally {
      setSending(false);
    }
  };

  const handleQuickChip = (chipText) => {
    setInputText(chipText);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '620px', height: '620px', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-cyan-subtle)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}
            >
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Chat with {peerName}
                </h3>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                  {peerRole}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Item: <strong>{request.resourceName}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <StatusBadge status={request.status} />
            <button className="btn btn-ghost btn-sm" onClick={onClose} title="Close Chat">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pickup Location Announcement Strip */}
        <div
          style={{
            padding: '0.5rem 1.25rem',
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            borderBottom: '1px solid var(--accent-cyan-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin className="w-3.5 h-3.5 text-cyan" />
            <span>
              Campus Pickup: <strong style={{ color: 'var(--text-primary)' }}>{request.pickupLocation}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
            <Clock className="w-3 h-3" />
            <span>Duration: {request.days} days</span>
          </div>
        </div>

        {/* Messages Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            backgroundColor: '#0a0e16'
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <RefreshCw className="w-6 h-6 text-cyan animate-spin" style={{ margin: '0 auto 0.5rem' }} />
              <div>Connecting to peer chat...</div>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <MessageSquare className="w-8 h-8 text-cyan" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Start coordinating your item handover!
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Agree on an exact campus meeting spot (e.g. library reception, hostel lobby, canteen).
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = user && msg.senderId === user.id;
              const timeFormatted = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={msg.id || index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    alignSelf: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <span>{isMe ? 'You' : msg.senderName}</span>
                    {msg.senderRole && (
                      <span style={{ color: 'var(--accent-cyan)', fontSize: '0.68rem' }}>
                        ({msg.senderRole})
                      </span>
                    )}
                    <span>• {timeFormatted}</span>
                  </div>

                  <div
                    style={{
                      padding: '0.65rem 0.95rem',
                      borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      backgroundColor: isMe ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-surface-elevated)',
                      border: isMe ? '1px solid var(--accent-cyan-border)' : '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      lineHeight: '1.45',
                      wordBreak: 'break-word',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          <button
            type="button"
            className="cat-pill"
            style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}
            onClick={() => handleQuickChip("📍 I've arrived at the handover point!")}
          >
            📍 Arrived at pickup point
          </button>
          <button
            type="button"
            className="cat-pill"
            style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}
            onClick={() => handleQuickChip('📚 Bringing my college ID card')}
          >
            📚 Bringing ID card
          </button>
          <button
            type="button"
            className="cat-pill"
            style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}
            onClick={() => handleQuickChip('⏰ Can we meet 15 mins later?')}
          >
            ⏰ 15 mins later?
          </button>
          <button
            type="button"
            className="cat-pill"
            style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}
            onClick={() => handleQuickChip('👍 Received in good condition, thanks!')}
          >
            👍 Safely received
          </button>
        </div>

        {/* Input Footer */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder={`Message ${peerName}... (Press Enter to send)`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ flex: 1, padding: '0.6rem 0.85rem' }}
            disabled={sending}
            autoFocus
          />

          <button
            type="submit"
            className="btn btn-primary btn-sm"
            style={{ padding: '0.6rem 1rem' }}
            disabled={!inputText.trim() || sending}
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
