import React, { useState, useEffect } from 'react'
import { useFavorite } from '../../hooks/useFavorites'
import { supabase } from '../../lib/supabase'

interface FavoriteButtonProps {
  artifactId: string
  userId?: string
  showCount?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FavoriteButton({
  artifactId,
  userId,
  showCount = true,
  size = 'md',
  className = ''
}: FavoriteButtonProps) {
  const { isFavorite, loading: favoriteLoading, toggle } = useFavorite(artifactId, userId)
  const [count, setCount] = useState(0)
  const [countLoading, setCountLoading] = useState(true)

  // Fetch count e refetch quando isFavorite cambia
  useEffect(() => {
    const fetchCount = async () => {
      setCountLoading(true)
      const { count: total } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('artifact_id', artifactId)

      setCount(total || 0)
      setCountLoading(false)
    }

    fetchCount()
  }, [artifactId, isFavorite])

  const sizeClasses = {
    sm: 'text-lg p-1',
    md: 'text-2xl p-2',
    lg: 'text-3xl p-3'
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!userId) {
      alert('Devi effettuare il login per aggiungere ai preferiti')
      return
    }
    
    await toggle()
  }

  return (
    <button
      onClick={handleClick}
      disabled={favoriteLoading}
      className={`
        inline-flex items-center gap-1 
        transition-all duration-200 
        hover:scale-110 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
      title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
    >
      <span
        className={`
          transition-colors duration-200
          ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-300'}
        `}
      >
        {isFavorite ? '❤️' : '🤍'}
      </span>
      
      {showCount && (
        <span className="text-sm text-gray-600">
          {countLoading ? '...' : count}
        </span>
      )}
    </button>
  )
}

export default FavoriteButton
