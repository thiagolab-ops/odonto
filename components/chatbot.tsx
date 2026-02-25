'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: 'Fala chefe! 👋 Bem-vindo à Máfia BR. Como posso ajudar com seu estilo hoje?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('openChat', handleOpen)
    return () => window.removeEventListener('openChat', handleOpen)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    try {
      const currentMessages = [...messages, { role: 'user', content: userMessage }]
      setMessages(currentMessages as any)
      setIsLoading(true)

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages }),
      })

      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage = data.reply || ''

      setMessages((prev: any) => [...prev, { role: 'assistant', content: assistantMessage }])

      // Verificar se precisa redirecionar para WhatsApp
      if (assistantMessage.includes('wa.me/5511999999999')) {
        setTimeout(() => {
          window.open('https://wa.me/5511999999999?text=Ol%C3%A1%2C%20vim%20pelo%20site', '_blank')
        }, 2000)
      }
    } catch (error) {
      console.error('Erro no chat:', error)
      setMessages((prev: any) => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro na comunicação. Tente novamente ou entre em contato pelo WhatsApp: (11) 99999-9999'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && !isHome && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Chat com atendente"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-black shadow-lg shadow-primary/40 transition-transform hover:scale-110 active:scale-95"
            >
              <span className="material-symbols-outlined">chat_bubble</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-[90vw] sm:w-[380px] h-[80vh] sm:h-[600px] bg-background-dark rounded-2xl shadow-[0_10px_40px_-10px_rgba(245,159,10,0.3)] border border-white/5 flex flex-col overflow-hidden"
          >
            <div className="bg-surface-dark border-b border-white/5 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-bold tracking-widest text-slate-100">MÁFIA BOT</h3>
                  <p className="text-[10px] text-primary uppercase font-bold tracking-widest flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-md ${msg.role === 'user'
                      ? 'bg-primary text-background-dark rounded-tr-sm font-medium'
                      : 'bg-surface-dark text-slate-200 rounded-tl-sm border border-white/5'
                      }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface-dark px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5 flex gap-2 shadow-md">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-background-dark border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e: any) => setInput(e.target.value)}
                  onKeyPress={(e: any) => e.key === 'Enter' && handleSend()}
                  placeholder="Manda a sua dúvida..."
                  disabled={isLoading}
                  className="flex-1 bg-surface-dark text-slate-200 px-4 py-2.5 rounded-full border border-white/10 focus:border-primary/50 focus:outline-none disabled:opacity-50 placeholder:text-slate-500 text-sm transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 flex flex-shrink-0 items-center justify-center bg-primary text-background-dark rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
