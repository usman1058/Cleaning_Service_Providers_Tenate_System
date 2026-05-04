'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Shield, Users, CheckCircle2, Clock, Leaf, Target, Award, Globe } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              About Global Green Services
            </h2>
            <p className="text-xl text-muted-foreground">
              Your trusted partner for professional, eco-friendly cleaning services
            </p>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Who We Are
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Global Green Services is a premier cleaning platform that connects clients with professional cleaning teams through a carefully managed system. We believe in providing exceptional cleaning services while maintaining strict quality control, transparency, and environmental responsibility.
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-6">
                Our Mission
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To revolutionize the cleaning industry by providing accessible, reliable, and environmentally conscious cleaning services that exceed customer expectations. We aim to create a platform where quality meets convenience, and where every space can be transformed into a clean, healthy environment.
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-6">
                Our Vision
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To become the most trusted name in professional cleaning services, setting the standard for quality, sustainability, and customer satisfaction across all our service areas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Our Core Values
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Trust & Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We maintain complete transparency in all our operations and uphold the highest ethical standards in every interaction.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Leaf className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Sustainability</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We prioritize eco-friendly products and sustainable practices to minimize our environmental impact.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We strive for perfection in every service, maintaining rigorous quality standards and continuous improvement.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Customer Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our clients' satisfaction is our priority. We listen, adapt, and deliver services that exceed expectations.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">
                How Our Platform Works
              </h3>
              <p className="text-lg text-muted-foreground">
                A streamlined process designed for your convenience and peace of mind
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">
                    Browse & Select Services
                  </h4>
                  <p className="text-muted-foreground">
                    Explore our comprehensive range of cleaning services, view detailed descriptions, and choose the service that best fits your needs. All services are managed and verified by our admin team.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">
                    Submit Your Request
                  </h4>
                  <p className="text-muted-foreground">
                    Fill out a simple form with your service requirements. No registration is needed to submit a request – we keep the process friction-free.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">
                    Upload Payment Receipt
                  </h4>
                  <p className="text-muted-foreground">
                    Share your payment proof with us. Our admin team verifies all receipts promptly to ensure smooth processing.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  4
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">
                    Verification & Assignment
                  </h4>
                  <p className="text-muted-foreground">
                    Our team verifies your payment and assigns a verified cleaning professional to handle your request. You'll receive confirmation and scheduling details.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  5
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">
                    Service & Tracking
                  </h4>
                  <p className="text-muted-foreground">
                    Your cleaning service is performed according to the highest standards. Track the progress through your client dashboard with real-time updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Assurance */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-primary-foreground mb-6">
              Quality Assurance Process
            </h3>
            <p className="text-xl text-primary/80 mb-12">
              Every service goes through our rigorous quality control system
            </p>

            <div className="grid md:grid-cols-3 gap-8 text-primary-foreground">
              <div>
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Pre-Service Verification</h4>
                <p className="text-primary/80">
                  All vendors are thoroughly vetted, trained, and regularly assessed.
                </p>
              </div>

              <div>
                <Users className="h-16 w-16 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Admin Supervision</h4>
                <p className="text-primary/80">
                  Every assignment is monitored by our admin team to ensure quality.
                </p>
              </div>

              <div>
                <Clock className="h-16 w-16 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Post-Service Review</h4>
                <p className="text-primary/80">
                  Services are reviewed and approved only after meeting our standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">
                Why Choose Global Green Services?
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Managed Platform</h4>
                      <p className="text-sm text-muted-foreground">
                        All operations are centrally managed, ensuring consistent quality and accountability.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Verified Professionals</h4>
                      <p className="text-sm text-muted-foreground">
                        All cleaning partners are background-checked, trained, and continuously monitored.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Eco-Friendly Approach</h4>
                      <p className="text-sm text-muted-foreground">
                        We use environmentally safe products and sustainable cleaning methods.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Transparent Pricing</h4>
                      <p className="text-sm text-muted-foreground">
                        Clear pricing with no hidden fees. What you see is what you pay.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Real-Time Tracking</h4>
                      <p className="text-sm text-muted-foreground">
                        Monitor your service status from booking to completion through your dashboard.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Dedicated Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Our support team is available to assist you throughout your service journey.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <Globe className="h-16 w-16 text-primary mx-auto mb-4" />
          <h3 className="text-3xl font-bold mb-4">
            Ready to Experience Excellence?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Global Green Services for their cleaning needs.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/services">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Browse Services
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Global Green Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
