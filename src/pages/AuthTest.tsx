import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function AuthTest() {
  const { user, profile, loading, signUp, signIn, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (isSignUp) {
      const { error } = await signUp(email, password, displayName)
      if (error) {
        setMessage(`Errore registrazione: ${error.message}`)
      } else {
        setMessage('Registrazione completata! Controlla Mailpit per la conferma email.')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setMessage(`Errore login: ${error.message}`)
      } else {
        setMessage('Login effettuato!')
      }
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setMessage('Logout effettuato')
  }

  if (loading) {
    return <div className="p-8">Caricamento...</div>
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Autenticazione Supabase</h1>

      {user ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 rounded">
            <p><strong>Utente autenticato:</strong></p>
            <p>Email: {user.email}</p>
            <p>ID: {user.id}</p>
          </div>

          {profile && (
            <div className="p-4 bg-blue-100 rounded">
              <p><strong>Profilo:</strong></p>
              <p>Display name: {profile.display_name || '(non impostato)'}</p>
              <p>Ruolo: {profile.role}</p>
              <p>Piano: {profile.plan}</p>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded ${!isSignUp ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded ${isSignUp ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Registrati
            </button>
          </div>

          {isSignUp && (
            <input
              type="text"
              placeholder="Nome visualizzato"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />

          <input
            type="password"
            placeholder="Password (min 6 caratteri)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            minLength={6}
            required
          />

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isSignUp ? 'Registrati' : 'Accedi'}
          </button>
        </form>
      )}

      {message && (
        <div className="mt-4 p-4 bg-yellow-100 rounded">
          {message}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-100 rounded text-sm">
        <p><strong>Info sviluppo:</strong></p>
        <p>Supabase Studio: <a href="http://127.0.0.1:54323" className="text-blue-500">http://127.0.0.1:54323</a></p>
        <p>Mailpit (email): <a href="http://127.0.0.1:54324" className="text-blue-500">http://127.0.0.1:54324</a></p>
      </div>
    </div>
  )
}
