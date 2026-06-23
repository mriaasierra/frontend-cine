'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Mail, Phone, CreditCard } from 'lucide-react'
import { customersApi } from '@/src/services/api'
import { useToast } from '@/src/context/ToastContext'
import { Modal } from '@/src/components/ui/Modal'

function CustomerForm({ customer, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    cedula: customer?.cedula || '',
    email: customer?.email || '',
    phone: customer?.phone || ''
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const tempErrors = {}
    if (!formData.first_name.trim()) tempErrors.first_name = 'El nombre es obligatorio'
    if (!formData.last_name.trim()) tempErrors.last_name = 'El apellido es obligatorio'
    if (!formData.cedula.trim()) {
      tempErrors.cedula = 'La cédula es obligatoria'
    } else if (!/^[0-9a-zA-Z-]+$/.test(formData.cedula)) {
      tempErrors.cedula = 'Cédula inválida (solo números, letras y guiones)'
    }
    
    if (!formData.email.trim()) {
      tempErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      tempErrors.email = 'El formato del correo es inválido'
    }

    if (formData.phone && !/^[0-9+\s-()]+$/.test(formData.phone)) {
      tempErrors.phone = 'Número de teléfono inválido'
    }

    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-100">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Nombre</label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className={`w-full px-3 py-2 bg-slate-950 border rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm ${
              errors.first_name ? 'border-red-500' : 'border-slate-800'
            }`}
            required
          />
          {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Apellido</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className={`w-full px-3 py-2 bg-slate-950 border rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm ${
              errors.last_name ? 'border-red-500' : 'border-slate-800'
            }`}
            required
          />
          {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Cédula</label>
        <input
          type="text"
          value={formData.cedula}
          onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
          className={`w-full px-3 py-2 bg-slate-950 border rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm ${
            errors.cedula ? 'border-red-500' : 'border-slate-800'
          }`}
          placeholder="Ej: 1-1234-5678"
          required
        />
        {errors.cedula && <p className="text-xs text-red-500 mt-1">{errors.cedula}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={`w-full px-3 py-2 bg-slate-950 border rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm ${
            errors.email ? 'border-red-500' : 'border-slate-800'
          }`}
          required
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Teléfono</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className={`w-full px-3 py-2 bg-slate-950 border rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm ${
            errors.phone ? 'border-red-500' : 'border-slate-800'
          }`}
          placeholder="Ej: +506 8888-8888"
        />
        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
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
          {customer ? 'Actualizar' : 'Crear Cliente'}
        </button>
      </div>
    </form>
  )
}

export default function Clientes() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1)
  const [limit] = useState(6)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const { success, error } = useToast()

  useEffect(() => {
    fetchCustomers()
  }, [page])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers()
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const res = await customersApi.getAll({
        page,
        limit,
        search: searchTerm || undefined
      })
      
      if (res && res.data) {
        setCustomers(res.data)
        setTotal(res.pagination.total)
        setTotalPages(res.pagination.totalPages)
      } else {
        setCustomers(res || [])
        setTotal(res?.length || 0)
        setTotalPages(1)
      }
    } catch (err) {
      error('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      await customersApi.create(formData)
      fetchCustomers()
      setIsModalOpen(false)
      success('Cliente creado exitosamente')
    } catch (err) {
      error(err.message || 'Error al crear cliente')
    }
  }

  const handleUpdate = async (formData) => {
    try {
      await customersApi.update(editingCustomer.customer_id, formData)
      fetchCustomers()
      setIsModalOpen(false)
      setEditingCustomer(null)
      success('Cliente actualizado exitosamente')
    } catch (err) {
      error(err.message || 'Error al actualizar cliente')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return
    try {
      await customersApi.delete(id)
      fetchCustomers()
      success('Cliente eliminado exitosamente')
    } catch (err) {
      error(err.message || 'Error al eliminar cliente')
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  if (loading && customers.length === 0) {
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Clientes</h1>
          <p className="text-sm text-slate-400 mt-1">Gestión de clientes registrados en el sistema</p>
        </div>
        <button
          onClick={() => { setEditingCustomer(null); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por cédula, nombre o email..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
        />
      </div>

      {/* Grid */}
      {customers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map(customer => (
            <div key={customer.customer_id} className="bg-slate-900 rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between hover:border-slate-700/60 shadow-lg group transition-all">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-950 border border-slate-850 rounded-full flex items-center justify-center">
                      <span className="text-slate-300 font-bold text-base uppercase">
                        {customer.first_name[0]}{customer.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-snug">
                        {customer.first_name} {customer.last_name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ID: {customer.customer_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingCustomer(customer); setIsModalOpen(true) }}
                      className="p-2 bg-slate-950/40 border border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar cliente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.customer_id)}
                      className="p-2 bg-red-950/30 border border-red-900/30 text-red-400 hover:text-white hover:bg-red-900/80 rounded-lg transition-colors"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2.5 pt-2 border-t border-slate-800/60 text-sm">
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <CreditCard className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Cédula: <span className="font-mono text-slate-400">{customer.cedula}</span></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl">
          <p className="text-slate-400">No se encontraron clientes para la búsqueda especificada.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 text-slate-400 mt-6">
          <p className="text-sm">
            Mostrando página <span className="font-semibold text-white">{page}</span> de <span className="font-semibold text-white">{totalPages}</span> ({total} clientes en total)
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

