'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Check, User, Briefcase, GraduationCap, Code } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Role } from '@prisma/client';
import { updateProfile } from '@/app/actions';
import { toast } from 'sonner';

interface ProfileOnboardingProps {
  user: {
    id: string;
    name: string | null;
    role: Role;
    email: string;
  };
  onComplete?: () => void;
}
export default function ProfileOnboarding({ user, onComplete }: ProfileOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: '',
    skills: [] as string[],
    currentSkill: '',
    education: '',
    experience: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const totalSteps = 4;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (formData.currentSkill.trim() && !formData.skills.includes(formData.currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.currentSkill.trim()],
        currentSkill: ''
      }));
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create FormData to match the updateProfile action signature
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('headline', formData.bio);
      formDataToSubmit.append('education', formData.education);
      formDataToSubmit.append('skills', formData.skills.join(', '));
      formDataToSubmit.append('availability', 'AVAILABLE');
      formDataToSubmit.append('image', ''); // Empty for now
      
      const result = await updateProfile(formDataToSubmit);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        if (typeof onComplete === 'function') onComplete();
        router.push(`/profile/${user.id}`);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-primary/20 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              Build Your Profile
            </motion.div>
          </CardTitle>
          <CardDescription>
            Complete your profile to get the most out of Auxilium
          </CardDescription>
          <div className="mt-4 flex justify-center space-x-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <motion.div
                key={i}
                className={`h-2 w-12 rounded-full ${
                  i + 1 === step ? 'bg-primary' : i + 1 < step ? 'bg-primary/60' : 'bg-muted'
                }`}
                initial={{ width: 0 }}
                animate={{ width: '3rem' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Basic Information</h3>
                    <p className="text-sm text-muted-foreground">Let&apos;s start with the essentials</p>
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us a bit about yourself"
                      rows={4}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Code className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Skills & Expertise</h3>
                    <p className="text-sm text-muted-foreground">What are you good at?</p>
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentSkill">Add Skills</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="currentSkill"
                        name="currentSkill"
                        value={formData.currentSkill}
                        onChange={handleChange}
                        placeholder="e.g., JavaScript, React, UI Design"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddSkill} variant="outline">
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} className="flex items-center gap-1 px-3 py-1.5">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 rounded-full p-1 hover:bg-primary/20"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    {formData.skills.length === 0 && (
                      <p className="text-sm text-muted-foreground">No skills added yet</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Education</h3>
                    <p className="text-sm text-muted-foreground">Your academic background</p>
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">Education</Label>
                    <Textarea
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder="e.g., B.Tech in Computer Science, BITS Pilani (2018-2022)"
                      rows={4}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Experience</h3>
                    <p className="text-sm text-muted-foreground">Your professional journey</p>
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Work Experience</Label>
                    <Textarea
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="e.g., Software Engineer at Google (2022-Present)"
                      rows={4}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between px-6 py-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            onClick={nextStep}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {step === totalSteps ? (
              isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <span>Complete</span>
                  <Check className="h-4 w-4" />
                </>
              )
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}