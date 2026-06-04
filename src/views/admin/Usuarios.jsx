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

      {!user && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={!user}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
          <select
            value={formData.role_id}
            onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={1}>Gerente</option>
            <option value={2}>Empleado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
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
          {user ? 'Actualizar' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  )
}

export default function Usuarios() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const { success, error } = useToast()

  useEffect(() => {
    // TODO: Connect to backend endpoint: GET /api/users
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll()
      setUsers(data)
    } catch (err) {
      error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      // TODO: Connect to backend endpoint: POST /api/users
      const newUser = await usersApi.create(formData)
      setUsers([...users, { ...newUser, role_name: formData.role_id === 1 ? 'GERENTE' : 'EMPLEADO' }])
      setIsModalOpen(false)
      success('Usuario creado exitosamente')
    } catch (err) {
      error('Error al crear usuario')
    }
  }

  const handleUpdate = async (formData) => {
    try {
      // TODO: Connect to backend endpoint: PUT /api/users/:id
      await usersApi.update(editingUser.user_id, formData)
      setUsers(users.map(u => 
        u.user_id === editingUser.user_id 
          ? { ...u, ...formData, role_name: formData.role_id === 1 ? 'GERENTE' : 'EMPLEADO' }
          : u
      ))
      setIsModalOpen(false)
      setEditingUser(null)
      success('Usuario actualizado exitosamente')
    } catch (err) {
      error('Error al actualizar usuario')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return
    try {
      // TODO: Connect to backend endpoint: DELETE /api/users/:id
      await usersApi.delete(id)
      setUsers(users.filter(u => u.user_id !== id))
      success('Usuario eliminado exitosamente')
    } catch (err) {
      error('Error al eliminar usuario')
    }
  }

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-slate-800">Usuarios</h1>
          <p className="text-slate-500">Gestión de personal del sistema</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredUsers.map(user => (
              <tr key={user.user_id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-slate-600 font-medium">
                        {user.first_name[0]}{user.last_name[0]}
                      </span>
                    </div>
                    <span className="font-medium text-slate-800">
                      {user.first_name} {user.last_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role_name === 'GERENTE' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {user.role_name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1 ${
                    user.status === 'Activo' ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {user.status === 'Activo' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditingUser(user); setIsModalOpen(true) }}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.user_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
