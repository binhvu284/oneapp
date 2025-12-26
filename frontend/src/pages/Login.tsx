import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { IconEye, IconEyeOff, IconArrowLeft, IconMail, IconLock } from '@/components/Icons'
import oneAppLogo from '@/logo/icon.png'
import styles from './Login.module.css'

export function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email)
      } else {
        localStorage.removeItem('rememberEmail')
      }
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.login}>
      <div className={styles.background}>
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className={styles.gridDot}
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${(i % 10) * 10}%`,
              top: `${Math.floor(i / 10) * 10}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          className={styles.backButton}
          onClick={() => navigate('/home')}
        >
          <IconArrowLeft />
          Back to Home
        </button>

        <motion.div
          className={styles.card}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className={styles.header}>
            <motion.img
              src={oneAppLogo}
              alt="OneApp Logo"
              className={styles.logo}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            />
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Sign in to your OneApp account</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <motion.div
                className={styles.error}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {error}
              </motion.div>
            )}

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
                autoFocus
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
                  placeholder="Enter your password"
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
            </div>

            <div className={styles.options}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className={styles.signupLink}>
              Don't have an account?{' '}
              <Link to="/signup">Sign up</Link>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}

