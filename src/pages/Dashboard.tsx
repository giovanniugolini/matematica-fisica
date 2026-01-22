import { useAuth } from '../hooks/useAuth'
import { useUserFavorites } from '../hooks/useFavorites'
import { useArtifacts } from '../hooks/useArtifacts'
import { FavoriteButton } from '../components/ui/FavoriteButton'

export default function Dashboard() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { favorites, loading: favoritesLoading } = useUserFavorites(user?.id)
  const { artifacts: myArtifacts, loading: artifactsLoading } = useArtifacts({ 
    ownerId: user?.id 
  })

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <p className="text-gray-500">Caricamento...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-4">Effettua il login per accedere alla tua dashboard.</p>
        <a 
          href="#/auth-test" 
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Vai al Login
        </a>
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Bentornato, {profile?.display_name || user.email}!</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-red-500 border border-red-500 rounded hover:bg-red-50"
        >
          Logout
        </button>
      </div>

      {/* Profilo */}
      <section className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">👤 Il tuo profilo</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Email:</span>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <span className="text-gray-500">Nome:</span>
            <p className="font-medium">{profile?.display_name || '(non impostato)'}</p>
          </div>
          <div>
            <span className="text-gray-500">Ruolo:</span>
            <p className="font-medium capitalize">{profile?.role || 'student'}</p>
          </div>
          <div>
            <span className="text-gray-500">Piano:</span>
            <p className="font-medium capitalize">{profile?.plan || 'free'}</p>
          </div>
        </div>
      </section>

      {/* Statistiche */}
      <section className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{favorites.length}</p>
          <p className="text-sm text-blue-700">Preferiti</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{myArtifacts.length}</p>
          <p className="text-sm text-green-700">Miei contenuti</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">0</p>
          <p className="text-sm text-purple-700">Quiz completati</p>
        </div>
      </section>

      {/* Preferiti */}
      <section className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">❤️ I tuoi preferiti</h2>
        {favoritesLoading ? (
          <p className="text-gray-500">Caricamento...</p>
        ) : favorites.length === 0 ? (
          <p className="text-gray-500">Non hai ancora aggiunto preferiti.</p>
        ) : (
          <ul className="space-y-3">
            {favorites.map((fav) => (
              <li 
                key={fav.artifact_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium">{fav.artifact?.title || 'Artifact'}</p>
                  <p className="text-xs text-gray-500">
                    {fav.artifact?.type} • {fav.artifact?.subject}
                  </p>
                </div>
                <FavoriteButton
                  artifactId={fav.artifact_id}
                  userId={user.id}
                  size="sm"
                  showCount={false}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Miei contenuti (per docenti) */}
      {profile?.role === 'teacher' || myArtifacts.length > 0 ? (
        <section className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">📚 I tuoi contenuti</h2>
          {artifactsLoading ? (
            <p className="text-gray-500">Caricamento...</p>
          ) : myArtifacts.length === 0 ? (
            <p className="text-gray-500">Non hai ancora creato contenuti.</p>
          ) : (
            <ul className="space-y-3">
              {myArtifacts.map((artifact) => (
                <li 
                  key={artifact.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{artifact.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        artifact.status === 'published' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {artifact.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {artifact.type} • {artifact.subject} • 
                      Creato: {new Date(artifact.created_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>❤️ {artifact.likes_count}</span>
                    <span>👁️ {artifact.views_count}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {/* Cronologia Quiz (placeholder) */}
      <section className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">📝 Cronologia Quiz</h2>
        <p className="text-gray-500">Nessun quiz completato. La cronologia apparirà qui.</p>
      </section>

      {/* Link sviluppo */}
      <div className="mt-6 p-4 bg-gray-100 rounded text-sm">
        <p><strong>Link sviluppo:</strong></p>
        <div className="flex gap-4 mt-2">
          <a href="#/auth-test" className="text-blue-500">Auth Test</a>
          <a href="#/artifacts-test" className="text-blue-500">Artifacts Test</a>
          <a href="http://127.0.0.1:54323" className="text-blue-500" target="_blank">Supabase Studio</a>
        </div>
      </div>
    </div>
  )
}
