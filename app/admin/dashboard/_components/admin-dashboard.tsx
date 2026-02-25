'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { LogOut, Settings, Calendar, Activity, Sparkles } from 'lucide-react'
import TratamentosTab from './tratamentos-tab'
import ConfiguracoesTab from './configuracoes-tab'
import AgendamentosTab from './agendamentos-tab'

type Tab = 'tratamentos' | 'agendamentos' | 'configuracoes'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('tratamentos')

  const tabs = [
    { id: 'tratamentos', label: 'Tratamentos', icon: Activity },
    { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tratamentos':
        return <TratamentosTab />
      case 'agendamentos':
        return <AgendamentosTab />
      case 'configuracoes':
        return <ConfiguracoesTab />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-primary/20 sticky top-0 z-50 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              OdontoPrime <span className="text-primary">Admin</span>
            </h1>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-24">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 font-semibold transition-all ${activeTab === tab.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          <main className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}
