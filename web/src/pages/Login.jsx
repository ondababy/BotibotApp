import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Pill, 
  ArrowRight,
  Shield,
  Heart,
  Clock
} from 'lucide-react';
import InputField from '../components/InputField';
import Button from '../components/Button';

const Login = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to dashboard on success
      if (onNavigate) {
        onNavigate('dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Clock size={24} />,
      title: 'Never Miss a Dose',
      description: 'Smart reminders ensure you take your medication on time'
    },
    {
      icon: <Shield size={24} />,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and protected'
    },
    {
      icon: <Heart size={24} />,
      title: 'Better Health',
      description: 'Track adherence and improve your wellness journey'
    }
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      backgroundColor: '#f5f1e8',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    leftPanel: {
      background: 'linear-gradient(135deg, #4a6fa5, #38598b)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      opacity: 0.3
    },
    brandContainer: {
      textAlign: 'center',
      marginBottom: '60px',
      zIndex: 1
    },
    logo: {
      width: '80px',
      height: '80px',
      borderRadius: '40px',
      background: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 20px',
      backdropFilter: 'blur(10px)'
    },
    brandTitle: {
      fontSize: '32px',
      fontWeight: '700',
      margin: '0 0 8px 0'
    },
    brandSubtitle: {
      fontSize: '16px',
      opacity: 0.9,
      margin: 0
    },
    featuresContainer: {
      width: '100%',
      maxWidth: '400px',
      zIndex: 1
    },
    featureCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    featureHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px'
    },
    featureIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '20px',
      background: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    featureTitle: {
      fontSize: '16px',
      fontWeight: '600',
      margin: 0
    },
    featureDescription: {
      fontSize: '14px',
      opacity: 0.8,
      margin: 0,
      lineHeight: 1.5
    },
    rightPanel: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      backgroundColor: '#fff'
    },
    loginForm: {
      width: '100%',
      maxWidth: '400px'
    },
    formHeader: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    formTitle: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#2c3e50',
      margin: '0 0 8px 0'
    },
    formSubtitle: {
      fontSize: '14px',
      color: '#6c757d',
      margin: 0
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    passwordContainer: {
      position: 'relative'
    },
    passwordToggle: {
      position: 'absolute',
      right: '12px',
      top: '38px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6c757d',
      padding: '4px'
    },
    forgotPassword: {
      textAlign: 'right',
      marginTop: '-8px'
    },
    forgotLink: {
      color: '#4a6fa5',
      fontSize: '14px',
      textDecoration: 'none'
    },
    submitButton: {
      marginTop: '8px'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '24px 0',
      gap: '16px'
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: '#e9ecef'
    },
    dividerText: {
      fontSize: '14px',
      color: '#6c757d'
    },
    registerLink: {
      textAlign: 'center',
      fontSize: '14px',
      color: '#6c757d'
    },
    registerLinkButton: {
      color: '#4a6fa5',
      textDecoration: 'none',
      fontWeight: '500'
    },
    mobileContainer: {
      display: 'none'
    }
  };

  // Mobile responsive styles
  const mobileStyles = `
    @media (max-width: 768px) {
      .login-container {
        grid-template-columns: 1fr !important;
      }
      .left-panel {
        display: none !important;
      }
      .right-panel {
        padding: 20px !important;
      }
      .mobile-header {
        display: block !important;
        text-align: center;
        margin-bottom: 32px;
      }
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>
      <div style={styles.container} className="login-container">
        {/* Left Panel - Brand & Features */}
        <motion.div 
          style={styles.leftPanel}
          className="left-panel"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={styles.backgroundPattern} />
          
          <motion.div 
            style={styles.brandContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div style={styles.logo}>
              <Pill size={40} />
            </div>
            <h1 style={styles.brandTitle}>MediTracker</h1>
            <p style={styles.brandSubtitle}>Your Smart Medication Companion</p>
          </motion.div>

          <div style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                style={styles.featureCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
              >
                <div style={styles.featureHeader}>
                  <div style={styles.featureIcon}>
                    {feature.icon}
                  </div>
                  <h3 style={styles.featureTitle}>{feature.title}</h3>
                </div>
                <p style={styles.featureDescription}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Panel - Login Form */}
        <motion.div 
          style={styles.rightPanel}
          className="right-panel"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile Header */}
          <div style={styles.mobileContainer} className="mobile-header">
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, #4a6fa5, #38598b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#fff'
            }}>
              <Pill size={30} />
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#2c3e50',
              margin: '0 0 4px 0'
            }}>
              MediTracker
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6c757d',
              margin: 0
            }}>
              Your Smart Medication Companion
            </p>
          </div>

          <motion.div 
            style={styles.loginForm}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Welcome Back</h2>
              <p style={styles.formSubtitle}>Sign in to continue managing your medications</p>
            </div>

            <form style={styles.form} onSubmit={handleSubmit}>
              <InputField
                label="Email Address"
                type="email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter your email"
                error={errors.email}
                icon={<Mail size={16} color="#4a6fa5" />}
              />

              <div style={styles.passwordContainer}>
                <InputField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Enter your password"
                  error={errors.password}
                  icon={<Lock size={16} color="#4a6fa5" />}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div style={styles.forgotPassword}>
                <a href="#" style={styles.forgotLink}>
                  Forgot your password?
                </a>
              </div>

              <div style={styles.submitButton}>
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                  size="large"
                  icon={<ArrowRight size={20} />}
                  style={{ width: '100%' }}
                >
                  Sign In
                </Button>
              </div>
            </form>

            <div style={styles.divider}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <div style={styles.dividerLine} />
            </div>

            <div style={styles.registerLink}>
              Don't have an account?{' '}
              <a 
                href="#" 
                style={styles.registerLinkButton}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate && onNavigate('register');
                }}
              >
                Create account
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
