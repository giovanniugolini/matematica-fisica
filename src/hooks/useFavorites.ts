import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Favorite, Artifact } from '../lib/supabase'

// ============================================
// CHECK SE È PREFERITO
// ============================================

interface UseFavoriteResult {
  isFavorite: boolean
  loading: boolean
  toggle: () => Promise<void>
}

export function useFavorite(artifactId: string | undefined, userId: string | undefined): UseFavoriteResult {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!artifactId || !userId) {
      setIsFavorite(false)
      setLoading(false)
      return
    }

    const checkFavorite = async () => {
      const { data } = await supabase
        .from('favorites')
        .select('user_id')
        .eq('user_id', userId)
        .eq('artifact_id', artifactId)
        .single()

      setIsFavorite(!!data)
      setLoading(false)
    }

    checkFavorite()
  }, [artifactId, userId])

  const toggle = useCallback(async () => {
    if (!artifactId || !userId) return

    setLoading(true)

    if (isFavorite) {
      // Rimuovi dai preferiti
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('artifact_id', artifactId)

      setIsFavorite(false)
    } else {
      // Aggiungi ai preferiti
      await supabase
        .from('favorites')
        .insert({ user_id: userId, artifact_id: artifactId })

      setIsFavorite(true)
    }

    setLoading(false)
  }, [artifactId, userId, isFavorite])

  return { isFavorite, loading, toggle }
}

// ============================================
// LISTA PREFERITI UTENTE
// ============================================

interface UseUserFavoritesResult {
  favorites: (Favorite & { artifact: Artifact })[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useUserFavorites(userId: string | undefined): UseUserFavoritesResult {
  const [favorites, setFavorites] = useState<(Favorite & { artifact: Artifact })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setFavorites([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('favorites')
      .select(`
        user_id,
        artifact_id,
        created_at,
        artifact:artifacts (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
      setFavorites([])
    } else {
      // Trasforma i dati per avere artifact come oggetto singolo
      const transformed = (data || []).map(item => ({
        user_id: item.user_id,
        artifact_id: item.artifact_id,
        created_at: item.created_at,
        artifact: item.artifact as unknown as Artifact
      }))
      setFavorites(transformed)
    }

    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  return { favorites, loading, error, refetch: fetchFavorites }
}

// ============================================
// CONTEGGIO PREFERITI PER ARTIFACT
// ============================================

export function useFavoriteCount(artifactId: string | undefined) {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!artifactId) {
      setCount(0)
      setLoading(false)
      return
    }

    const fetchCount = async () => {
      const { count: total } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('artifact_id', artifactId)

      setCount(total || 0)
      setLoading(false)
    }

    fetchCount()
  }, [artifactId])

  return { count, loading }
}
