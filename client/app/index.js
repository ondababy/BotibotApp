import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions,
  Animated,
  StatusBar,
  ScrollView,
  Platform
} from 'react-native'
import React, { useRef, useEffect } from 'react'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import * as Animatable from 'react-native-animatable'
import { BlurView } from 'expo-blur'
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'

const { width, height } = Dimensions.get('window')

const scale = (size) => (width / 375) * size
const verticalScale = (size) => (height / 812) * size
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor

export default function Index() {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const floatAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -10,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleLogin = () => {
    router.push('/Screen/Auth/Login');
  };

  const handleRegister = () => {
    router.push('/Screen/Auth/Register');
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#4a6fa5', '#3d5a8a', '#2e4570']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Animated Background Elements */}
          <Animated.View 
            style={[
              styles.backgroundCircle1,
              { transform: [{ rotate }] }
            ]}
          />
          <Animated.View 
            style={[
              styles.backgroundCircle2,
              { transform: [{ rotate: rotate }] }
            ]}
          />

          {/* Enhanced Header */}
          <Animatable.View 
            animation="fadeInDown" 
            duration={1000}
            style={styles.header}
          >
            <View style={styles.logoHeader}>
              <MaterialCommunityIcons name="pill" size={moderateScale(25)} color="#f5f1e8" />
              <Text style={styles.brandText}>Botibot</Text>
            </View>
            <View style={styles.brandUnderline} />
            <Text style={styles.brandTagline}>Healthcare Reimagined</Text>
          </Animatable.View>

          {/* Enhanced Main Card */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={1000}
            delay={300}
            style={styles.cardWrapper}
          >
            <BlurView intensity={20} tint="light" style={styles.mainCard}>
              {/* Stats Bar */}
              <View style={styles.statsBar}>
                <View style={styles.statItem}>
                  <Ionicons name="shield-checkmark" size={moderateScale(16)} color="#4a6fa5" />
                  <Text style={styles.statText}>FDA Approved</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <FontAwesome5 name="user-md" size={moderateScale(14)} color="#4a6fa5" />
                  <Text style={styles.statText}>Doctor Verified</Text>
                </View>
              </View>

              {/* Enhanced Image Section */}
              <View style={styles.imageContainer}>
                <Animated.View
                  style={[
                    styles.imageWrapper,
                    {
                      transform: [
                        { scale: pulseAnim },
                        { translateY: floatAnim }
                      ]
                    }
                  ]}
                >
                  <LinearGradient
                    colors={['#ffffff', '#f0f4f8']}
                    style={styles.imageBorder}
                  >
                    <Image 
                      source={require('../assets/images/robot.png')}
                      style={styles.image}
                      resizeMode="contain"
                    />
                    <Animatable.View 
                      animation="bounce" 
                      iterationCount="infinite" 
                      duration={2000}
                      style={styles.badge}
                    >
                      <Text style={styles.badgeText}>AI</Text>
                    </Animatable.View>
                  </LinearGradient>
                </Animated.View>
              </View>

              {/* Enhanced Text Content */}
              <Animatable.View 
                animation="fadeIn" 
                delay={600}
                style={styles.textContainer}
              >
                <Text style={styles.title}>Smart Pill Dispensing</Text>
                <Text style={styles.subtitle}>
                  Your personal medication assistant. Precise, reliable, and always on time.
                </Text>
                
                {/* Feature Pills */}
                <View style={styles.featureContainer}>
                  <View style={styles.featurePill}>
                    <Ionicons name="notifications" size={moderateScale(14)} color="#4a6fa5" />
                    <Text style={styles.featureText}>Reminders</Text>
                  </View>
                  <View style={styles.featurePill}>
                    <MaterialCommunityIcons name="chart-line" size={moderateScale(14)} color="#4a6fa5" />
                    <Text style={styles.featureText}>Tracking</Text>
                  </View>
                  <View style={styles.featurePill}>
                    <Ionicons name="lock-closed" size={moderateScale(14)} color="#4a6fa5" />
                    <Text style={styles.featureText}>Secure</Text>
                  </View>
                </View>
              </Animatable.View>

              {/* Enhanced Action Buttons */}
              <Animatable.View 
                animation="fadeInUp" 
                delay={800}
                style={styles.buttonContainer}
              >
                <TouchableOpacity 
                  style={styles.loginButton}
                  onPress={handleLogin}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#4a6fa5', '#3d5a8a']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.loginButtonText}>Get Started</Text>
                    <Ionicons name="arrow-forward" size={moderateScale(18)} color="#f5f1e8" />
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.registerButton}
                  onPress={handleRegister}
                  activeOpacity={0.7}
                >
                  <Text style={styles.registerButtonText}>Create Account</Text>
                </TouchableOpacity>
              </Animatable.View>
            </BlurView>
          </Animatable.View>

          {/* Enhanced Footer */}
          <Animatable.View 
            animation="fadeIn" 
            delay={1000}
            style={styles.footer}
          >
            <View style={styles.trustBadge}>
              <View style={styles.trustIconContainer}>
                <Animatable.View 
                  animation="pulse" 
                  iterationCount="infinite" 
                  style={styles.trustIcon}
                />
              </View>
              <Text style={styles.footerText}>Trusted by 10,000+ professionals</Text>
            </View>
            
            <View style={styles.securityBadges}>
              <View style={styles.securityItem}>
                <Ionicons name="shield" size={moderateScale(14)} color="#f5f1e8" />
                <Text style={styles.securityText}>HIPAA</Text>
              </View>
              <View style={styles.securityItem}>
                <MaterialCommunityIcons name="lock-check" size={moderateScale(14)} color="#f5f1e8" />
                <Text style={styles.securityText}>Encrypted</Text>
              </View>
            </View>
          </Animatable.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(20) : verticalScale(40),
    paddingBottom: verticalScale(20),
  },
  backgroundCircle1: {
    position: 'absolute',
    width: moderateScale(300),
    height: moderateScale(300),
    borderRadius: moderateScale(150),
    backgroundColor: 'rgba(245, 241, 232, 0.05)',
    top: verticalScale(-150),
    right: scale(-150),
  },
  backgroundCircle2: {
    position: 'absolute',
    width: moderateScale(200),
    height: moderateScale(200),
    borderRadius: moderateScale(100),
    backgroundColor: 'rgba(245, 241, 232, 0.03)',
    bottom: verticalScale(-100),
    left: scale(-100),
  },
  header: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  logoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginBottom: verticalScale(6),
  },
  brandText: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    color: '#f5f1e8',
    letterSpacing: 1.5,
    fontFamily: 'Poppins-ExtraBold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandUnderline: {
    width: moderateScale(50),
    height: verticalScale(3),
    backgroundColor: '#f5f1e8',
    borderRadius: 2,
    marginTop: verticalScale(2),
  },
  brandTagline: {
    fontSize: moderateScale(12),
    color: 'rgba(245, 241, 232, 0.8)',
    marginTop: verticalScale(6),
    fontFamily: 'Poppins-Regular',
    letterSpacing: 0.8,
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: verticalScale(10),
  },
  mainCard: {
    backgroundColor: 'rgba(245, 241, 232, 0.95)',
    borderRadius: moderateScale(25),
    padding: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    paddingVertical: verticalScale(8),
    backgroundColor: 'rgba(74, 111, 165, 0.08)',
    borderRadius: moderateScale(15),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    paddingHorizontal: moderateScale(12),
  },
  statText: {
    fontSize: moderateScale(11),
    color: '#4a6fa5',
    fontFamily: 'Poppins-Medium',
  },
  statDivider: {
    width: 1,
    height: verticalScale(16),
    backgroundColor: 'rgba(74, 111, 165, 0.2)',
    marginHorizontal: moderateScale(12),
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(16),
    position: 'relative',
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBorder: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4a6fa5',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    position: 'relative',
  },
  image: {
    width: moderateScale(90),
    height: moderateScale(90),
  },
  badge: {
    position: 'absolute',
    top: moderateScale(5),
    right: moderateScale(5),
    backgroundColor: '#4a6fa5',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(2),
  },
  badgeText: {
    color: '#f5f1e8',
    fontSize: moderateScale(10),
    fontWeight: 'bold',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: '#4a6fa5',
    marginBottom: verticalScale(10),
    textAlign: 'center',
    letterSpacing: 0.3,
    fontFamily: 'Poppins-Bold',
    lineHeight: moderateScale(28),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: moderateScale(20),
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: moderateScale(10),
    marginBottom: verticalScale(12),
  },
  featureContainer: {
    flexDirection: 'row',
    gap: moderateScale(8),
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(4),
    backgroundColor: 'rgba(74, 111, 165, 0.1)',
    borderRadius: moderateScale(15),
  },
  featureText: {
    fontSize: moderateScale(11),
    color: '#4a6fa5',
    fontFamily: 'Poppins-Medium',
  },
  buttonContainer: {
    gap: verticalScale(12),
  },
  loginButton: {
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    shadowColor: '#4a6fa5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(8),
  },
  loginButtonText: {
    color: '#f5f1e8',
    fontSize: moderateScale(16),
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily: 'Poppins-SemiBold',
  },
  registerButton: {
    backgroundColor: 'transparent',
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(14),
    borderWidth: 2,
    borderColor: '#4a6fa5',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#4a6fa5',
    fontSize: moderateScale(16),
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily: 'Poppins-SemiBold',
  },
  footer: {
    alignItems: 'center',
    marginTop: verticalScale(20),
    gap: verticalScale(12),
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 241, 232, 0.2)',
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(18),
    borderWidth: 1,
    borderColor: 'rgba(245, 241, 232, 0.3)',
  },
  trustIconContainer: {
    marginRight: moderateScale(6),
  },
  trustIcon: {
    width: moderateScale(6),
    height: moderateScale(6),
    backgroundColor: '#f5f1e8',
    borderRadius: moderateScale(3),
  },
  footerText: {
    fontSize: moderateScale(11),
    color: '#f5f1e8',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  securityBadges: {
    flexDirection: 'row',
    gap: moderateScale(16),
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
  },
  securityText: {
    fontSize: moderateScale(10),
    color: 'rgba(245, 241, 232, 0.8)',
    fontFamily: 'Poppins-Regular',
  },
})