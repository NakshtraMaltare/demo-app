import { AlertCircle, ImagePlus, Loader2, RotateCcw, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import type { ChatMessage, ChatMode, PlantCareProfile } from '../types/plant';
import { preparePlantImage } from '../utils/image';
import type { PreparedImage } from '../utils/image';

interface BotanistChatProps {
  messages: ChatMessage[];
  activePlant: PlantCareProfile | null;
  chatMode: ChatMode;
  isSending: boolean;
  errorMessage: string | null;
  onChangeMode: (mode: ChatMode) => void;
  onClearContext: () => void;
  onResetChat: () => void;
  onSendMessage: (payload: {
    text: string;
    imageBase64?: string;
    mimeType?: string;
    previewUrl?: string;
  }) => void;
}

function FormattedProse({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const content = isBullet ? trimmed.slice(2) : trimmed;
        const segments = content.split(/(\*\*[^*]+\*\*)/g);

        const rendered = segments.map((seg, j) => {
          if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
            return (
              <strong key={j} className="font-semibold text-[#131D16]">
                {seg.slice(2, -2)}
              </strong>
            );
          }
          return <span key={j}>{seg}</span>;
        });

        if (isBullet) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1">
              <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1B5E3A]" />
              <span>{rendered}</span>
            </div>
          );
        }

        return <p key={i}>{rendered}</p>;
      })}
    </div>
  );
}

export function BotanistChat({
  messages,
  activePlant,
  chatMode,
  isSending,
  errorMessage,
  onChangeMode,
  onClearContext,
  onResetChat,
  onSendMessage,
}: BotanistChatProps) {
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<PreparedImage | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length, isSending]);

  async function handleAttachFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAttachError(null);
    try {
      const prepared = await preparePlantImage(file);
      setAttachedImage(prepared);
    } catch (err) {
      setAttachError(err instanceof Error ? err.message : 'Unable to attach image.');
    }
  }

  function submitCurrentMessage() {
    const trimmed = input.trim();
    if ((!trimmed && !attachedImage) || isSending) return;
    onSendMessage({
      text: trimmed || 'Can you inspect this follow-up plant photo?',
      imageBase64: attachedImage?.base64,
      mimeType: attachedImage?.mimeType,
      previewUrl: attachedImage?.dataUrl,
    });
    setInput('');
    setAttachedImage(null);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitCurrentMessage();
    }
  }

  const starterPrompts = activePlant
    ? [
        `How should I adjust watering for my ${activePlant.commonName} in winter?`,
        `What is the best potting soil mix for ${activePlant.scientificName}?`,
        `How can I propagate this ${activePlant.commonName} safely?`,
      ]
    : [
        'Why are the lower leaves on my houseplant turning yellow?',
        'How do I treat fungus gnats without harsh chemicals?',
        'What peat-free potting mix works best for tropical aroids?',
      ];

  return (
    <section id="chat" className="mx-auto max-w-[1280px] px-6 pt-4 pb-16">
      <div className="overflow-hidden rounded-xl border border-[#E2E7E1] bg-white">
        {/* Chat Header */}
        <div className="flex flex-col gap-4 border-b border-[#E2E7E1] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#526056]">
              Multi-Turn Horticultural Consultation
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[#131D16]">
              Botanist Chat
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Segmented Control */}
            <div className="flex items-center gap-1 rounded-lg bg-[#EDF2EC] p-1">
              <button
                type="button"
                onClick={() => onChangeMode('thorough')}
                className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  chatMode === 'thorough'
                    ? 'bg-white text-[#131D16] shadow-xs'
                    : 'text-[#526056] hover:text-[#131D16]'
                }`}
              >
                Thorough Advice
              </button>
              <button
                type="button"
                onClick={() => onChangeMode('quick')}
                className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  chatMode === 'quick'
                    ? 'bg-white text-[#131D16] shadow-xs'
                    : 'text-[#526056] hover:text-[#131D16]'
                }`}
              >
                Quick Answer
              </button>
            </div>

            {messages.length > 0 && (
              <button
                type="button"
                onClick={onResetChat}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[#CBD4CA] bg-white px-3 py-1.5 text-xs font-medium text-[#435147] hover:bg-[#F2F5F2] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>New Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Plant Context Strip */}
        {activePlant && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E7E1] bg-[#F7FAF7] px-6 py-2.5 text-xs text-[#435147]">
            <div>
              <span className="font-medium text-[#131D16]">Active Specimen Context: </span>
              <span>
                {activePlant.commonName} ({activePlant.scientificName}) · Status:{' '}
                {activePlant.healthAssessment.status}
              </span>
            </div>
            <button
              type="button"
              onClick={onClearContext}
              className="font-medium text-[#526056] underline underline-offset-4 hover:text-[#131D16] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Detach Context
            </button>
          </div>
        )}

        {/* Scrollable Message Thread */}
        <div
          aria-live="polite"
          className="h-[420px] overflow-y-auto px-6 py-6 space-y-5 bg-[#FAFBF9]"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col justify-center">
              <div className="mx-auto max-w-xl text-center">
                <p className="font-serif text-xl font-medium text-[#131D16]">
                  Ask a question about soil, pests, pruning, or recovery
                </p>
                <p className="mt-2 text-sm text-[#526056]">
                  {activePlant
                    ? `Your conversation is linked to ${activePlant.commonName}. Ask follow-up questions or attach a closer photo of leaves or soil.`
                    : 'Start a multi-turn consultation with our horticulturist assistant, or select a question below.'}
                </p>
                <div className="mt-6 flex flex-col gap-2.5">
                  {starterPrompts.map((promptText) => (
                    <button
                      key={promptText}
                      type="button"
                      onClick={() => onSendMessage({ text: promptText })}
                      className="rounded-lg border border-[#E2E7E1] bg-white px-4 py-2.5 text-left text-sm text-[#131D16] transition-colors hover:border-[#1B5E3A] hover:bg-[#F7FAF7] cursor-pointer"
                    >
                      {promptText}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              const timeStr = new Date(msg.timestamp).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              });
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 sm:max-w-[75%] ${
                      isUser
                        ? 'bg-[#1B5E3A] text-white'
                        : 'border border-[#E2E7E1] bg-white text-[#131D16]'
                    }`}
                  >
                    {msg.imageUrl && (
                      <div className="mb-2.5 overflow-hidden rounded-lg border border-black/10">
                        <img
                          src={msg.imageUrl}
                          alt="Follow-up plant attachment"
                          referrerPolicy="no-referrer"
                          className="max-h-48 w-full object-cover"
                        />
                      </div>
                    )}
                    {isUser ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <FormattedProse text={msg.text} />
                    )}
                  </div>
                  <span className="mt-1.5 text-[11px] text-[#526056] tabular-nums">
                    {isUser ? 'You' : msg.modelLabel || 'Folia Botanist'} · {timeStr}
                  </span>
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex items-start">
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#E2E7E1] bg-white px-4 py-3 text-sm text-[#526056]">
                <Loader2 className="h-4 w-4 animate-spin text-[#1B5E3A]" aria-hidden="true" />
                <span>Consulting botanical references...</span>
              </div>
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* Error Display */}
        {(errorMessage || attachError) && (
          <div
            role="alert"
            className="flex items-center gap-2 border-t border-[#F3C6C6] bg-[#FEF6F6] px-6 py-2.5 text-xs text-[#991B1B]"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{errorMessage || attachError}</span>
          </div>
        )}

        {/* Composer */}
        <div className="border-t border-[#E2E7E1] bg-white p-4">
          {attachedImage && (
            <div className="mb-3 flex items-center justify-between rounded-lg border border-[#E2E7E1] bg-[#FAFBF9] px-3 py-2">
              <div className="flex items-center gap-3">
                <img
                  src={attachedImage.dataUrl}
                  alt="Attached follow-up preview"
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded object-cover"
                />
                <span className="text-xs font-medium text-[#131D16]">
                  {attachedImage.fileName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                aria-label="Remove attached photo"
                className="rounded p-1 text-[#526056] hover:bg-[#EDF2EC] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-3">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleAttachFile}
              className="sr-only"
              aria-label="Attach plant photo to chat"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              title="Attach follow-up plant photo"
              aria-label="Attach follow-up plant photo"
              className="inline-flex min-h-[42px] min-w-[42px] items-center justify-center rounded-lg border border-[#CBD4CA] bg-white text-[#435147] transition-colors hover:bg-[#F2F5F2] shrink-0 cursor-pointer"
            >
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
            </button>

            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activePlant
                  ? `Ask anything about ${activePlant.commonName}...`
                  : 'Ask a gardening, watering, soil, or pest question...'
              }
              aria-label="Gardening question message"
              className="min-h-[42px] max-h-32 flex-1 resize-none rounded-lg border border-[#CBD4CA] bg-[#FAFBF9] px-3.5 py-2.5 text-sm text-[#131D16] placeholder:text-[#7D8A80]"
            />

            <button
              type="button"
              disabled={isSending || (!input.trim() && !attachedImage)}
              onClick={submitCurrentMessage}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#1B5E3A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#14482C] disabled:cursor-not-allowed disabled:bg-[#CBD4CA] disabled:text-[#526056] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
