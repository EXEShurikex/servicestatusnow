'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { submitReport } from '@/lib/status'

interface ReportFormProps {
  serviceId: string
  serviceName: string
  onSuccess?: () => void
}

export function ReportForm({ serviceId, serviceName, onSuccess }: ReportFormProps) {
  const [issueType, setIssueType] = useState('website')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { error } = await submitReport({
      serviceId,
      issueType,
      description: description.trim() || undefined,
      location: location.trim() || undefined,
    })

    setIsSubmitting(false)

    if (!error) {
      setSubmitted(true)
      setIssueType('website')
      setDescription('')
      setLocation('')

      if (onSuccess) {
        onSuccess()
      }

      setTimeout(() => setSubmitted(false), 5000)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Report an issue with {serviceName}
      </h3>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
          Thank you! Your report has been submitted.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
              Issue Type
            </label>
            <select
              id="issueType"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            >
              <option value="website">Website</option>
              <option value="app">Mobile App</option>
              <option value="login">Login Issues</option>
              <option value="payments">Payments</option>
              <option value="api">API</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the issue you're experiencing..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location (optional)
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., New York, NY"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      )}
    </div>
  )
}
