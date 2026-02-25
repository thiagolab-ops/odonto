'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function VeiculosTab() {
    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingVehicle, setEditingVehicle] = useState<any | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: '',
        price: '',
        category: 'Sedan',
        description: '',
        hasAuction: false,
        status: 'AVAILABLE',
        technicalSheet: {
            transmission: '',
            fuel: '',
            mileage: '',
            engine: ''
        }
    })
    const [existingImages, setExistingImages] = useState<string[]>([])
    const [isSaving, setIsSaving] = useState(false)

    const loadVehicles = async () => {
        try {
            const resp = await fetch('/api/veiculos')
            if (resp.ok) {
                const data = await resp.json()
                setVehicles(data)
            }
        } catch (error) {
            toast.error('Erro ao carregar veículos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadVehicles()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            const url = editingVehicle ? `/api/veiculos/${editingVehicle.id}` : '/api/veiculos'
            const method = editingVehicle ? 'PUT' : 'POST'
            const payload = { ...formData, images: existingImages }

            const resp = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (resp.ok) {
                toast.success(`Veículo ${editingVehicle ? 'atualizado' : 'cadastrado'} com sucesso`)
                loadVehicles()
                setIsModalOpen(false)
                resetForm()
            } else {
                toast.error('Erro ao salvar veículo')
            }
        } catch (error) {
            toast.error('Erro interno ao salvar')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este veículo?')) return

        try {
            const resp = await fetch(`/api/veiculos/${id}`, { method: 'DELETE' })
            if (resp.ok) {
                toast.success('Veículo excluído')
                loadVehicles()
            } else {
                toast.error('Erro ao excluir veículo')
            }
        } catch (error) {
            toast.error('Erro ao excluir')
        }
    }

    const openEditModal = (vehicle: any) => {
        setEditingVehicle(vehicle)
        setExistingImages(vehicle.images || [])
        setFormData({
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year.toString(),
            price: vehicle.price.toString(),
            category: vehicle.category,
            description: vehicle.description,
            hasAuction: vehicle.hasAuction,
            status: vehicle.status,
            technicalSheet: typeof vehicle.technicalSheet === 'string'
                ? JSON.parse(vehicle.technicalSheet)
                : (vehicle.technicalSheet || { transmission: '', fuel: '', mileage: '', engine: '' })
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setEditingVehicle(null)
        setExistingImages([])
        setFormData({
            brand: '',
            model: '',
            year: '',
            price: '',
            category: 'Sedan',
            description: '',
            hasAuction: false,
            status: 'AVAILABLE',
            technicalSheet: {
                transmission: '',
                fuel: '',
                mileage: '',
                engine: ''
            }
        })
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Veículos em Estoque</h2>
                    <p className="text-sm text-gray-500">Gerencie todos os veículos da concessionária.</p>
                </div>
                <button
                    onClick={() => {
                        resetForm()
                        setIsModalOpen(true)
                    }}
                    className="flex items-center gap-2 bg-primary text-black font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Novo Veículo
                </button>
            </div>

            {loading ? (
                <p className="text-gray-500">Carregando...</p>
            ) : vehicles.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhum veículo cadastrado</h3>
                    <p className="text-gray-500">Comece adicionando seu primeiro veículo ao estoque.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map((v) => (
                        <div key={v.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
                            <div className="h-40 bg-gray-200 relative">
                                {v.images.length > 0 ? (
                                    <img src={v.images[0]} alt={v.model} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">Sem Foto</div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <span className={`px-2 py-1 text-xs font-bold rounded shadow-sm ${v.status === 'AVAILABLE' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                                        {v.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="text-xs text-gray-500 font-bold uppercase mb-1">{v.brand} • {v.year}</div>
                                <h3 className="font-bold text-lg text-gray-800 mb-1">{v.model}</h3>
                                <p className="text-primary font-black text-xl mb-4">R$ {parseFloat(v.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>

                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(v)} className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition">
                                        <Edit2 className="w-4 h-4" /> Editar
                                    </button>
                                    <button onClick={() => handleDelete(v.id)} className="flex items-center justify-center w-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal CRUD */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
                            <h3 className="text-lg font-bold text-gray-900">{editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                                    <input required type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black" placeholder="Ex: BMW" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                                    <input required type="text" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black" placeholder="Ex: 320i M Sport" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                                    <input required type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black" placeholder="2024" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                                    <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black" placeholder="Apenas números" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black bg-white">
                                        <option value="Sedan">Sedan</option>
                                        <option value="SUV">SUV</option>
                                        <option value="Hatch">Hatch</option>
                                        <option value="Esportivo">Esportivo</option>
                                        <option value="Picape">Picape</option>
                                        <option value="Elétrico">Elétrico</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black bg-white">
                                        <option value="AVAILABLE">Disponível</option>
                                        <option value="RESERVED">Reservado</option>
                                        <option value="SOLD">Vendido</option>
                                    </select>
                                </div>
                                <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
                                    <h4 className="col-span-2 text-sm font-bold text-gray-900">Ficha Técnica</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Câmbio</label>
                                        <select value={formData.technicalSheet.transmission} onChange={e => setFormData({ ...formData, technicalSheet: { ...formData.technicalSheet, transmission: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black bg-white">
                                            <option value="">Selecione...</option>
                                            <option value="Automático">Automático</option>
                                            <option value="Manual">Manual</option>
                                            <option value="CVT">CVT</option>
                                            <option value="Dupla Embreagem">Dupla Embreagem</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Combustível</label>
                                        <select value={formData.technicalSheet.fuel} onChange={e => setFormData({ ...formData, technicalSheet: { ...formData.technicalSheet, fuel: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black bg-white">
                                            <option value="">Selecione...</option>
                                            <option value="Flex">Flex</option>
                                            <option value="Gasolina">Gasolina</option>
                                            <option value="Híbrido">Híbrido</option>
                                            <option value="Elétrico">Elétrico</option>
                                            <option value="Diesel">Diesel</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quilometragem</label>
                                        <input required type="text" value={formData.technicalSheet.mileage} onChange={e => setFormData({ ...formData, technicalSheet: { ...formData.technicalSheet, mileage: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black" placeholder="Ex: 15.000 km" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Motor</label>
                                        <input required type="text" value={formData.technicalSheet.engine} onChange={e => setFormData({ ...formData, technicalSheet: { ...formData.technicalSheet, engine: e.target.value } })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black" placeholder="Ex: 2.0 Turbo" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black h-24" placeholder="Detalhes do veículo, specs extras, histórico..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Imagens do Veículo (Máx. 10)</label>
                                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
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
                                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">add_photo_alternate</span>
                                    <p className="text-sm font-medium text-gray-700">Clique para selecionar ou arraste imagens aqui</p>
                                </div>

                                {/* Previews */}
                                {existingImages.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {existingImages.map((img, idx) => (
                                            <div key={`existing-${idx}`} className="relative size-20 rounded-md overflow-hidden border border-gray-200 group">
                                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/60 rounded-full text-white p-1 hover:bg-red-500 transition opacity-0 group-hover:opacity-100">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="hasAuction" checked={formData.hasAuction} onChange={e => setFormData({ ...formData, hasAuction: e.target.checked })} className="w-4 h-4 text-primary rounded border-gray-300" />
                                <label htmlFor="hasAuction" className="text-sm text-gray-700 font-medium">Possui passagem por leilão?</label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition" disabled={isSaving}>Cancelar</button>
                                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition shadow-sm disabled:opacity-50">
                                    {isSaving ? 'Salvando...' : editingVehicle ? 'Salvar Alterações' : 'Cadastrar Veículo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
