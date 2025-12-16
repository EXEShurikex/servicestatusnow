'use client'

import { useState } from 'react'
import { ThumbsUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UpvoteButtonProps {
  reportId: string
  initialUpvotes: number
}

export function UpvoteButton({ reportId, initialUpvotes }: UpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (hasUpvoted || isLoading) return

    setIsLoading(true)
    setHasUpvoted(true)
    setUpvotes(upvotes + 1)

    const { error } = await supabase
      .from('reports')
      .update({ upvotes: upvotes + 1 })
      .eq('id', reportId)

    if (error) {
      setHasUpvoted(false)
      setUpvotes(upvotes)
    }

    setIsLoading(false)
  }

  return (
    <button
      onClick={handleUpvote}
      disabled={hasUpvoted || isLoading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        hasUpvoted
          ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
          : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      <ThumbsUp size={14} className={hasUpvoted ? 'fill-current' : ''} />
      <span>{upvotes}</span>
    </button>
  )
}
