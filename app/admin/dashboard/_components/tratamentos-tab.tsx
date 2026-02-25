'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function TratamentosTab() {
    const [treatments, setTreatments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTreatment, setEditingTreatment] = useState<any | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        duration: '',
        anesthesia: 'Local',
        recovery: '',
        durability: '',
        tags: '',
        status: 'AVAILABLE',
    })
    const [existingImages, setExistingImages] = useState<string[]>([])
    const [isSaving, setIsSaving] = useState(false)

    const loadTreatments = async () => {
        try {
            const resp = await fetch('/api/tratamentos')
            if (resp.ok) {
                const data = await resp.json()
                setTreatments(data)
            }
        } catch (error) {
            toast.error('Erro ao carregar tratamentos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTreatments()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const url = editingTreatment ? `/api/tratamentos/${editingTreatment.id}` : '/api/tratamentos'
            const method = editingTreatment ? 'PUT' : 'POST'

            // Format tags as array
            const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()) : []

            const payload = {
                ...formData,
                tags: tagsArray,
                price: parseFloat(formData.price),
                images: existingImages
            }

            const resp = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (resp.ok) {
                toast.success(`Tratamento ${editingTreatment ? 'atualizado' : 'cadastrado'} com sucesso`)
                loadTreatments()
                setIsModalOpen(false)
                resetForm()
            } else {
                toast.error('Erro ao salvar tratamento')
            }
        } catch (error) {
            toast.error('Erro interno ao salvar')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este tratamento?')) return

        try {
            const resp = await fetch(`/api/tratamentos/${id}`, { method: 'DELETE' })
            if (resp.ok) {
                toast.success('Tratamento excluído')
                loadTreatments()
            } else {
                toast.error('Erro ao excluir tratamento')
            }
        } catch (error) {
            toast.error('Erro ao excluir')
        }
    }

    const openEditModal = (treatment: any) => {
        setEditingTreatment(treatment)
        setExistingImages(treatment.images || [])
        setFormData({
            title: treatment.title,
            description: treatment.description,
            price: treatment.price.toString(),
            duration: treatment.duration || '',
            anesthesia: treatment.anesthesia || 'Local',
            recovery: treatment.recovery || '',
            durability: treatment.durability || '',
            tags: treatment.tags ? treatment.tags.join(', ') : '',
            status: treatment.status,
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setEditingTreatment(null)
        setExistingImages([])
        setFormData({
            title: '',
            description: '',
            price: '',
            duration: '',
            anesthesia: 'Local',
            recovery: '',
            durability: '',
            tags: '',
            status: 'AVAILABLE',
        })
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Tratamentos Odontológicos</h2>
                    <p className="text-sm text-slate-500">Gerencie os procedimentos oferecidos pela clínica.</p>
                </div>
                <button
                    onClick={() => {
                        resetForm()
                        setIsModalOpen(true)
                    }}
                    className="flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Novo Tratamento
                </button>
            </div>

            {loading ? (
                <p className="text-slate-500">Carregando...</p>
            ) : treatments.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-slate-900">Nenhum tratamento cadastrado</h3>
                    <p className="text-slate-500">Comece adicionando seu primeiro tratamento ao catálogo.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500 text-sm">
                                <th className="py-3 px-4 font-bold">Tratamento</th>
                                <th className="py-3 px-4 font-bold">Preço (A partir de)</th>
                                <th className="py-3 px-4 font-bold">Duração</th>
                                <th className="py-3 px-4 font-bold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {treatments.map((t) => (
                                <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-3 px-4 font-bold text-slate-800">{t.title}</td>
                                    <td className="py-3 px-4 text-primary font-bold">
                                        R$ {parseFloat(t.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">{t.duration || '-'}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(t)} className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal CRUD */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex justify-between items-center z-10">
                            <h3 className="text-lg font-bold text-slate-900">{editingTreatment ? 'Editar Tratamento' : 'Novo Tratamento'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Tratamento</label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:border-primary transition" placeholder="Ex: Clareamento a Laser" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Preço Base (R$)</label>
                                    <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:border-primary transition" placeholder="Apenas números" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Duração Estimada</label>
                                    <input type="text" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:border-primary transition" placeholder="Ex: 1 hora, 3 sessões" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Necessita Anestesia?</label>
                                    <select value={formData.anesthesia} onChange={e => setFormData({ ...formData, anesthesia: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:border-primary transition bg-white">
                                        <option value="Sem necessidade">Sem necessidade</option>
                                        <option value="Local">Local</option>
                                        <option value="Geral">Geral</option>
                                        <option value="Sedação Leve">Sedação Leve</option>
                                    </select>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tempo de Recuperação</label>
                                    <input type="text" value={formData.recovery} onChange={e => setFormData({ ...formData, recovery: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:border-primary transition" placeholder="Ex: Imediata, 3 dias" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Durabilidade do Tratamento</label>
                                    <input type="text" value={formData.durability} onChange={e => setFormData({ ...formData, durability: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:border-primary transition" placeholder="Ex: Permanente, 1 a 2 anos" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tags (separadas por vírgula)</label>
                                    <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:border-primary transition" placeholder="Ex: Estética, Ortodontia, Clareamento" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status no Catálogo</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:border-primary transition bg-white">
                                        <option value="AVAILABLE">Disponível / Visível</option>
                                        <option value="UNAVAILABLE">Indisponível / Oculto</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição Detalhada</label>
                                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 outline-none focus:border-primary transition h-24" placeholder="Explique os detalhes do procedimento, benefícios, etapas..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Imagens de Exemplo (Máx. 10)</label>
                                <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={async (e) => {
                                            if (e.target.files) {
                                                const newFiles = Array.from(e.target.files)
                                                if (existingImages.length + newFiles.length > 10) {
                                                    toast.error('Limite máximo de 10 imagens excedido.')
                                                    return
                                                }

                                                try {
                                                    const base64Images = await Promise.all(
                                                        newFiles.map((file) => {
                                                            return new Promise<string>((resolve, reject) => {
                                                                const reader = new FileReader();
                                                                reader.readAsDataURL(file);
                                                                reader.onload = () => resolve(reader.result as string);
                                                                reader.onerror = (error) => reject(error);
                                                            });
                                                        })
                                                    );
                                                    setExistingImages((prev) => [...prev, ...base64Images])
                                                } catch (err) {
                                                    toast.error('Erro ao converter imagens')
                                                }
                                            }
                                        }}
                                    />
                                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">add_photo_alternate</span>
                                    <p className="text-sm font-medium text-slate-600">Clique para selecionar ou arraste imagens aqui</p>
                                </div>

                                {/* Previews */}
                                {existingImages.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {existingImages.map((img, idx) => (
                                            <div key={`existing-${idx}`} className="relative size-20 rounded-md overflow-hidden border border-slate-200 group">
                                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/60 rounded-full text-white p-1 hover:bg-red-500 transition opacity-0 group-hover:opacity-100 shadow-sm">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition" disabled={isSaving}>Cancelar</button>
                                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition shadow-sm disabled:opacity-50">
                                    {isSaving ? 'Salvando...' : editingTreatment ? 'Salvar Alterações' : 'Cadastrar Tratamento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
