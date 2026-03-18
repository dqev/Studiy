import * as React from 'react';
import {
  ArrowRight,
  BookOpen,
  Users,
  Shield,
  Zap,
  CheckCircle2,
  Search,
  Download,
  Share2,
  X,
  GraduationCap,
  Globe,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { useAuth } from '@/src/context/AuthContext';
import { UserRole } from '@/src/types';

export function LandingPage() {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Fast redirect for already authenticated users (check localStorage first)
  React.useEffect(() => {
    const cachedUser = localStorage.getItem('cachedUser');
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        // Redirect immediately based on cached role
        if (userData.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/user', { replace: true });
        }
      } catch (e) {
        // If parsing fails, fallback to normal auth check
      }
    }
  }, [navigate]);

  // Backup: redirect if auth context updates (for new login)
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === UserRole.ADMIN) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/user', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Success Stories', href: '#success-stories' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 sm:pb-24">
      {/* Header/Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/icon.png"
                alt="Studiy Logo"
                className="h-6 sm:h-5 w-6 sm:w-5 rounded-lg"
              />
              <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Studiy</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex items-center space-x-3 pl-4 lg:pl-6 border-l border-slate-200">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-sm">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="text-sm">Sign up</Button>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <svg viewBox="0 0 16 16" fill="#000000" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
                    <path d="M10.666666666666666 12v1.3333333333333333H3.333333333333333v-1.3333333333333333h7.333333333333333Zm3.333333333333333 -4.666666666666666v1.3333333333333333H2v-1.3333333333333333h12Zm-1.3333333333333333 -4.666666666666666v1.3333333333333333H5.333333333333333V2.6666666666666665h7.333333333333333Z" strokeWidth="0.6667"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden bg-white animate-in slide-in-from-top duration-200">
            <div className="px-3 sm:px-4 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-3 pb-2 space-y-2 px-3">
                <Link to="/login" className="block" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full text-sm" size="sm">Log in</Button>
                </Link>
                <Link to="/signup" className="block" onClick={() => setIsOpen(false)}>
                  <Button className="w-full text-sm" size="sm">Sign up</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content with top padding */}
      <div className="space-y-16 sm:space-y-24 pt-12 sm:pt-16 lg:pt-20">
        {/* Hero Section */}
        <section className="relative pt-8 sm:pt-12 pb-8 sm:pb-12 lg:pt-24 lg:pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
              <Badge variant="secondary" className="px-2.5 sm:px-3 py-1 text-indigo-600 bg-indigo-50 border-none text-[9px] sm:text-xs inline-block">
                New: Collaborative Study Groups are here!
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                The ultimate hub for <span className="text-indigo-600">student resources.</span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Share, discover, and collaborate on study materials with thousands of students worldwide.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 rounded-2xl">
                    Get Started <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base h-10 sm:h-12 px-6 sm:px-8 rounded-2xl border-none bg-slate-100 hover:bg-slate-200">
                    Browse Resources
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 sm:pt-6 grayscale opacity-50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-3.5 sm:h-5" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" alt="IBM" className="h-3.5 sm:h-5" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="h-3.5 sm:h-5" />
              </div>
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full blur-[120px]"></div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Everything you need to excel</h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600">Powerful tools designed to help you manage your academic life more efficiently.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: 'Resource Library',
                description: 'Access millions of notes, summaries, and practice exams uploaded by top students.',
                icon: BookOpen,
                color: 'bg-blue-50 text-blue-600',
              },
              {
                title: 'Collaborative Groups',
                description: 'Join study groups and work together in real-time on shared projects and assignments.',
                icon: Users,
                color: 'bg-indigo-50 text-indigo-600',
              },
              {
                title: 'Verified Content',
                description: 'Our moderation team ensures all resources are accurate and high-quality.',
                icon: Shield,
                color: 'bg-emerald-50 text-emerald-600',
              },
              {
                title: 'Instant Search',
                description: 'Find exactly what you need in seconds with our advanced AI-powered search engine.',
                icon: Search,
                color: 'bg-purple-50 text-purple-600',
              },
              {
                title: 'Offline Access',
                description: 'Download resources and study anywhere, even without an internet connection.',
                icon: Download,
                color: 'bg-orange-50 text-orange-600',
              },
              {
                title: 'Smart Analytics',
                description: 'Track your progress and get personalized recommendations based on your study habits.',
                icon: Zap,
                color: 'bg-pink-50 text-pink-600',
              },
            ].map((feature, i) => (
              <Card key={i} className="border-none bg-slate-50 rounded-2xl group">
                <CardContent className="pt-6 sm:pt-8">
                  <div className={`${feature.color} w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Success Stories Section */}
        <section id="success-stories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">Join Thousands of Successful Students</h2>
            <p className="text-base sm:text-lg text-slate-600">See how Studiy has transformed academic journeys</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                name: 'Sarah Ahmed',
                role: 'Engineering Student',
                quote: 'Studiy helped me organize my notes and find resources I was struggling to find. My grades improved by 2 points!',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
                rating: 5
              },
              {
                name: 'Marcus Chen',
                role: 'Medical Student',
                quote: 'The community is amazing. I got help from senior students and now I am also mentoring juniors here.',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
                rating: 5
              },
              {
                name: 'Priya Sharma',
                role: 'Law Student',
                quote: 'The verified resources saved me so much time researching. I recommend Studiy to all my friends now.',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
                rating: 5
              },
            ].map((testimonial, i) => (
              <Card key={i} className="border-none rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">{testimonial.name}</h4>
                      <p className="text-xs sm:text-sm text-slate-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xs sm:text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {[
              { q: 'Is Studiy free to use?', a: 'Yes! Studiy offers a generous free plan that includes access to most resources and community features.' },
              { q: 'How do I earn rewards for sharing?', a: 'Every time someone downloads your resource or gives it a high rating, you earn points that can be redeemed for premium features.' },
              { q: 'Can I use it on my mobile device?', a: 'Absolutely. Studiy is fully responsive and we also have native apps for iOS and Android.' },
              { q: 'Is my data secure?', a: 'We take privacy seriously. Your data is encrypted and we never share your personal information with third parties.' },
            ].map((faq, i) => (
              <Card key={i} className="border-none rounded-2xl shadow-none hover:bg-slate-50 transition-colors">
                <CardContent className="p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5 sm:mb-2">{faq.q}</h4>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Community Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-16">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Join Our Community</h2>
                <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
                  Be part of a global network of learners sharing knowledge and growing together.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 sm:gap-6 pt-4 sm:pt-6 lg:pt-8">
                {[
                  {
                    Icon: GraduationCap,
                    title: 'Learn Anywhere',
                    desc: 'Access resources on any device, anytime you need them.',
                    color: 'text-blue-600'
                  },
                  {
                    Icon: Users,
                    title: 'Collaborate',
                    desc: 'Connect with peers and build lasting study partnerships.',
                    color: 'text-indigo-600'
                  },
                  {
                    Icon: Zap,
                    title: 'Grow Together',
                    desc: 'Share your knowledge and help others succeed too.',
                    color: 'text-purple-600'
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 sm:p-8">
                    <div className={`${item.color} mb-4`}>
                      <item.Icon className="h-8 w-8 sm:h-10 sm:w-10" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm sm:text-base text-slate-600">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 sm:pt-6">
                <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">Ready to join thousands of students?</p>
                <Link to="/signup">
                  <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 h-10 sm:h-12 px-8 text-sm sm:text-base rounded-2xl">
                    Sign Up Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
