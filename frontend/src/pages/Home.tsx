import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  IconArrowRight,
  IconCheckCircle,
  IconSparkles,
  IconDatabase,
  IconAPI,
  IconBrain,
  IconShield,
  IconZap,
  IconGithub,
  IconTwitter,
  IconLinkedin,
} from '@/components/Icons'
import oneAppLogo from '@/logo/icon.png'
import styles from './Home.module.css'

export function Home() {
  const navigate = useNavigate()
  const [typedText, setTypedText] = useState('')
  const fullText = 'Your All-in-One Platform for Modern Development'

  // Enable scrolling on body for home page
  useEffect(() => {
    const root = document.getElementById('root')
    document.body.classList.add('auth-page')
    document.documentElement.classList.add('auth-page')
    if (root) root.classList.add('auth-page')
    return () => {
      document.body.classList.remove('auth-page')
      document.documentElement.classList.remove('auth-page')
      if (root) root.classList.remove('auth-page')
    }
  }, [])

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
      }
    }, 50)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <motion.section
        className={styles.hero}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className={styles.particles}>
          {Array.from({ length: 50 }).map((_, i) => {
            // Use deterministic seed-based values to prevent re-render loops
            const seed = i * 1000
            const xOffset = ((seed * 9301 + 49297) % 233280) / 233280 * 100 - 50
            const yOffset = (((seed + 1) * 9301 + 49297) % 233280) / 233280 * 100 - 50
            const duration = ((seed * 2) % 3000) / 1000 + 2
            const delay = ((seed * 3) % 2000) / 1000
            return (
              <motion.div
                key={i}
                className={styles.particle}
                animate={{
                  x: [0, xOffset],
                  y: [0, yOffset],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  delay,
                }}
              />
            )
          })}
        </div>
        <div className={styles.heroContent}>
          <motion.div
            className={styles.heroLogo}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <img src={oneAppLogo} alt="OneApp Logo" />
          </motion.div>
          <motion.h1
            className={styles.heroTitle}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Welcome to <span className={styles.gradientText}>OneApp</span>
          </motion.h1>
          <motion.p
            className={styles.heroSubtitle}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {typedText}
            <span className={styles.cursor}>|</span>
          </motion.p>
          <motion.div
            className={styles.heroButtons}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <button
              className={styles.primaryButton}
              onClick={() => navigate('/login')}
            >
              Login
              <IconArrowRight />
            </button>
            <button
              className={styles.secondaryButton}
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </motion.div>
        </div>
        <motion.div
          className={styles.scrollIndicator}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className={styles.scrollArrow} />
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <SectionWrapper>
        <h2 className={styles.sectionTitle}>Powerful Features</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </SectionWrapper>

      {/* Technology Stack Section */}
      <SectionWrapper>
        <h2 className={styles.sectionTitle}>Built with Modern Technology</h2>
        <div className={styles.techGrid}>
          {techStack.map((tech, index) => (
            <TechCard key={index} tech={tech} index={index} />
          ))}
        </div>
      </SectionWrapper>

      {/* Statistics Section */}
      <SectionWrapper>
        <h2 className={styles.sectionTitle}>Trusted by Developers</h2>
        <div className={styles.statsGrid}>
          {statistics.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </SectionWrapper>

      {/* Testimonials Section */}
      <SectionWrapper>
        <h2 className={styles.sectionTitle}>What Our Users Say</h2>
        <div className={styles.testimonials}>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </SectionWrapper>

      {/* Pricing Section */}
      <SectionWrapper>
        <h2 className={styles.sectionTitle}>Choose Your Plan</h2>
        <div className={styles.pricingGrid}>
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </div>
      </SectionWrapper>

      {/* CTA Section */}
      <motion.section
        className={styles.ctaSection}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of developers using OneApp to build amazing applications
          </p>
          <div className={styles.ctaButtons}>
            <button
              className={styles.primaryButton}
              onClick={() => navigate('/signup')}
            >
              Get Started Free
              <IconArrowRight />
            </button>
            <button
              className={styles.secondaryButton}
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>
      </motion.section>

      {/* Footer Section */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>OneApp</h3>
            <p>Your all-in-one platform for modern development</p>
          </div>
          <div className={styles.footerSection}>
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#docs">Documentation</a></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Connect</h4>
            <div className={styles.socialLinks}>
              <a href="#" aria-label="GitHub"><IconGithub /></a>
              <a href="#" aria-label="Twitter"><IconTwitter /></a>
              <a href="#" aria-label="LinkedIn"><IconLinkedin /></a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2024 OneApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function SectionWrapper({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <motion.section
      ref={ref}
      className={styles.section}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.section>
  )
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })
  const Icon = feature.icon

  return (
    <motion.div
      ref={ref}
      className={styles.featureCard}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -10, scale: 1.02 }}
    >
      <div className={styles.featureIcon}>
        <Icon />
      </div>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
    </motion.div>
  )
}

function TechCard({ tech, index }: { tech: typeof techStack[0]; index: number }) {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })

  return (
    <motion.div
      ref={ref}
      className={styles.techCard}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
    >
      <div className={styles.techIcon}>{tech.icon}</div>
      <span>{tech.name}</span>
    </motion.div>
  )
}

function StatCard({ stat, index }: { stat: typeof statistics[0]; index: number }) {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (inView) {
      const duration = 2000
      const steps = 60
      const increment = stat.value / steps
      let current = 0
      const timer = setInterval(() => {
        current += increment
        if (current >= stat.value) {
          setCount(stat.value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)
      return () => clearInterval(timer)
    }
  }, [inView, stat.value])

  return (
    <motion.div
      ref={ref}
      className={styles.statCard}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div className={styles.statValue}>{count}{stat.suffix}</div>
      <div className={styles.statLabel}>{stat.label}</div>
    </motion.div>
  )
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: typeof testimonials[0]
  index: number
}) {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })

  return (
    <motion.div
      ref={ref}
      className={styles.testimonialCard}
      initial={{ opacity: 0, x: -50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.2, duration: 0.5 }}
    >
      <p className={styles.testimonialText}>"{testimonial.text}"</p>
      <div className={styles.testimonialAuthor}>
        <div className={styles.testimonialAvatar}>{testimonial.name[0]}</div>
        <div>
          <div className={styles.testimonialName}>{testimonial.name}</div>
          <div className={styles.testimonialRole}>{testimonial.role}</div>
        </div>
      </div>
    </motion.div>
  )
}

function PricingCard({ plan, index }: { plan: typeof pricingPlans[0]; index: number }) {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })
  const navigate = useNavigate()

  return (
    <motion.div
      ref={ref}
      className={`${styles.pricingCard} ${plan.featured ? styles.featured : ''}`}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -10, scale: 1.02 }}
    >
      {plan.featured && <div className={styles.featuredBadge}>Popular</div>}
      <h3>{plan.name}</h3>
      <div className={styles.pricingAmount}>
        <span className={styles.pricingCurrency}>$</span>
        <span className={styles.pricingValue}>{plan.price}</span>
        <span className={styles.pricingPeriod}>/month</span>
      </div>
      <ul className={styles.pricingFeatures}>
        {plan.features.map((feature, i) => (
          <li key={i}>
            <IconCheckCircle />
            {feature}
          </li>
        ))}
      </ul>
      <button
        className={plan.featured ? styles.primaryButton : styles.secondaryButton}
        onClick={() => navigate('/signup')}
      >
        Get Started
      </button>
    </motion.div>
  )
}

const features = [
  {
    icon: IconDatabase,
    title: 'Database Management',
    description: 'Manage your data with powerful database tools and backup systems',
  },
  {
    icon: IconAPI,
    title: 'API Integration',
    description: 'Connect and manage all your APIs in one centralized location',
  },
  {
    icon: IconBrain,
    title: 'AI Assistant',
    description: 'Get help from AI-powered assistants for your development needs',
  },
  {
    icon: IconShield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with reliable infrastructure',
  },
  {
    icon: IconZap,
    title: 'Fast Performance',
    description: 'Lightning-fast performance optimized for modern applications',
  },
  {
    icon: IconSparkles,
    title: 'Modern UI',
    description: 'Beautiful, intuitive interface designed for developers',
  },
]

const techStack = [
  { name: 'React', icon: '⚛️' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Node.js', icon: '🟢' },
  { name: 'Supabase', icon: '🗄️' },
  { name: 'Vite', icon: '⚡' },
  { name: 'Express', icon: '🚀' },
]

const statistics = [
  { value: 10000, suffix: '+', label: 'Active Users' },
  { value: 50000, suffix: '+', label: 'API Calls/Day' },
  { value: 99.9, suffix: '%', label: 'Uptime' },
  { value: 24, suffix: '/7', label: 'Support' },
]

const testimonials = [
  {
    text: 'OneApp has transformed how we manage our development workflow. Highly recommended!',
    name: 'Sarah Johnson',
    role: 'Lead Developer',
  },
  {
    text: 'The AI assistant feature alone is worth it. It saves us hours every day.',
    name: 'Michael Chen',
    role: 'Full Stack Developer',
  },
  {
    text: 'Best platform for managing APIs and databases. The UI is beautiful and intuitive.',
    name: 'Emily Rodriguez',
    role: 'DevOps Engineer',
  },
]

const pricingPlans = [
  {
    name: 'Free',
    price: '0',
    features: ['5 Projects', 'Basic Support', 'Community Access', '1GB Storage'],
    featured: false,
  },
  {
    name: 'Pro',
    price: '29',
    features: ['Unlimited Projects', 'Priority Support', 'Advanced Features', '100GB Storage'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: '99',
    features: ['Everything in Pro', 'Dedicated Support', 'Custom Integrations', 'Unlimited Storage'],
    featured: false,
  },
]

