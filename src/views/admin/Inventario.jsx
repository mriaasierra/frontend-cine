'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Package, AlertTriangle, TrendingDown } from 'lucide-react'
import { inventoryApi, categoriesApi } from '@/src/services/api'
import { useToast } from '@/src/context/ToastContext'
import { useAuth } from '@/src/context/AuthContext'
import { Modal } from '@/src/components/ui/Modal'

function InventoryForm({ item, categories, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category_id: item?.category_id || '',
    min_stock: item?.min_stock || '5'
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const tempErrors = {}
    if (!formData.name.trim()) tempErrors.name = 'El nombre es obligatorio'
    if (!formData.category_id) tempErrors.category_id = 'La categoría es obligatoria'
    if (Number(formData.min_stock) < 0) tempErrors.min_stock = 'El stock mínimo no puede ser negativo'
    
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        ...formData,
        category_id: Number(formData.category_id),
        min_stock: Number(formData.min_stock)
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-100">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Nombre del Producto</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`w-full px-3 py-2 bg-slate-950 border rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm ${
            errors.name ? 'border-red-500' : 'border-slate-800'
          }`}
          required
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Categoría</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className={`w-full px-3 py-2 bg-slate-950 border rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm cursor-pointer ${
              errors.category_id ? 'border-red-500' : 'border-slate-800'
            }`}
            required
          >
            <option value="">Seleccionar...</option>
            {categories.map(cat => (
              <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
            ))}
          </select>
          {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Stock Mínimo</label>
          <input
            type="number"
            min="0"
            value={formData.min_stock}
            onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
            className={`w-full px-3 py-2 bg-slate-950 border rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm ${
              errors.min_stock ? 'border-red-500' : 'border-slate-800'
            }`}
            required
          />
          {errors.min_stock && <p className="text-xs text-red-500 mt-1">{errors.min_stock}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors text-sm font-semibold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98]"
        >
          {item ? 'Actualizar' : 'Crear Producto'}
        </button>
      </div>
    </form>
  )
}

export default function Inventario() {
  const [inventory, setInventory] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1)
  const [limit] = useState(8)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const { success, error } = useToast()
  const { isGerente } = useAuth()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchInventory()
  }, [page, selectedCategory])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchInventory()
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll()
      setCategories(data || [])
    } catch (err) {
      error('Error al cargar categorías')
    }
  }

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const res = await inventoryApi.getAll({
        page,
        limit,
        search: searchTerm || undefined,
        category_id: selectedCategory || undefined
      })
      
      if (res && res.data) {
        setInventory(res.data)
        setTotal(res.pagination.total)
        setTotalPages(res.pagination.totalPages)
      } else {
        setInventory(res || [])
        setTotal(res?.length || 0)
        setTotalPages(1)
      }
    } catch (err) {
      error('Error al cargar inventario')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      await inventoryApi.create(formData)
      fetchInventory()
      setIsModalOpen(false)
      success('Producto creado exitosamente')
    } catch (err) {
      error(err.message || 'Error al crear producto')
    }
  }

  const handleUpdate = async (formData) => {
    try {
      await inventoryApi.update(editingItem.item_id, formData)
      fetchInventory()
      setIsModalOpen(false)
      setEditingItem(null)
      success('Producto actualizado exitosamente')
    } catch (err) {
      error(err.message || 'Error al actualizar producto')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este producto?')) return
    try {
      await inventoryApi.delete(id)
      fetchInventory()
      success('Producto eliminado exitosamente')
    } catch (err) {
      error(err.message || 'Error al eliminar producto')
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value)
    setPage(1)
  }

  const statusStyles = {
    'Normal': 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40',
    'Bajo': 'bg-red-950/40 text-red-400 border border-red-900/40'
  }

  const lowStockCount = inventory.filter(i => i.status === 'Bajo').length

  if (loading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Inventario</h1>
          <p className="text-sm text-slate-400 mt-1">Gestión de productos y niveles mínimos de stock</p>
        </div>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950/30 border border-red-900/40 text-red-400 rounded-xl text-sm font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{lowStockCount} productos con stock bajo</span>
            </div>
          )}
          {isGerente && (
            <button
              onClick={() => { setEditingItem(null); setIsModalOpen(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all font-semibold"
            >
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer text-sm min-w-[180px]"
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950/60 border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Mínimo</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                {isGerente && (
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {inventory.map(item => (
                <tr key={item.item_id} className={`hover:bg-slate-850/30 transition-colors ${item.status === 'Bajo' ? 'bg-red-950/10' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-slate-400" />
                      </div>
                      <span className="font-semibold text-white">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-950 border border-slate-850 rounded-lg text-xs font-medium text-slate-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-base ${item.status === 'Bajo' ? 'text-red-400 font-extrabold' : 'text-slate-200'}`}>
                        {item.stock}
                      </span>
                      {item.status === 'Bajo' && (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{item.min_stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${statusStyles[item.status] || statusStyles['Normal']}`}>
                      {item.status}
                    </span>
                  </td>
                  {isGerente && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingItem(item); setIsModalOpen(true) }}
                          className="p-2 bg-slate-950/40 border border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.item_id)}
                          className="p-2 bg-red-950/30 border border-red-900/30 text-red-400 hover:text-white hover:bg-red-900/80 rounded-lg transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan={isGerente ? "6" : "5"} className="text-center py-10 text-slate-500">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 text-slate-400 mt-6">
          <p className="text-sm">
            Mostrando página <span className="font-semibold text-white">{page}</span> de <span className="font-semibold text-white">{totalPages}</span> ({total} productos en total)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-900 border border-slate-800/80 rounded-xl hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors text-sm font-medium"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-slate-900 border border-slate-800/80 rounded-xl hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors text-sm font-medium"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null) }}
        title={editingItem ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <InventoryForm
          item={editingItem}
          categories={categories}
          onSubmit={editingItem ? handleUpdate : handleCreate}
          onCancel={() => { setIsModalOpen(false); setEditingItem(null) }}
        />
      </Modal>
    </div>
  )
}

