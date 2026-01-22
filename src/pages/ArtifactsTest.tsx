import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useArtifacts, useCreateArtifact, useDeleteArtifact } from '../hooks/useArtifacts'
import { FavoriteButton } from '../components/ui/FavoriteButton'
import type { NewArtifact } from '../lib/supabase'

export default function ArtifactsTest() {
  const { user, profile } = useAuth()
  const { artifacts, loading, refetch } = useArtifacts()
  const { create, loading: creating } = useCreateArtifact()
  const { remove, loading: deleting } = useDeleteArtifact()
  
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'demo' | 'lesson' | 'quiz'>('demo')
  const [subject, setSubject] = useState<'matematica' | 'fisica'>('matematica')
  const [message, setMessage] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim()) return

    const newArtifact: NewArtifact = {
      owner_id: user.id,
      type,
      title: title.trim(),
      subject,
      status: 'published',
      visibility: 'public',
      content: { description: 'Artifact di test' }
    }

    const result = await create(newArtifact)
    if (result) {
      setMessage(`Artifact "${result.title}" creato con ID: ${result.id}`)
      setTitle('')
      refetch()
    } else {
      setMessage('Errore nella creazione')
    }
  }

  const handleDelete = async (id: string, artifactTitle: string) => {
    if (!confirm(`Eliminare "${artifactTitle}"?`)) return
    
    const success = await remove(id)
    if (success) {
      setMessage(`Artifact "${artifactTitle}" eliminato`)
      refetch()
    } else {
      setMessage('Errore nell\'eliminazione')
    }
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Test Artifacts & Preferiti</h1>
        <p className="text-red-500">Devi effettuare il login per testare questa pagina.</p>
        <a href="#/auth-test" className="text-blue-500 underline">Vai al login</a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Test Artifacts & Preferiti</h1>
      <p className="text-gray-600 mb-6">Utente: {profile?.display_name || user.email}</p>

      {/* Form creazione */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">Crea nuovo Artifact</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            type="text"
            placeholder="Titolo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          
          <div className="flex gap-4">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'demo' | 'lesson' | 'quiz')}
              className="flex-1 p-2 border rounded"
            >
              <option value="demo">Demo</option>
              <option value="lesson">Lezione</option>
              <option value="quiz">Quiz</option>
            </select>
            
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as 'matematica' | 'fisica')}
              className="flex-1 p-2 border rounded"
            >
              <option value="matematica">Matematica</option>
              <option value="fisica">Fisica</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {creating ? 'Creazione...' : 'Crea Artifact'}
          </button>
        </form>
      </div>

      {/* Messaggio */}
      {message && (
        <div className="bg-yellow-100 p-3 rounded mb-6">
          {message}
        </div>
      )}

      {/* Lista artifacts */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold mb-3">
          Artifacts ({artifacts.length})
        </h2>
        
        {loading ? (
          <p className="text-gray-500">Caricamento...</p>
        ) : artifacts.length === 0 ? (
          <p className="text-gray-500">Nessun artifact. Creane uno!</p>
        ) : (
          <ul className="space-y-3">
            {artifacts.map((artifact) => (
              <li
                key={artifact.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{artifact.title}</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {artifact.type}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                      {artifact.subject}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {artifact.id.slice(0, 8)}... | 
                    Creato: {new Date(artifact.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <FavoriteButton
                    artifactId={artifact.id}
                    userId={user.id}
                    size="sm"
                  />
                  
                  {artifact.owner_id === user.id && (
                    <button
                      onClick={() => handleDelete(artifact.id, artifact.title)}
                      disabled={deleting}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Elimina"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Link utili */}
      <div className="mt-6 p-4 bg-gray-100 rounded text-sm">
        <p><strong>Link utili:</strong></p>
        <p><a href="#/auth-test" className="text-blue-500">Auth Test</a></p>
        <p><a href="http://127.0.0.1:54323" className="text-blue-500" target="_blank">Supabase Studio</a></p>
      </div>
    </div>
  )
}
