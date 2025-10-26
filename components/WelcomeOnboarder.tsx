'use client';

import { User, Role } from '@prisma/client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProfileOnboarding from '@/components/ProfileOnboarding';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import InteractiveTutorial from '@/components/InteractiveTutorial';

interface WelcomeOnboarderProps {
  user: User;
  askCount: number;
  offerCount: number;
}

export default function WelcomeOnboarder({ user, askCount, offerCount }: WelcomeOnboarderProps) {
  // Only show onboarding if profile is incomplete and not already completed (localStorage)
  const needsProfile = !user.name || !user.bio || !user.headline || !user.education || !user.skills || user.skills.length === 0;
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return needsProfile && !localStorage.getItem('onboarding-completed');
    }
    return false; // Default to false on server-side render
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  // Student onboarding flow
  if (user.role === Role.STUDENT) {
    if (showOnboarding) {
      return (
        <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
          <DialogContent className="max-w-lg">
            <DialogTitle className="sr-only">Profile Onboarding</DialogTitle>
            <ProfileOnboarding user={user} onComplete={handleOnboardingComplete} />
          </DialogContent>
        </Dialog>
      );
    } else if (askCount === 0) {
      return (
        <Card className="mb-6 border-primary/20 bg-background/80 backdrop-blur-sm shadow-md">
          <CardHeader>
            <CardTitle>Your profile is all set! ✨</CardTitle>
            <CardDescription>
              Post your first &quot;Ask&quot;! Share what you need help with - whether it&apos;s a project, skill, or career advice. Alumni are waiting to help!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/student/ask/new">
              <Button className="group">
                Create Your First Ask
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardContent>
          <div className="absolute -z-10 inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg" />
        </Card>
      );
    } else {
      // Show tutorial for students who have completed profile and created at least one ask
      return (
        <div data-tutorial="tutorial-container">
          <InteractiveTutorial 
            role={Role.STUDENT} 
            onComplete={() => {
              // Save tutorial completion to localStorage or database
              localStorage.setItem('tutorial-completed-student', 'true');
            }} 
          />
        </div>
      );
    }
  }

  // Alumni onboarding flow
  if (user.role === Role.ALUMNI) {
    if (showOnboarding) {
      return (
        <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
          <DialogContent className="max-w-lg">
            <DialogTitle className="sr-only">Profile Onboarding</DialogTitle>
            <ProfileOnboarding user={user} onComplete={handleOnboardingComplete} />
          </DialogContent>
        </Dialog>
      );
    } else if (offerCount === 0) {
      return (
        <Card className="mb-6 border-primary/20 bg-background/80 backdrop-blur-sm shadow-md">
          <CardHeader>
            <CardTitle>Your profile is all set! ✨</CardTitle>
            <CardDescription>
              Post your first &quot;Offer&quot;! Share how you can help students - whether it&apos;s 3 resume reviews, mentoring on React, or career advice. Students are waiting to connect!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/alumni/offer/new">
              <Button className="group">
                Create Your First Offer
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardContent>
          <div className="absolute -z-10 inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg" />
        </Card>
      );
    } else {
      // Show tutorial for alumni who have completed profile and created at least one offer
      return (
        <div data-tutorial="tutorial-container">
          <InteractiveTutorial 
            role={Role.ALUMNI} 
            onComplete={() => {
              // Save tutorial completion to localStorage or database
              localStorage.setItem('tutorial-completed-alumni', 'true');
            }} 
          />
        </div>
      );
    }
  }

  // If profile is complete and they have asks/offers, don't show the card
  return null;
}