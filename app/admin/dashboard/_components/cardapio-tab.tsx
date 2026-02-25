'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Loader2, Upload, ImageIcon, Check, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { compressImage, formatFileSize, CompressedImage } from '@/lib/image-compressor'

interface Category {
  id: string
  name: string
  order: number
  isActive: boolean
}

export default function CardapioTab() {
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)

  // Estados para upload de imagem
  const [uploading, setUploading] = useState(false)
  const [compressedPreview, setCompressedPreview] = useState<CompressedImage | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    ingredients: '',
    imageUrl: '',
    category: '',
    categoryId: '',
    tags: [] as string[],
    isAvailable: true,
    extras: [] as { name: string; price: string }[],
  })

  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categorias')
      const data = await res.json()
      setCategories(data.categories || [])
      // Se tiver categorias e o form nÃ£o tem categoria selecionada, selecionar a primeira
      if (data.categories?.length > 0 && !form.category) {
        setForm(prev => ({
          ...prev,
          category: data.categories[0].name,
          categoryId: data.categories[0].id
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/produtos')
      if (!res.ok) throw new Error('Falha ao obter dados da API')
      const data = await res.json()
      setServices(data.services || [])
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar serviços. Verifique se o banco está sincronizado.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddExtra = () => {
    setForm(prev => ({
      ...prev,
      extras: [...prev.extras, { name: '', price: '' }]
    }))
  }

  const handleRemoveExtra = (index: number) => {
    setForm(prev => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index)
    }))
  }

  const handleExtraChange = (index: number, field: 'name' | 'price', value: string) => {
    const newExtras = [...form.extras]
    newExtras[index] = { ...newExtras[index], [field]: value }
    setForm(prev => ({ ...prev, extras: newExtras }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editing ? `/api/admin/produtos/${editing.id}` : '/api/admin/produtos'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        toast.success(editing ? 'Serviço atualizado!' : 'Serviço criado!')
        resetForm()
        fetchServices()
      } else {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro desconhecido ao salvar')
      }
    } catch (error: any) {
      console.error(error)
      toast.error(`Falha: ${error.message || 'Verifique sua conexão ou banco'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmar exclusão?')) return

    try {
      const res = await fetch(`/api/admin/produtos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Não foi possível excluir')
      toast.success('Serviço excluído!')
      fetchServices()
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao excluir: ' + error.message)
    }
  }

  const handleEdit = (service: any) => {
    setEditing(service)
    setForm({
      name: service.name,
      price: service.price.toString(),
      description: service.description,
      ingredients: service.ingredients,
      imageUrl: service.imageUrl,
      category: service.category,
      categoryId: service.categoryId || '',
      tags: service.tags || [],
      isAvailable: service.isAvailable,
      extras: service.extras ? service.extras.map((e: any) => ({ name: e.name, price: e.price.toString() })) : [],
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setEditing(null)
    setCompressedPreview(null)
    const firstCategory = categories.length > 0 ? categories[0] : null
    setForm({
      name: '',
      price: '',
      description: '',
      ingredients: '',
      imageUrl: '',
      category: firstCategory?.name || '',
      categoryId: firstCategory?.id || '',
      tags: [],
      isAvailable: true,
      extras: [],
    })
    setShowForm(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handler para seleÃ§Ã£o de arquivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Formato invÃ¡lido. Use JPG, PNG ou WEBP.')
      return
    }

    // Validar tamanho mÃ¡ximo (10MB antes da compressÃ£o)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. MÃ¡ximo 10MB.')
      return
    }

    try {
      setUploading(true)
      toast.loading('Comprimindo imagem...', { id: 'compress' })

      // Comprimir imagem
      const compressed = await compressImage(file, 800, 600, 100)
      setCompressedPreview(compressed)

      toast.success(
        `Comprimido: ${formatFileSize(compressed.originalSize)} â†’ ${formatFileSize(compressed.compressedSize)}`,
        { id: 'compress' }
      )
    } catch (error) {
      toast.error('Erro ao comprimir imagem', { id: 'compress' })
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  // Handler para upload da imagem comprimida
  const handleUploadImage = async () => {
    if (!compressedPreview) return

    try {
      setUploading(true)
      toast.loading('Enviando imagem...', { id: 'upload' })

      // Obter URL prÃ©-assinada
      const presignedRes = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: compressedPreview.file.name,
          contentType: 'image/webp',
        }),
      })

      if (!presignedRes.ok) {
        throw new Error('Erro ao obter URL de upload')
      }

      const { uploadUrl, cloud_storage_path, fileUrl } = await presignedRes.json()

      // Fazer upload direto para S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/webp',
        },
        body: compressedPreview.file,
      })

      if (!uploadRes.ok) {
        throw new Error('Erro ao enviar arquivo')
      }

      // Atualizar URL no formulÃ¡rio
      setForm(prev => ({ ...prev, imageUrl: fileUrl }))
      setCompressedPreview(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      toast.success('Imagem enviada com sucesso!', { id: 'upload' })
    } catch (error) {
      toast.error('Erro ao enviar imagem', { id: 'upload' })
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  // Cancelar preview
  const cancelPreview = () => {
    setCompressedPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const toggleTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  if (loading && services.length === 0) {
    return <div className="text-white text-center py-12">Carregando...</div>
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-primary/30 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Gerenciar Serviços</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          Adicionar serviço
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-700 rounded-lg p-6 mb-6 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">
            {editing ? 'Editar serviço' : 'Novo serviço'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="bg-gray-600 text-white px-4 py-2 rounded-lg"
            />
            <input
              type="number"
              step="0.01"
              placeholder="PreÃ§o *"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className="bg-gray-600 text-white px-4 py-2 rounded-lg"
            />
          </div>

          <textarea
            placeholder="DescriÃ§Ã£o *"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={3}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
          />

          <textarea
            placeholder="Ingredientes"
            value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
            rows={2}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
          />

          {/* Seção de Imagem */}
          <div className="space-y-3">
            <label className="text-gray-300 block">Imagem do serviço</label>

            {/* URL Manual */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="URL da Imagem"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg"
              />
            </div>

            {/* Divisor */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-500" />
              <span className="text-gray-400 text-sm">ou</span>
              <div className="flex-1 h-px bg-gray-500" />
            </div>

            {/* Upload de Arquivo */}
            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-2 bg-primary/20 border-2 border-dashed border-primary text-primary/80 px-4 py-3 rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
                Fazer Upload de Imagem
              </button>

              <p className="text-gray-500 text-xs text-center">
                JPG, PNG ou WEBP â€¢ MÃ¡x 10MB â€¢ SerÃ¡ redimensionado para 800x600 e convertido para WebP (~100KB)
              </p>
            </div>

            {/* Preview da Imagem Comprimida */}
            {compressedPreview && (
              <div className="bg-gray-600 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Preview da Imagem
                  </span>
                  <button
                    type="button"
                    onClick={cancelPreview}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative w-full aspect-video bg-gray-700 rounded-lg overflow-hidden">
                  <Image
                    src={compressedPreview.dataUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-300">
                    <span className="text-red-400 line-through">{formatFileSize(compressedPreview.originalSize)}</span>
                    {' â†’ '}
                    <span className="text-green-400 font-semibold">{formatFileSize(compressedPreview.compressedSize)}</span>
                    <span className="text-gray-400 ml-2">
                      ({compressedPreview.width}x{compressedPreview.height})
                    </span>
                  </div>
                  <span className="text-green-400 text-xs">
                    -{Math.round((1 - compressedPreview.compressedSize / compressedPreview.originalSize) * 100)}% reduÃ§Ã£o
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleUploadImage}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Confirmar Upload
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Preview da URL atual */}
            {form.imageUrl && !compressedPreview && (
              <div className="bg-gray-600 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-2">Imagem atual:</p>
                <div className="relative w-32 h-24 bg-gray-700 rounded overflow-hidden">
                  <Image
                    src={form.imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-gray-300 mb-2 block">Categoria *</label>
            <select
              value={form.categoryId}
              onChange={(e) => {
                const selectedCat = categories.find(c => c.id === e.target.value)
                setForm({
                  ...form,
                  categoryId: e.target.value,
                  category: selectedCat?.name || ''
                })
              }}
              required
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              <option value="">Selecione uma categoria</option>
              {categories.filter(c => c.isActive).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-yellow-400 text-sm mt-1">
                Nenhuma categoria cadastrada. Crie categorias na aba "Categorias".
              </p>
            )}
          </div>

          <div>
            <label className="text-gray-300 mb-2 block">Tags:</label>
            <div className="flex flex-wrap gap-2">
              {['Vegano', 'Sem GlÃºten', 'Novidade', 'Mais Vendido', 'Oferta'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${form.tags.includes(tag)
                    ? 'bg-primary text-black'
                    : 'bg-gray-600 text-white'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Seção de Adicionais (Extras) */}
          <div className="border-t border-gray-600 pt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="text-gray-300 font-semibold">Adicionais (Opcional)</label>
              <button
                type="button"
                onClick={handleAddExtra}
                className="flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Adicionar Extra
              </button>
            </div>

            <div className="space-y-3">
              {form.extras.map((extra, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    placeholder="Nome do adicional (ex: Borda Recheada)"
                    value={extra.name}
                    onChange={(e) => handleExtraChange(index, 'name', e.target.value)}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="PreÃ§o"
                    value={extra.price}
                    onChange={(e) => handleExtraChange(index, 'price', e.target.value)}
                    className="w-24 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExtra(index)}
                    className="p-2 text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {form.extras.length === 0 && (
                <p className="text-gray-500 text-xs italic">Nenhum adicional configurado.</p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
              className="w-4 h-4"
            />
            DisponÃ­vel
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {services.length === 0 && !loading && (
          <div className="bg-gray-700/40 rounded-xl p-8 text-center flex flex-col items-center justify-center border border-dashed border-gray-600">
            <h3 className="text-gray-300 font-bold mb-1">Nenhum serviço cadastrado</h3>
            <p className="text-gray-500 text-sm">Clique em "Adicionar serviço" para começar a preencher o seu catálogo.</p>
          </div>
        )}

        {services.map((service) => (
          <div
            key={service.id}
            className="bg-gray-700 rounded-lg p-4 flex items-center gap-4"
          >
            {service.imageUrl && (
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-600">
                <Image
                  src={service.imageUrl}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex-1">
              <h4 className="text-lg font-bold text-white">{service.name}</h4>
              <p className="text-primary font-semibold">R$ {service.price.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">{service.category}</p>
              {!service.isAvailable && (
                <span className="text-red-500 text-sm font-semibold">IndisponÃ­vel</span>
              )}
              {service.extras && Array.isArray(service.extras) && service.extras.length > 0 && (
                <p className="text-gray-400 text-xs mt-1">
                  +{service.extras.length} adicionais
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(service)}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

