import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import { ToastContainer, type Toast } from '@/components/Toast'
import { IconEye, IconEyeOff, IconArrowLeft, IconMail, IconLock, IconUser } from '@/components/Icons'
import oneAppLogo from '@/logo/icon.png'
import styles from './Signup.module.css'

export function Signup() {
  const navigate = useNavigate()
  const { signUp, signIn } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [typedText, setTypedText] = useState('')
  
  const fullText = 'Explore Magical of Technology Application…'
  const [isDeleting, setIsDeleting] = useState(false)
  const [charIndex, setCharIndex] = useState(0)

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++

    if (strength <= 2) return { strength, label: 'Weak', color: '#ef4444' }
    if (strength <= 4) return { strength, label: 'Medium', color: '#f59e0b' }
    return { strength, label: 'Strong', color: '#10b981' }
  }

  const passwordStrength = getPasswordStrength(password)
  const passwordsMatch = password && confirmPassword && password === confirmPassword

  // Enable scrolling on body for signup page
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

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString()
    setToasts((prev) => {
      // Prevent duplicate toasts
      if (prev.some(t => t.message === message && t.type === type)) {
        return prev
      }
      return [...prev, { id, message, type }]
    })
  }

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // Typing animation effect
  useEffect(() => {
    // Handle pause when typing is complete
    if (!isDeleting && charIndex === fullText.length) {
      const pauseTimer = setTimeout(() => setIsDeleting(true), 2000)
      return () => clearTimeout(pauseTimer)
    }

    // Handle pause when deletion is complete
    if (isDeleting && charIndex === 0) {
      setIsDeleting(false)
      return
    }

    const typeSpeed = isDeleting ? 30 : 100
    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < fullText.length) {
        setTypedText(fullText.slice(0, charIndex + 1))
        setCharIndex(charIndex + 1)
      } else if (isDeleting && charIndex > 0) {
        setTypedText(fullText.slice(0, charIndex - 1))
        setCharIndex(charIndex - 1)
      }
    }, typeSpeed)

    return () => clearTimeout(timer)
  }, [charIndex, isDeleting, fullText])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    if (passwordStrength.strength < 3) {
      showToast('Password is too weak. Please use a stronger password.', 'error')
      return
    }

    setLoading(true)

    try {
      // Check if we have API URL configured
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '')
      
      if (API_URL) {
        // Sign up via backend API which handles Supabase Auth + oneapp_users sync
        try {
          console.log('Attempting signup via backend API...')
          const response = await api.post('/auth/signup', {
            name,
            email,
            password,
          })

          console.log('Backend API response:', response.data)

          if (response.data.success) {
            // User is already created in Supabase Auth by backend, just sign in to get session
            await signIn(email, password)
            console.log('✅ User created successfully in database and signed in')
            navigate('/')
            return
          } else {
            showToast(response.data.error || 'Failed to create account', 'error')
            setLoading(false)
            return
          }
        } catch (apiErr: any) {
          console.error('Backend API signup error:', apiErr)
          const errorMessage = apiErr.response?.data?.error || apiErr.message || 'Backend API error'
          showToast(`Failed to create account: ${errorMessage}`, 'error')
          setLoading(false)
          return
        }
      } else {
        // No backend API available - show error
        showToast('Backend API is not configured. Please set VITE_API_URL environment variable.', 'error')
        setLoading(false)
        return
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      showToast(err.message || err.response?.data?.error || 'Failed to create account', 'error')
      setLoading(false)
    }
  }

  return (
    <div className={styles.signup}>
      <div className={styles.background}>
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className={styles.particle}
            animate={{
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className={styles.layout}>
        {/* Left Section */}
        <motion.div
          className={styles.leftSection}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button
            className={styles.backButton}
            onClick={() => navigate('/home')}
          >
            <IconArrowLeft />
            Back to Home
          </button>

          <div className={styles.logoWithText}>
            <motion.img
              src={oneAppLogo}
              alt="OneApp Logo"
              className={styles.logo}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
            <span className={styles.logoText}>OneApp</span>
          </div>

          <div className={styles.leftContent}>
            <h1 className={styles.leftTitle}>Create Account</h1>
            <p className={styles.leftSubtitle}>
              Join OneApp and start building amazing applications
            </p>

            <div className={styles.typingText}>
              {typedText}
              <span className={styles.cursor}>|</span>
            </div>

            <div className={styles.loginPrompt}>
              <span>Already have an account?</span>
              <Link to="/login" className={styles.signInLink}>
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Right Section - Form */}
        <motion.div
          className={styles.rightSection}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className={styles.card}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <IconUser className={styles.labelIcon} />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="Enter your full name"
                required
                autoFocus
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <IconMail className={styles.labelIcon} />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <IconLock className={styles.labelIcon} />
                Password
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {password && (
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthBar}>
                    <motion.div
                      className={styles.strengthFill}
                      style={{ backgroundColor: passwordStrength.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <IconLock className={styles.labelIcon} />
                Confirm Password
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${styles.input} ${confirmPassword && !passwordsMatch ? styles.inputError : ''}`}
                  placeholder="Re-enter your password"
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <span className={styles.errorText}>Passwords do not match</span>
              )}
              {confirmPassword && passwordsMatch && (
                <span className={styles.successText}>Passwords match</span>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !passwordsMatch || passwordStrength.strength < 3}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          </motion.div>
        </motion.div>
      </div>
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  )
}

