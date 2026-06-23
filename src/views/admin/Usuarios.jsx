'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, UserCheck, UserX } from 'lucide-react'
import { usersApi } from '@/src/services/api'
import { useToast } from '@/src/context/ToastContext'
import { Modal } from '@/src/components/ui/Modal'

function UserForm({ user, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    password: '',
    role_id: user?.role_name === 'GERENTE' ? 1 : 2,
    status: user?.status || 'Activo'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
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
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Apellido</label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm"
          required
        />
      </div>

      {!user && (
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Contraseña</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm"
            required={!user}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Rol</label>
          <select
            value={formData.role_id}
            onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm cursor-pointer"
          >
            <option value={1}>Gerente</option>
            <option value={2}>Empleado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Estado</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all text-sm cursor-pointer"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
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
          {user ? 'Actualizar' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  )
}

export default function Usuarios() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Pagination & Filters
  const [page, setPage] = useState(1)
  const [limit] = useState(8)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('todos')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const { success, error } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [page, selectedRole, selectedStatus])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers()
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await usersApi.getAll({
        page,
        limit,
        role_id: selectedRole || undefined,
        status: selectedStatus || undefined,
        search: searchTerm || undefined
      })
      
      if (res && res.data) {
        setUsers(res.data)
        setTotal(res.pagination.total)
        setTotalPages(res.pagination.totalPages)
      } else {
        setUsers(res || [])
        setTotal(res?.length || 0)
        setTotalPages(1)
      }
    } catch (err) {
      error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      await usersApi.create(formData)
      fetchUsers()
      setIsModalOpen(false)
      success('Usuario creado exitosamente')
    } catch (err) {
      error(err.message || 'Error al crear usuario')
    }
  }

  const handleUpdate = async (formData) => {
    try {
      await usersApi.update(editingUser.user_id, formData)
      fetchUsers()
      setIsModalOpen(false)
      setEditingUser(null)
      success('Usuario actualizado exitosamente')
    } catch (err) {
      error(err.message || 'Error al actualizar usuario')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return
    try {
      await usersApi.delete(id)
      fetchUsers()
      success('Usuario eliminado exitosamente')
    } catch (err) {
      error(err.message || 'Error al eliminar usuario')
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value)
    setPage(1)
  }

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value)
    setPage(1)
  }

  if (loading && users.length === 0) {
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Usuarios</h1>
          <p className="text-sm text-slate-400 mt-1">Gestión del personal de ventas e inventario del cine</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex gap-4">
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer min-w-[150px]"
          >
            <option value="">Todos los roles</option>
            <option value="1">Gerente</option>
            <option value="2">Empleado</option>
          </select>

          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer min-w-[150px]"
          >
            <option value="todos">Todos los estados</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950/60 border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {users.map(user => (
                <tr key={user.user_id} className="hover:bg-slate-850/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center">
                        <span className="text-slate-300 font-bold text-sm uppercase">
                          {user.first_name[0]}{user.last_name[0]}
                        </span>
                      </div>
                      <span className="font-semibold text-white">
                        {user.first_name} {user.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                      user.role_name === 'GERENTE' 
                        ? 'bg-blue-950/40 text-blue-400 border border-blue-900/40' 
                        : 'bg-slate-950 text-slate-400 border border-slate-800/60'
                    }`}>
                      {user.role_name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-sm ${
                      user.status === 'Activo' ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                      {user.status === 'Activo' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      <span className="font-medium">{user.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditingUser(user); setIsModalOpen(true) }}
                        className="p-2 bg-slate-950/40 border border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar usuario"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id)}
                        className="p-2 bg-red-950/30 border border-red-900/30 text-red-400 hover:text-white hover:bg-red-900/80 rounded-lg transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-500">
                    No se encontraron usuarios.
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
            Mostrando página <span className="font-semibold text-white">{page}</span> de <span className="font-semibold text-white">{totalPages}</span> ({total} usuarios en total)
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
        onClose={() => { setIsModalOpen(false); setEditingUser(null) }}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <UserForm
          user={editingUser}
          onSubmit={editingUser ? handleUpdate : handleCreate}
          onCancel={() => { setIsModalOpen(false); setEditingUser(null) }}
        />
      </Modal>
    </div>
  )
}

