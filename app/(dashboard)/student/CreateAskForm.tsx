'use client'

import { useRef, useState } from 'react'
import { createAsk } from '@/app/actions'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function CreateAskForm() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const submittingRef = useRef(false)
  const { push } = useToast()

  async function handleSubmit(formData: FormData) {
  if (submittingRef.current) return
  submittingRef.current = true
  setIsLoading(true)
    try {
      const title = (formData.get('title') as string || '').trim()
      const MAX_TITLE = 100
      if (!title) throw new Error('Title is required')
      if (title.length > MAX_TITLE) throw new Error(`Title must be at most ${MAX_TITLE} characters`)
      await createAsk(formData)
      formRef.current?.reset()
      setOpen(false)
      push({ title: 'Ask created!', type: 'success' })
    } catch (error) {
      push({ title: error instanceof Error ? error.message : 'Failed to create ask', type: 'error' })
    } finally {
      setIsLoading(false)
  submittingRef.current = false
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Create New Ask</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a New Ask</DialogTitle>
          <DialogDescription>
            Post something you need help with from alumni
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Need help with React hooks"
              required
              disabled={isLoading}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe what you need help with..."
              required
              disabled={isLoading}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="e.g., react, javascript, frontend"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub URL (optional)</Label>
            <Input
              id="githubUrl"
              name="githubUrl"
              type="url"
              placeholder="https://github.com/..."
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Ask'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
