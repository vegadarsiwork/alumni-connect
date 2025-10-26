'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';
import { Role } from '@prisma/client';

interface TutorialStep {
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

interface InteractiveTutorialProps {
  role: Role;
  onComplete: () => void;
}

export default function InteractiveTutorial({ role, onComplete }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null);

  // Define tutorial steps based on user role
  const tutorialSteps: TutorialStep[] = React.useMemo(() => {
    return role === Role.STUDENT 
      ? [
          {
            title: 'Create an Ask',
            description: 'Click here to create a new request for help with a project, skill, or career advice.',
            targetSelector: '[data-tutorial="create-ask"]',
            position: 'bottom'
          },
          {
            title: 'View Your Asks',
            description: 'All your requests will appear here. Track their status and see matched alumni.',
            targetSelector: '[data-tutorial="asks-section"]',
            position: 'top'
          },
          {
            title: 'Check Notifications',
            description: 'Stay updated on connection requests, acceptances, and more.',
            targetSelector: '[data-tutorial="notification-bell"]',
            position: 'bottom'
          }
        ]
      : [
          {
            title: 'Create an Offer',
            description: 'Click here to create a new offer to help students with your expertise.',
            targetSelector: '[data-tutorial="create-offer"]',
            position: 'bottom'
          },
          {
            title: 'View Your Offers',
            description: 'All your offers will appear here. Manage and update them anytime.',
            targetSelector: '[data-tutorial="offers-section"]',
            position: 'top'
          },
          {
            title: 'Manage Connections',
            description: 'View and respond to student requests for your expertise.',
            targetSelector: '[data-tutorial="connections-section"]',
            position: 'top'
          }
        ];
  }, [role]);

  useEffect(() => {
    const updateTargetPosition = () => {
      const currentTarget = document.querySelector(tutorialSteps[currentStep].targetSelector);
      if (currentTarget) {
        setTargetElement(currentTarget.getBoundingClientRect());
      }
    };

    updateTargetPosition();
    
    // Update position on resize
    window.addEventListener('resize', updateTargetPosition);
    
    // Add data-highlighted attribute to target element
    const targetEl = document.querySelector(tutorialSteps[currentStep].targetSelector);
    if (targetEl) {
      targetEl.setAttribute('data-highlighted', 'true');
    }
    
    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      // Remove data-highlighted attribute
      const targetEl = document.querySelector(tutorialSteps[currentStep].targetSelector);
      if (targetEl) {
        targetEl.removeAttribute('data-highlighted');
      }
    };
  }, [currentStep, tutorialSteps]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    // Add a small delay before calling onComplete to allow animation to finish
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  if (!isVisible || !targetElement) return null;

  // Calculate position for the tooltip
  const getTooltipPosition = () => {
    const { position } = tutorialSteps[currentStep];
    const { top, left, width, height } = targetElement;
    const padding = 20;
    
    switch (position) {
      case 'top':
        return {
          top: top - 150 - padding,
          left: left + width / 2 - 150
        };
      case 'right':
        return {
          top: top + height / 2 - 75,
          left: left + width + padding
        };
      case 'bottom':
        return {
          top: top + height + padding,
          left: left + width / 2 - 150
        };
      case 'left':
        return {
          top: top + height / 2 - 75,
          left: left - 300 - padding
        };
      default:
        return {
          top: top + height + padding,
          left: left + width / 2 - 150
        };
    }
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/50" />
      
      {/* Highlight effect */}
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          top: targetElement.top - 10,
          left: targetElement.left - 10,
          width: targetElement.width + 20,
          height: targetElement.height + 20,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
          borderRadius: '8px'
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.8), 0 0 0 8px rgba(99, 102, 241, 0.3)',
          }}
        />
      </div>
      
      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="fixed z-50"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            width: '300px'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">
                  {tutorialSteps[currentStep].title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleComplete}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {tutorialSteps[currentStep].description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between pt-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: tutorialSteps.length }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i === currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="h-8"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="h-8"
                >
                  {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'} 
                  {currentStep !== tutorialSteps.length - 1 && <ArrowRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
}