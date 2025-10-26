'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

export default function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (command: () => void) => {
    command()
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative overflow-hidden transition-all duration-300 group"
        onClick={() => setOpen(true)}
      >
        <Menu className="sm:hidden h-4 w-4" />
        <span className="hidden sm:block">⌘K</span>
        
        {/* Dot Ripple Effect */}
        <span className="absolute inset-0 pointer-events-none grid grid-cols-[repeat(10,1fr)] grid-rows-[repeat(10,1fr)] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {Array.from({ length: 100 }).map((_, i) => (
            <span 
              key={i}
              className="h-[2px] w-[2px] rounded-full bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ 
                transitionDelay: `${(i % 10) * 50}ms`,
                animationDelay: `${(i % 10) * 100}ms`,
              }}
            />
          ))}
        </span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex flex-col">
          <div className="sr-only" id="command-menu-title">Command Menu</div>
          <CommandInput placeholder="Type a command or search..." aria-labelledby="command-menu-title" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem
                onSelect={() => runCommand(() => router.push('/'))}
                className="flex cursor-pointer items-center px-4 py-3 text-sm hover:bg-accent rounded-md transition-colors"
              >
                <span className="font-medium">Dashboard</span>
              </CommandItem>
              <CommandItem
                onSelect={() => runCommand(() => {
                  const userId = session?.user?.id
                  if (userId) {
                    router.push(`/profile/${userId}`)
                  }
                })}
                className="flex cursor-pointer items-center px-4 py-3 text-sm hover:bg-accent rounded-md transition-colors"
              >
                <span className="font-medium">Profile</span>
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Actions">
              <CommandItem
                onSelect={() => runCommand(() => signOut())}
                className="flex cursor-pointer items-center px-4 py-3 text-sm hover:bg-accent rounded-md transition-colors text-destructive"
              >
                <span className="font-medium">Sign Out</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </div>
      </CommandDialog>
    </>
  )
}