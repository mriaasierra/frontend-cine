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
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1)
  const [limit] = useState(8)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('todos')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState(null)
  const { success, error } = useToast()
  const { isGerente } = useAuth()

  useEffect(() => {
    fetchData()
  }, [page, selectedGenre, selectedStatus])

  // Simple debounce logic or direct fetch on search input submit/blur. Let's trigger fetch on dependencies or run it directly.
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData()
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [moviesRes, genresData] = await Promise.all([
        moviesApi.getAll({
          page,
          limit,
          genre_id: selectedGenre || undefined,
          status: selectedStatus || undefined,
          search: searchTerm || undefined
        }),
        genresApi.getAll()
      ])
      
      if (moviesRes && moviesRes.data) {
        setMovies(moviesRes.data)
        setTotal(moviesRes.pagination.total)
        setTotalPages(moviesRes.pagination.totalPages)
      } else {
        setMovies(moviesRes || [])
        setTotal(moviesRes?.length || 0)
        setTotalPages(1)
      }
      setGenres(genresData || [])
    } catch (err) {
      error('Error al cargar datos del servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      await moviesApi.create(formData)
      fetchData()
      setIsModalOpen(false)
      success('Película creada exitosamente')
    } catch (err) {
      error(err.message || 'Error al crear película')
    }
  }

  const handleUpdate = async (formData) => {
    try {
      await moviesApi.update(editingMovie.movie_id, formData)
      fetchData()
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
      fetchData()
      success('Película eliminada exitosamente')
    } catch (err) {
      error(err.message || 'Error al eliminar película')
    }
  }

  const resolveGenreName = (movie) => {
    if (movie.genre_name) return movie.genre_name
    const matched = genres.find(g => g.genre_id === movie.genre_id)
    return matched ? matched.name : 'Sin Género'
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value)
    setPage(1)
  }

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value)
    setPage(1)
  }

  const statusColors = {
    'Activa': 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50',
    'Próximamente': 'bg-amber-950/40 text-amber-400 border border-amber-900/50',
    'Inactiva': 'bg-slate-900/40 text-slate-400 border border-slate-800/50'
  }

  if (loading && movies.length === 0) {
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Películas</h1>
          <p className="text-sm text-slate-400 mt-1">Catálogo de películas en cartelera y programación</p>
        </div>
        {isGerente && (
          <button
            onClick={() => { setEditingMovie(null); setIsModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            Nueva Película
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por título, director..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex gap-4">
          <select
            value={selectedGenre}
            onChange={handleGenreChange}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer min-w-[150px]"
          >
            <option value="">Todos los géneros</option>
            {genres.map(genre => (
              <option key={genre.genre_id} value={genre.genre_id}>{genre.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all cursor-pointer min-w-[150px]"
          >
            <option value="todos">Todos los estados</option>
            <option value="Activa">Activas</option>
            <option value="Próximamente">Próximamente</option>
            <option value="Inactiva">Inactivas</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map(movie => (
            <div key={movie.movie_id} className="bg-slate-900 rounded-2xl border border-slate-800/80 overflow-hidden group flex flex-col justify-between transition-all hover:border-slate-700/60 shadow-lg">
              <div>
                {/* Contenedor de la Imagen / Póster Real */}
                <div className="aspect-[2/3] bg-slate-950 relative overflow-hidden">
                  {movie.poster_url && !movie.poster_url.includes('placeholder') && movie.poster_url !== 'null' ? (
                    <img 
                      src={movie.poster_url} 
                      alt={movie.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = '' }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                      <span className="text-4xl font-extrabold text-slate-700 uppercase">{movie.title?.[0] || '?'}</span>
                    </div>
                  )}
                  
                  {isGerente && (
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={() => { setEditingMovie(movie); setIsModalOpen(true) }}
                        className="p-2 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-lg hover:bg-slate-800 hover:border-slate-700 shadow-sm transition-colors text-slate-300 hover:text-white"
                        title="Editar película"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(movie.movie_id)}
                        className="p-2 bg-red-950/80 backdrop-blur-sm border border-red-900/40 rounded-lg hover:bg-red-900 hover:border-red-800 shadow-sm transition-colors text-red-400 hover:text-white"
                        title="Eliminar película"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <span className={`absolute bottom-3 left-3 px-2 py-1 rounded-md text-xs font-bold shadow-sm ${statusColors[movie.status] || 'bg-slate-800 text-slate-400'}`}>
                    {movie.status}
                  </span>
                </div>

                {/* Detalles */}
                <div className="p-4">
                  <h3 className="font-bold text-white text-lg mb-1.5 line-clamp-1" title={movie.title}>{movie.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <User className="w-4 h-4 shrink-0 text-slate-500" />
                    <span className="line-clamp-1">{movie.director}</span>
                  </div>
                </div>
              </div>

              {/* Footer de la tarjeta */}
              <div className="px-4 pb-4 pt-0 border-t border-slate-800/60 mt-auto">
                <div className="flex items-center justify-between text-xs pt-3">
                  <span className="text-slate-400 font-semibold bg-slate-950 px-2 py-1 rounded-md">{resolveGenreName(movie)}</span>
                  <span className="flex items-center gap-1 text-slate-400 font-medium">
                    <Clock className="w-4 h-4 text-slate-500" />
                    {movie.duration} min
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl">
          <p className="text-slate-400">No se encontraron películas para los criterios de búsqueda especificados.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 text-slate-400 mt-6">
          <p className="text-sm">
            Mostrando página <span className="font-semibold text-white">{page}</span> de <span className="font-semibold text-white">{totalPages}</span> ({total} películas en total)
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
        onClose={() => { setIsModalOpen(false); setEditingMovie(null) }}
        title={editingMovie ? 'Editar Película' : 'Nueva Película'}
      >
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