"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Send, ArrowLeft, Bot, User } from 'lucide-react'

type Message = {
    id: string
    role: 'user' | 'assistant'
    content: string
}

const INITIAL_MESSAGE: Message = {
    id: '1',
    role: 'assistant',
    content: 'Olá! Sou seu consultor exclusivo Luxe Motors. Como posso ajudar você a encontrar seu próximo veículo hoje?'
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })) })
            })

            if (!res.ok) throw new Error('Falha na resposta')

            const data = await res.json()

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message
            }

            setMessages(prev => [...prev, aiMessage])
        } catch (error) {
            console.error(error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Desculpe, estou enfrentando uma instabilidade no sistema. Você pode tentar perguntar de novo ou chamar um consultor humano no WhatsApp.'
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-screen bg-background-dark max-w-screen-md mx-auto shadow-2xl relative overflow-hidden">

            {/* Header */}
            <header className="flex items-center justify-between p-4 bg-surface-dark border-b border-surface-border sticky top-0 z-10 shrink-0">
                <Link href="/" className="p-2 hover:bg-white/5 rounded-full text-text-secondary hover:text-white transition">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex flex-col items-center">
                    <h1 className="text-white font-bold tracking-widest uppercase text-sm">Consultor AI</h1>
                    <span className="text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Online
                    </span>
                </div>
                <div className="w-10"></div> {/* Spacer for centering */}
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 scrollbar-hide">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex items-end gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        {/* Avatar */}
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-primary text-black' : 'bg-surface-dark border border-surface-border text-primary'}`}>
                            {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>

                        {/* Bubble */}
                        <div
                            className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed ${message.role === 'user'
                                    ? 'bg-primary text-black rounded-2xl rounded-tr-sm font-medium shadow-[0_4px_15px_rgba(245,159,10,0.15)]'
                                    : 'bg-surface-dark border border-surface-border text-gray-200 rounded-2xl rounded-tl-sm'
                                }`}
                        >
                            {/* Simple markdown bolding replacement (Groq might return *text*) */}
                            {message.content.split('\n').map((line, i) => (
                                <span key={i} className="block min-h-[1em]">
                                    {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={j} className={message.role === 'user' ? 'text-black' : 'text-white'}>{part.slice(2, -2)}</strong>;
                                        }
                                        return part;
                                    })}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-end gap-2 text-primary">
                        <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-surface-dark border border-surface-border">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-surface-dark border border-surface-border px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 bg-background-dark/80 backdrop-blur-xl border-t border-surface-border p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escreva sua mensagem..."
                        disabled={isLoading}
                        className="flex-1 bg-surface-dark border border-surface-border text-white px-4 py-3 rounded-xl focus:outline-none focus:border-primary transition disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="bg-primary text-black w-12 h-12 flex flex-shrink-0 items-center justify-center rounded-xl hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_15px_rgba(245,159,10,0.2)]"
                    >
                        <Send className="w-5 h-5 group-hover:scale-110 transition-transform -ml-0.5 mt-0.5" />
                    </button>
                </form>
            </div>

        </div>
    )
}
