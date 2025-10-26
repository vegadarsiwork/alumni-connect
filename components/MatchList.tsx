'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { requestConnection } from '@/app/actions';

interface Match {
  id: string;
  title: string;
  description: string;
  tags: string[];
  matchReason: string;
  slots: number;
  totalSlots: number;
  author: {
    id: string;
    name: string;
    email: string;
  };
  authorId: string;
}

interface MatchListProps {
  askId: string;
}

export default function MatchList({ askId }: MatchListProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestingConnection, setRequestingConnection] = useState<string | null>(null);
  const [requestedMatches, setRequestedMatches] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchMatches() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/match/${askId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load matches');
        }

        const data = await response.json();
        setMatches(data);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError('Could not load matches. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMatches();
  }, [askId]);

  async function handleRequestConnection(offerId: string, alumId: string) {
    try {
      setRequestingConnection(offerId);
      await requestConnection(askId, offerId, alumId);
      setRequestedMatches(prev => new Set(prev).add(offerId));
      alert('Connection requested successfully!');
    } catch (err: Error) {
      console.error('Error requesting connection:', err);
      alert(err.message || 'Failed to request connection');
    } finally {
      setRequestingConnection(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading matches...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No matches found at this time. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {matches.map((match, index) => (
        <Card key={match.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <Badge variant="default" className="mb-2">
                #{index + 1} Match
              </Badge>
              {match.slots > 0 && match.slots <= 3 && (
                <Badge variant="destructive" className="mb-2">
                  🔥 Only {match.slots} slots left this month!
                </Badge>
              )}
              {match.slots > 3 && (
                <Badge variant="outline" className="mb-2">
                  {match.slots} slots available this month
                </Badge>
              )}
              {match.slots === 0 && (
                <Badge variant="secondary" className="mb-2">
                  Fully Booked
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{match.title}</CardTitle>
            <CardDescription className="text-white">
              by{' '}
              <Link href={`/profile/${match.authorId}`} className="hover:underline font-medium">
                {match.author.name}
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-white mb-4">{match.description}</p>
            <div className="flex flex-wrap gap-2">
              {match.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start border-t pt-4">
            <Badge variant="outline" className="w-full justify-start text-left whitespace-normal h-auto py-2 bg-black text-white border-transparent pr-4">
              <span className="mr-2 text-yellow-400">⭐</span>
              <span className="text-xs">
                <strong>AI Reason:</strong> {match.matchReason}
              </span>
            </Badge>
            <div className="w-full mt-4">
              <Button
                onClick={() => handleRequestConnection(match.id, match.authorId)}
                disabled={requestingConnection === match.id || requestedMatches.has(match.id)}
                className="w-full"
              >
                {requestingConnection === match.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting...
                  </>
                ) : requestedMatches.has(match.id) ? (
                  'Request Sent'
                ) : (
                  'Request Connection'
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}