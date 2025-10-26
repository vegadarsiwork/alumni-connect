import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Bot, Users, TrendingUp } from "lucide-react"
import AlternatingText from "@/components/AlternatingText"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


 export const metadata: Metadata = {
  title: "Auxilium - Connect Students with Alumni",
  description: "The AI-Powered Platform Connecting Students to Alumni Opportunities",
}

 export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white items-center">
      {/* Header/Navbar */}
      <header className="container max-w-7xl flex items-center justify-between py-6 border-b border-dashed border-white/20">
        <div className="flex items-center gap-2">
          <Image src="/auxilium-logo.svg" alt="Auxilium Logo" width={40} height={40} />
          <h1 className="text-2xl font-dot tracking-wider">AUXILIUM</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="border-dashed text-white hover:bg-white/10" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button className="bg-[#6B46C1] hover:bg-[#805AD5] text-white font-bold" asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center pt-20 pb-0 text-center relative min-h-screen overflow-hidden">
        <div className="relative z-10 mx-auto container">
          <h1 className="text-4xl md:text-5xl font-dotmatrix tracking-wider leading-tight mb-6">
            <span className="inline-block transition-colors duration-200 hover:text-purple-400 hover:scale-105">Unlock</span>{' '}
            <span className="inline-block transition-colors duration-200 hover:text-purple-400 hover:scale-105">your</span>{' '}
            <AlternatingText words={["college&apos;s", "alumni&apos;s", "school&apos;s", "campus&apos;"]} intervalMs={1700} className="inline-block transition-colors duration-200 hover:scale-105" initialColor="text-purple-400" hoverColor="text-white" />{' '}
            <br></br>
            <span className="inline-block transition-colors duration-200 hover:text-purple-400 hover:scale-105">full</span>{' '}
            <span className="inline-block transition-colors duration-200 hover:text-purple-400 hover:scale-105">potential.</span>
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="shimmer-button bg-[#6B46C1] hover:bg-[#805AD5] text-white font-bold shadow-mono-sharp group" asChild>
              <Link href="/register">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 animate-arrow" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-dashed hover:bg-white/10" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
        <Image
             src="/hero_logo.webp"
             alt="Hero Background"
             width={1920}
             height={1080}
             className="w-full object-contain mb-auto"
           />
      </section>

      {/* Features Section */}
      <section id="features" className="container max-w-7xl py-20 border-t border-dashed border-white/20">
        <h2 className="text-3xl md:text-4xl font-dotmatrix tracking-wider text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-dashed border-white/20 bg-black text-white">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#6B46C1]/10">
                <Bot className="h-5 w-5 text-[#6B46C1]" />
              </div>
              <CardTitle className="font-dotmatrix tracking-wider mb-2">
                Intelligent Matching
              </CardTitle>
              <CardDescription className="text-white/70 font-mono">
                AI matches student &apos;Asks&apos; with relevant alumni &apos;Offers&apos;.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-dashed border-white/20 bg-black text-white">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#6B46C1]/10">
                <Users className="h-5 w-5 text-[#6B46C1]" />
              </div>
              <CardTitle className="font-dotmatrix tracking-wider mb-2">
                Scalable Mentorship
              </CardTitle>
              <CardDescription className="text-white/70 font-mono">
                Alumni offer specific help, students find guidance – all in a low-friction system.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-dashed border-white/20 bg-black text-white">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#6B46C1]/10">
                <TrendingUp className="h-5 w-5 text-[#6B46C1]" />
              </div>
              <CardTitle className="font-dotmatrix tracking-wider mb-2">
                Measurable Impact
              </CardTitle>
              <CardDescription className="text-white/70 font-mono">
                University dashboard quantifies engagement and identifies opportunity gaps.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container max-w-7xl py-20 bg-white/5">
        <h2 className="text-3xl md:text-4xl font-dotmatrix tracking-wider text-center mb-12">
          Trusted by Our Community
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-dashed border-white/20 bg-black text-white">
            <CardContent className="pt-6">
              <p className="font-mono text-lg mb-4">
                &quot;Auxilium connected me with an alumni who helped me land my dream internship. The platform made it so easy to find exactly the right mentor.&quot;
              </p>
              <Separator className="my-4 border-dashed border-white/20" />
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[#6B46C1]/20 flex items-center justify-center">
                  <span className="font-dotmatrix">JS</span>
                </div>
                <div>
                  <p className="font-medium">Jamie Smith</p>
                  <p className="text-sm text-white/70 font-mono">Computer Science Student</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-dashed border-white/20 bg-black text-white">
            <CardContent className="pt-6">
              <p className="font-mono text-lg mb-4">
                &quot;As an alumni, I wanted to give back but didn&apos;t know how. Auxilium made it simple to offer my expertise in a way that fits my schedule.&quot;
              </p>
              <Separator className="my-4 border-dashed border-white/20" />
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[#6B46C1]/20 flex items-center justify-center">
                  <span className="font-dotmatrix">AR</span>
                </div>
                <div>
                  <p className="font-medium">Alex Rodriguez</p>
                  <p className="text-sm text-white/70 font-mono">Software Engineer, Class of 2018</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container max-w-7xl py-20 border-t border-dashed border-white/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-dotmatrix tracking-wider mb-4">
            Ready to Elevate Your Network?
          </h2>
          <p className="text-xl text-white/70 mb-8 font-mono">
            Join the future of alumni-student connection today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="flex-1">
              <Label htmlFor="email" className="sr-only">
                University Email
              </Label>
              <Input
                id="email"
                placeholder="University Email"
                type="email"
                className="w-full bg-black border-dashed border-white/20 text-white"
              />
            </div>
            <Button className="bg-[#6B46C1] hover:bg-[#805AD5] text-white font-bold shadow-mono-sharp">
              Request a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dashed border-white/20 bg-black py-8 mt-auto">
        <div className="container max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image src="/auxilium-logo.svg" alt="Auxilium Logo" width={30} height={30} />
              <span className="font-dotmatrix text-lg">AUXILIUM</span>
            </div>
            <div className="text-sm text-white/70 font-mono">
              &copy; {new Date().getFullYear()} Auxilium. All rights reserved.
            </div>
            <div className="flex gap-4 text-sm font-mono">
              <Link href="#" className="text-white/70 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="#" className="text-white/70 hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
              words={[
                "alumni&apos;s insights",
                "student&apos;s potential",
                "connections that matter",
                "mentorship opportunities",
              ]}