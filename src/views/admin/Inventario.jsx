'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Package, AlertTriangle, TrendingDown } from 'lucide-react'
import { inventoryApi } from '@/src/services/api'
import { useToast } from '@/src/context/ToastContext'
import { useAuth } from '@/src/context/AuthContext'
import { Modal } from '@/src/components/ui/Modal'

function InventoryForm({ item, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'Snacks',
    stock: item?.stock || '',
    min_stock: item?.min_stock || '',
    price: item?.price || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Snacks">Snacks</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Comida">Comida</option>
            <option value="Combos">Combos</option>
            <option value="Dulces">Dulces</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Precio ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Stock Actual</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
          <input
            type="number"
            value={formData.min_stock}
            onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {item ? 'Actualizar' : 'Crear Producto'}
        </button>
      </div>
    </form>
  )
}

export default function Inventario() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const { success, error } = useToast()
  const { isGerente } = useAuth()

  useEffect(() => {
    // TODO: Connect to backend endpoint: GET /api/inventory
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const data = await inventoryApi.getAll()
      setInventory(data)
    } catch (err) {
      error('Error al cargar inventario')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      // TODO: Connect to backend endpoint: POST /api/inventory
      const status = formData.stock < formData.min_stock * 0.5 ? 'Crítico' : 
                     formData.stock < formData.min_stock ? 'Bajo' : 'Normal'
      const newItem = await inventoryApi.create({ ...formData, status })
      setInventory([...inventory, { ...newItem, status }])
      setIsModalOpen(false)
      success('Producto creado exitosamente')
    } catch (err) {
      error('Error al crear producto')
    }
  }

  const handleUpdate = async (formData) => {
    try {
      // TODO: Connect to backend endpoint: PUT /api/inventory/:id
      const status = formData.stock < formData.min_stock * 0.5 ? 'Crítico' : 
                     formData.stock < formData.min_stock ? 'Bajo' : 'Normal'
      await inventoryApi.update(editingItem.item_id, { ...formData, status })
      setInventory(inventory.map(i => 
        i.item_id === editingItem.item_id ? { ...i, ...formData, status } : i
      ))
      setIsModalOpen(false)
      setEditingItem(null)
      success('Producto actualizado exitosamente')
    } catch (err) {
      error('Error al actualizar producto')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este producto?')) return
    try {
      // TODO: Connect to backend endpoint: DELETE /api/inventory/:id
      await inventoryApi.delete(id)
      setInventory(inventory.filter(i => i.item_id !== id))
      success('Producto eliminado exitosamente')
    } catch (err) {
      error('Error al eliminar producto')
    }
  }

  const categories = [...new Set(inventory.map(i => i.category))]

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const statusStyles = {
    'Normal': 'bg-emerald-100 text-emerald-700',
    'Bajo': 'bg-amber-100 text-amber-700',
    'Crítico': 'bg-red-100 text-red-700'
  }

  const lowStockCount = inventory.filter(i => i.status !== 'Normal').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
          <p className="text-slate-500">Gestión de productos y stock</p>
        </div>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{lowStockCount} productos con stock bajo</span>
            </div>
          )}
          {isGerente && (
            <button
              onClick={() => { setEditingItem(null); setIsModalOpen(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mínimo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estado</th>
              {isGerente && (
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredInventory.map(item => (
              <tr key={item.item_id} className={`hover:bg-slate-50 ${item.status === 'Crítico' ? 'bg-red-50/50' : ''}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-500" />
                    </div>
                    <span className="font-medium text-slate-800">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded text-sm text-slate-600">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${item.status !== 'Normal' ? 'text-red-600' : 'text-slate-800'}`}>
                      {item.stock}
                    </span>
                    {item.status !== 'Normal' && (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{item.min_stock}</td>
                <td className="px-6 py-4 text-slate-800 font-medium">${item.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[item.status]}`}>
                    {item.status}
                  </span>
                </td>
                {isGerente && (
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditingItem(item); setIsModalOpen(true) }}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.item_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null) }}
        title={editingItem ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <InventoryForm
          item={editingItem}
          onSubmit={editingItem ? handleUpdate : handleCreate}
          onCancel={() => { setIsModalOpen(false); setEditingItem(null) }}
        />
      </Modal>
    </div>
  )
}
