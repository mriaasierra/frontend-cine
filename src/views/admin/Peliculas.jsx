'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Clock, User } from 'lucide-react'
import { moviesApi, genresApi } from '@/src/services/api'
import { useToast } from '@/src/context/ToastContext'
import { useAuth } from '@/src/context/AuthContext'
import { Modal } from '@/src/components/ui/Modal'

function MovieForm({ movie, genres, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: movie?.title || '',
    director: movie?.director || '',
    duration: movie?.duration || '',
    genre_id: movie?.genre_id || '',
    status: movie?.status || 'Activa',
    poster_url: movie?.poster_url || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aseguramos que los tipos de datos vayan limpios al backend
    onSubmit({
      ...formData,
      duration: Number(formData.duration) || 0,
      genre_id: Number(formData.genre_id) || null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Director</label>
          <input
            type="text"
            value={formData.director}
            onChange={(e) => setFormData({ ...formData, director: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Duración (min)</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Género</label>
          <select
            value={formData.genre_id}
            onChange={(e) => setFormData({ ...formData, genre_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Seleccionar género</option>
            {genres.map(genre => (
              <option key={genre.genre_id} value={genre.genre_id}>{genre.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Activa">Activa</option>
            <option value="Próximamente">Próximamente</option>
            <option value="Inactiva">Inactiva</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">URL del Póster</label>
        <input
          type="url"
          value={formData.poster_url}
          onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://..."
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
          {movie ? 'Actualizar' : 'Crear Película'}
        </button>
      </div>
    </form>
  )
}

export default function Peliculas() {
  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState(null)
  const { success, error } = useToast()
  const { isGerente } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [moviesData, genresData] = await Promise.all([
        moviesApi.getAll(),
        genresApi.getAll()
      ])
      setMovies(moviesData)
      setGenres(genresData)
    } catch (err) {
      error('Error al cargar datos del servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      const newMovie = await moviesApi.create(formData)
      const genre = genres.find(g => g.genre_id === formData.genre_id)
      
      // Sincronizamos la lista local inyectando el nombre del género correspondiente
      setMovies([...movies, { ...newMovie, genre_name: genre?.name }])
      setIsModalOpen(false)
      success('Película creada exitosamente')
    } catch (err) {
      error(err.message || 'Error al crear película')
    }
  }

  const handleUpdate = async (formData) => {
    try {
      await moviesApi.update(editingMovie.movie_id, formData)
      const genre = genres.find(g => g.genre_id === formData.genre_id)
      
      setMovies(movies.map(m => 
        m.movie_id === editingMovie.movie_id 
          ? { ...m, ...formData, genre_name: genre?.name }
          : m
      ))
      setIsModalOpen(false)
      setEditingMovie(null)
      success('Película actualizada exitosamente')
    } catch (err) {
      error(err.message || 'Error al actualizar película')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta película?')) return
    try {
      await moviesApi.delete(id)
      setMovies(movies.filter(m => m.movie_id !== id))
      success('Película eliminada exitosamente')
    } catch (err) {
      error(err.message || 'Error al eliminar película')
    }
  }

  // Helper dinámico para resolver nombres de género si el backend sólo entrega ids en el GET lineal
  const resolveGenreName = (movie) => {
    if (movie.genre_name) return movie.genre_name
    const matched = genres.find(g => g.genre_id === movie.genre_id)
    return matched ? matched.name : 'Sin Género'
  }

  const filteredMovies = movies.filter(movie => {
    const genreName = resolveGenreName(movie)
    return `${movie.title} ${movie.director} ${genreName}`.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const statusColors = {
    'Activa': 'bg-emerald-100 text-emerald-700',
    'Próximamente': 'bg-amber-100 text-amber-700',
    'Inactiva': 'bg-slate-100 text-slate-600'
  }

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
          <h1 className="text-2xl font-bold text-slate-800">Películas</h1>
          <p className="text-slate-500">Catálogo de películas en cartelera</p>
        </div>
        {isGerente && (
          <button
            onClick={() => { setEditingMovie(null); setIsModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Película
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por título, director o género..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMovies.map(movie => (
          <div key={movie.movie_id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group flex flex-col justify-between">
            <div>
              {/* Contenedor de la Imagen / Póster Real */}
              <div className="aspect-[2/3] bg-slate-900 relative overflow-hidden">
                {movie.poster_url && !movie.poster_url.includes('placeholder') ? (
                  <img 
                    src={movie.poster_url} 
                    alt={movie.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = '' }} // Evita iconos rotos de imagen si la URL falla
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                    <span className="text-4xl font-bold text-slate-500 uppercase">{movie.title?.[0] || '?'}</span>
                  </div>
                )}
                
                {isGerente && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => { setEditingMovie(movie); setIsModalOpen(true) }}
                      className="p-2 bg-white/95 rounded-lg hover:bg-white shadow-sm transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-slate-700" />
                    </button>
                    <button
                      onClick={() => handleDelete(movie.movie_id)}
                      className="p-2 bg-white/95 rounded-lg hover:bg-white shadow-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                )}
                <span className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-semibold shadow-sm ${statusColors[movie.status] || 'bg-slate-100'}`}>
                  {movie.status}
                </span>
              </div>

              {/* Detalles */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1" title={movie.title}>{movie.title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <User className="w-4 h-4 shrink-0" />
                  <span className="line-clamp-1">{movie.director}</span>
                </div>
              </div>
            </div>

            {/* Footer de la tarjeta */}
            <div className="px-4 pb-4 pt-0 border-t border-slate-50 mt-auto">
              <div className="flex items-center justify-between text-sm pt-3">
                <span className="text-slate-400 font-medium">{resolveGenreName(movie)}</span>
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {movie.duration} min
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingMovie(null) }}
        title={editingMovie ? 'Editar Película' : 'Nueva Película'}
      >
        {/* Usamos el ID o un string estático como KEY para obligar al formulario a reinicializarse por completo al cambiar de película */}
        <MovieForm
          key={editingMovie ? `edit-${editingMovie.movie_id}` : 'new-movie'}
          movie={editingMovie}
          genres={genres}
          onSubmit={editingMovie ? handleUpdate : handleCreate}
          onCancel={() => { setIsModalOpen(false); setEditingMovie(null) }}
        />
      </Modal>
    </div>
  )
}