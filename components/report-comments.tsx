'use client'

import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { supabase, ReportComment } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'

interface ReportCommentsProps {
  reportId: string
}

export function ReportComments({ reportId }: ReportCommentsProps) {
  const [comments, setComments] = useState<ReportComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadComments()
    }
  }, [isOpen, reportId])

  const loadComments = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('report_comments')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setComments(data)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)

    const { data, error } = await supabase
      .from('report_comments')
      .insert({
        report_id: reportId,
        comment_text: newComment.trim(),
      })
      .select()
      .single()

    if (!error && data) {
      setComments([data, ...comments])
      setNewComment('')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <MessageSquare size={14} />
        <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              className="w-full text-sm rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          {isLoading ? (
            <div className="text-sm text-gray-500">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-sm text-gray-500">No comments yet. Be the first to comment!</div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="text-sm">
                  <p className="text-gray-700">{comment.comment_text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
