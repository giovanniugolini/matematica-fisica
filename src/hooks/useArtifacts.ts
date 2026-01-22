import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Artifact, NewArtifact, UpdateArtifact } from '../lib/supabase'

// ============================================
// LISTA ARTIFACTS
// ============================================

interface UseArtifactsOptions {
  type?: Artifact['type']
  subject?: Artifact['subject']
  status?: Artifact['status']
  ownerId?: string
  limit?: number
  offset?: number
}

interface UseArtifactsResult {
  artifacts: Artifact[]
  loading: boolean
  error: string | null
  total: number
  refetch: () => Promise<void>
}

export function useArtifacts(options: UseArtifactsOptions = {}): UseArtifactsResult {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const { type, subject, status, ownerId, limit = 50, offset = 0 } = options

  const fetchArtifacts = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('artifacts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type) query = query.eq('type', type)
    if (subject) query = query.eq('subject', subject)
    if (status) query = query.eq('status', status)
    if (ownerId) query = query.eq('owner_id', ownerId)

    const { data, error: err, count } = await query

    if (err) {
      setError(err.message)
      setArtifacts([])
    } else {
      setArtifacts(data || [])
      setTotal(count || 0)
    }

    setLoading(false)
  }, [type, subject, status, ownerId, limit, offset])

  useEffect(() => {
    fetchArtifacts()
  }, [fetchArtifacts])

  return { artifacts, loading, error, total, refetch: fetchArtifacts }
}

// ============================================
// SINGOLO ARTIFACT
// ============================================

interface UseArtifactResult {
  artifact: Artifact | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useArtifact(id: string | undefined): UseArtifactResult {
  const [artifact, setArtifact] = useState<Artifact | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArtifact = useCallback(async () => {
    if (!id) {
      setArtifact(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('artifacts')
      .select('*')
      .eq('id', id)
      .single()

    if (err) {
      setError(err.message)
      setArtifact(null)
    } else {
      setArtifact(data)
    }

    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchArtifact()
  }, [fetchArtifact])

  return { artifact, loading, error, refetch: fetchArtifact }
}

// ============================================
// CREAZIONE ARTIFACT
// ============================================

interface UseCreateArtifactResult {
  create: (artifact: NewArtifact) => Promise<Artifact | null>
  loading: boolean
  error: string | null
}

export function useCreateArtifact(): UseCreateArtifactResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (artifact: NewArtifact): Promise<Artifact | null> => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('artifacts')
      .insert(artifact)
      .select()
      .single()

    setLoading(false)

    if (err) {
      setError(err.message)
      return null
    }

    return data
  }

  return { create, loading, error }
}

// ============================================
// AGGIORNAMENTO ARTIFACT
// ============================================

interface UseUpdateArtifactResult {
  update: (id: string, changes: UpdateArtifact) => Promise<Artifact | null>
  loading: boolean
  error: string | null
}

export function useUpdateArtifact(): UseUpdateArtifactResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = async (id: string, changes: UpdateArtifact): Promise<Artifact | null> => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('artifacts')
      .update(changes)
      .eq('id', id)
      .select()
      .single()

    setLoading(false)

    if (err) {
      setError(err.message)
      return null
    }

    return data
  }

  return { update, loading, error }
}

// ============================================
// ELIMINAZIONE ARTIFACT
// ============================================

interface UseDeleteArtifactResult {
  remove: (id: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useDeleteArtifact(): UseDeleteArtifactResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remove = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    const { error: err } = await supabase
      .from('artifacts')
      .delete()
      .eq('id', id)

    setLoading(false)

    if (err) {
      setError(err.message)
      return false
    }

    return true
  }

  return { remove, loading, error }
}

// ============================================
// PUBBLICAZIONE ARTIFACT
// ============================================

interface UsePublishArtifactResult {
  publish: (id: string) => Promise<Artifact | null>
  unpublish: (id: string) => Promise<Artifact | null>
  loading: boolean
  error: string | null
}

export function usePublishArtifact(): UsePublishArtifactResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const publish = async (id: string): Promise<Artifact | null> => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('artifacts')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    setLoading(false)

    if (err) {
      setError(err.message)
      return null
    }

    return data
  }

  const unpublish = async (id: string): Promise<Artifact | null> => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('artifacts')
      .update({
        status: 'draft',
        published_at: null
      })
      .eq('id', id)
      .select()
      .single()

    setLoading(false)

    if (err) {
      setError(err.message)
      return null
    }

    return data
  }

  return { publish, unpublish, loading, error }
}
