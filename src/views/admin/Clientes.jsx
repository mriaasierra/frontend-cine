'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Mail, Phone } from 'lucide-react'
import { customersApi } from '@/src/services/api'
import { useToast } from '@/src/context/ToastContext'
import { Modal } from '@/src/components/ui/Modal'

function CustomerForm({ customer, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    email: customer?.email || '',
    phone: customer?.phone || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
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
          {customer ? 'Actualizar' : 'Crear Cliente'}
        </button>
      </div>
    </form>
  )
}

export default function Clientes() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const { success, error } = useToast()

  useEffect(() => {
    // TODO: Connect to backend endpoint: GET /api/customers
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const data = await customersApi.getAll()
      setCustomers(data)
    } catch (err) {
      error('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      // TODO: Connect to backend endpoint: POST /api/customers
      const newCustomer = await customersApi.create(formData)
      setCustomers([...customers, newCustomer])
      setIsModalOpen(false)
      success('Cliente creado exitosamente')
    } catch (err) {
      error('Error al crear cliente')
    }
  }

  const handleUpdate = async (formData) => {
    try {
      // TODO: Connect to backend endpoint: PUT /api/customers/:id
      await customersApi.update(editingCustomer.customer_id, formData)
      setCustomers(customers.map(c => 
        c.customer_id === editingCustomer.customer_id ? { ...c, ...formData } : c
      ))
      setIsModalOpen(false)
      setEditingCustomer(null)
      success('Cliente actualizado exitosamente')
    } catch (err) {
      error('Error al actualizar cliente')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return
    try {
      // TODO: Connect to backend endpoint: DELETE /api/customers/:id
      await customersApi.delete(id)
      setCustomers(customers.filter(c => c.customer_id !== id))
      success('Cliente eliminado exitosamente')
    } catch (err) {
      error('Error al eliminar cliente')
    }
  }

  const filteredCustomers = customers.filter(customer =>
    `${customer.first_name} ${customer.last_name} ${customer.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-slate-500">Gestión de clientes registrados</p>
        </div>
        <button
          onClick={() => { setEditingCustomer(null); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(customer => (
          <div key={customer.customer_id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {customer.first_name[0]}{customer.last_name[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    {customer.first_name} {customer.last_name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cliente desde {new Date(customer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditingCustomer(customer); setIsModalOpen(true) }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(customer.customer_id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                {customer.email}
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {customer.phone}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCustomer(null) }}
        title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <CustomerForm
          customer={editingCustomer}
          onSubmit={editingCustomer ? handleUpdate : handleCreate}
          onCancel={() => { setIsModalOpen(false); setEditingCustomer(null) }}
        />
      </Modal>
    </div>
  )
}
