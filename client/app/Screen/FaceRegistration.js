import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { faceRecognitionService } from '../Services/faceRecognitionApi';

const { width, height } = Dimensions.get('window');

const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export default function FaceRegistration() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0); // 0: intro, 1: capture, 2: complete
  const [isCapturing, setIsCapturing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [captureCountdown, setCaptureCountdown] = useState(null);
  const cameraRef = useRef(null);
  const router = useRouter();
  const captureTimeoutRef = useRef(null);
  const lastCaptureTime = useRef(0);

  const minImages = 15;
  const maxImages = 30;
  const progress = capturedImages.length / minImages;

  useEffect(() => {
    if (capturedImages.length >= minImages && currentStep === 1) {
      // Auto-complete if we have enough images
      setCurrentStep(2);
    }
  }, [capturedImages.length, currentStep]);

  useEffect(() => {
    // Cleanup timeout when component unmounts
    return () => {
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
      }
    };
  }, []);

  const onFacesDetected = ({ faces }) => {
    const now = Date.now();
    const timeSinceLastCapture = now - lastCaptureTime.current;
    
    if (faces.length === 1 && !isCapturing && capturedImages.length < maxImages && currentStep === 1) {
      // Single face detected
      if (!faceDetected) {
        setFaceDetected(true);
        // Start countdown for auto-capture (faster countdown)
        setCaptureCountdown(2);
        
        // Clear any existing timeout
        if (captureTimeoutRef.current) {
          clearTimeout(captureTimeoutRef.current);
        }
        
        // Start countdown (faster for quick capture)
        let count = 2;
        const countdownInterval = setInterval(() => {
          count--;
          setCaptureCountdown(count);
          
          if (count === 0) {
            clearInterval(countdownInterval);
            setCaptureCountdown(null);
            
            // Reduced time between captures for faster capture (500ms instead of 2000ms)
            if (timeSinceLastCapture > 500) {
              takePicture();
            }
          }
        }, 500); // Faster countdown interval
        
        captureTimeoutRef.current = countdownInterval;
      }
    } else {
      // No face or multiple faces detected
      if (faceDetected) {
        setFaceDetected(false);
        setCaptureCountdown(null);
        
        // Clear countdown
        if (captureTimeoutRef.current) {
          clearTimeout(captureTimeoutRef.current);
          captureTimeoutRef.current = null;
        }
      }
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing || capturedImages.length >= maxImages) return;

    try {
      setIsCapturing(true);
      lastCaptureTime.current = Date.now();
      
      // Reset face detection state
      setFaceDetected(false);
      setCaptureCountdown(null);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        skipProcessing: false,
      });

      // Resize and optimize the image
      const manipulatedImage = await manipulateAsync(
        photo.uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.8, format: SaveFormat.JPEG, base64: true }
      );

      const base64Image = `data:image/jpeg;base64,${manipulatedImage.base64}`;
      
      setCapturedImages(prev => [...prev, {
        id: Date.now(),
        base64: base64Image,
        uri: manipulatedImage.uri
      }]);

    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const removeImage = (id) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id));
    if (capturedImages.length <= minImages && currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const submitFaceRegistration = async () => {
    if (capturedImages.length < minImages) {
      Alert.alert('Not Enough Images', `Please capture at least ${minImages} images.`);
      return;
    }

    try {
      setIsLoading(true);
      
      // Test network connectivity first
      console.log('Testing network connectivity...');
      
      const imageData = capturedImages.map(img => img.base64);
      const response = await faceRecognitionService.registerFace(imageData);

      if (response.success) {
        Alert.alert(
          'Success!',
          'Face registration completed successfully. You can now use face recognition for login.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/Screen/Main'),
            },
          ]
        );
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Face registration error:', error);
      
      let errorMessage = 'Please try again.';
      
      if (error.message.includes('Network Error') || error.message.includes('connection failed')) {
        errorMessage = 'Cannot connect to server. Please check:\n• Server is running\n• Correct IP address (192.168.1.57:5000)\n• Device is on same network';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Registration Failed',
        errorMessage,
        [
          { text: 'Retry', style: 'default' },
          { 
            text: 'Skip for Now', 
            style: 'cancel',
            onPress: () => router.replace('/Screen/Main')
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const skipFaceRegistration = () => {
    Alert.alert(
      'Skip Face Registration?',
      'You can register your face later in the app settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          style: 'default',
          onPress: () => router.replace('/Screen/Main')
        },
      ]
    );
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#4a6fa5', '#3d5a8a']} style={styles.background}>
          <View style={styles.permissionContainer}>
            <Animatable.View animation="fadeInUp" style={styles.permissionContent}>
              <MaterialCommunityIcons
                name="camera-outline"
                size={moderateScale(80)}
                color="#f5f1e8"
                style={styles.permissionIcon}
              />
              <Text style={styles.permissionTitle}>Camera Permission Required</Text>
              <Text style={styles.permissionText}>
                We need access to your camera to capture photos for face registration.
              </Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={requestPermission}
              >
                <LinearGradient
                  colors={['#f5f1e8', '#e8e2d4']}
                  style={styles.permissionButtonGradient}
                >
                  <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (currentStep === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#4a6fa5', '#3d5a8a']} style={styles.background}>
          <View style={styles.introContainer}>
            <Animatable.View animation="fadeInUp" delay={200} style={styles.introContent}>
              <MaterialCommunityIcons
                name="face-recognition"
                size={moderateScale(100)}
                color="#f5f1e8"
                style={styles.introIcon}
              />
              <Text style={styles.introTitle}>Set Up Face Recognition</Text>
              <Text style={styles.introText}>
                For enhanced security, let's set up face recognition. Position your face in the camera frame
                and photos will be captured automatically. We'll capture up to 30 photos for maximum accuracy.
              </Text>
              
              <View style={styles.instructionsContainer}>
                <View style={styles.instructionItem}>
                  <Ionicons name="camera-outline" size={moderateScale(24)} color="#f5f1e8" />
                  <Text style={styles.instructionText}>Fast auto-capture up to {maxImages} photos</Text>
                </View>
                <View style={styles.instructionItem}>
                  <Ionicons name="sunny-outline" size={moderateScale(24)} color="#f5f1e8" />
                  <Text style={styles.instructionText}>Ensure good lighting</Text>
                </View>
                <View style={styles.instructionItem}>
                  <Ionicons name="person-outline" size={moderateScale(24)} color="#f5f1e8" />
                  <Text style={styles.instructionText}>Move your head slightly for variety</Text>
                </View>
                <View style={styles.instructionItem}>
                  <Ionicons name="checkmark-circle-outline" size={moderateScale(24)} color="#10b981" />
                  <Text style={styles.instructionText}>High-accuracy face detection</Text>
                </View>
              </View>

              <View style={styles.introButtons}>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => setCurrentStep(1)}
                >
                  <LinearGradient
                    colors={['#f5f1e8', '#e8e2d4']}
                    style={styles.startButtonGradient}
                  >
                    <Text style={styles.startButtonText}>Start Capture</Text>
                    <Ionicons name="camera" size={moderateScale(20)} color="#4a6fa5" />
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={skipFaceRegistration}
                >
                  <Text style={styles.skipButtonText}>Skip for Now</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (currentStep === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          facing="front"
          onFacesDetected={onFacesDetected}
          faceDetectorSettings={{
            mode: 'fast',
            detectLandmarks: 'none',
            runClassifications: 'none',
            minDetectionInterval: 100,
            tracking: true,
          }}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={styles.cameraOverlay}
          >
            {/* Header */}
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentStep(0)}
              >
                <Ionicons name="arrow-back" size={moderateScale(24)} color="#f5f1e8" />
              </TouchableOpacity>
              
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {capturedImages.length} / {minImages} minimum
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} 
                  />
                </View>
              </View>
            </View>

            {/* Face Guide */}
            <View style={styles.faceGuideContainer}>
              <View style={styles.faceGuide}>
                <View style={[styles.faceGuideCorner, faceDetected && styles.faceDetectedCorner]} />
                <View style={[styles.faceGuideCorner, styles.topRight, faceDetected && styles.faceDetectedCorner]} />
                <View style={[styles.faceGuideCorner, styles.bottomLeft, faceDetected && styles.faceDetectedCorner]} />
                <View style={[styles.faceGuideCorner, styles.bottomRight, faceDetected && styles.faceDetectedCorner]} />
                
                {/* Face detection status */}
                {faceDetected && captureCountdown && (
                  <Animatable.View 
                    animation="pulse" 
                    iterationCount="infinite"
                    style={styles.countdownContainer}
                  >
                    <Text style={styles.countdownText}>{captureCountdown}</Text>
                  </Animatable.View>
                )}
              </View>
              
              <Text style={[styles.guideText, faceDetected && styles.guideTextDetected]}>
                {faceDetected 
                  ? (captureCountdown ? `Fast capture in ${captureCountdown}...` : 'Face detected!')
                  : 'Position your face within the frame'
                }
              </Text>
              
              {!faceDetected && (
                <Text style={styles.guideSubText}>
                  Fast auto-capture enabled - Move your head slightly for variety
                </Text>
              )}
            </View>

            {/* Captured Images Thumbnails */}
            {capturedImages.length > 0 && (
              <View style={styles.thumbnailContainer}>
                <Text style={styles.thumbnailTitle}>
                  Captured: {capturedImages.length}/{maxImages} • {Math.round((capturedImages.length / maxImages) * 100)}% complete
                </Text>
                <View style={styles.thumbnailList}>
                  {capturedImages.slice(-5).map((image, index) => (
                    <Animatable.View
                      key={image.id}
                      animation="bounceIn"
                      style={styles.thumbnail}
                    >
                      <TouchableOpacity
                        onPress={() => removeImage(image.id)}
                        style={styles.thumbnailRemove}
                      >
                        <Ionicons name="close" size={moderateScale(12)} color="#e53e3e" />
                      </TouchableOpacity>
                    </Animatable.View>
                  ))}
                  {capturedImages.length > 5 && (
                    <View style={styles.thumbnailMore}>
                      <Text style={styles.thumbnailMoreText}>+{capturedImages.length - 5}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Bottom Controls */}
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={() => {/* Could add gallery picker */}}
              >
                <Ionicons name="images-outline" size={moderateScale(24)} color="#f5f1e8" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.captureButton,
                  isCapturing && styles.captureButtonDisabled,
                  capturedImages.length >= maxImages && styles.captureButtonDisabled
                ]}
                onPress={takePicture}
                disabled={isCapturing || capturedImages.length >= maxImages}
              >
                <View style={styles.captureButtonInner}>
                  {isCapturing ? (
                    <Animatable.View animation="pulse" iterationCount="infinite">
                      <View style={styles.captureButtonLoading} />
                    </Animatable.View>
                  ) : faceDetected && captureCountdown ? (
                    <Animatable.View animation="pulse" iterationCount="infinite">
                      <View style={[styles.captureButtonNormal, styles.captureButtonAuto]} />
                    </Animatable.View>
                  ) : (
                    <View style={styles.captureButtonNormal} />
                  )}
                </View>
                <Text style={styles.captureButtonLabel}>
                  {faceDetected ? 'Fast' : 'Manual'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.doneButton,
                  capturedImages.length < minImages && styles.doneButtonDisabled
                ]}
                onPress={() => setCurrentStep(2)}
                disabled={capturedImages.length < minImages}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </CameraView>
      </SafeAreaView>
    );
  }

  // Step 2: Review and Submit
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4a6fa5', '#3d5a8a']} style={styles.background}>
        <View style={styles.reviewContainer}>
          <Animatable.View animation="fadeInUp" style={styles.reviewContent}>
            <MaterialCommunityIcons
              name="check-circle"
              size={moderateScale(80)}
              color="#10b981"
              style={styles.reviewIcon}
            />
            
            <Text style={styles.reviewTitle}>Photos Captured!</Text>
            <Text style={styles.reviewText}>
              You've captured {capturedImages.length} photos for high accuracy recognition.
              {capturedImages.length < maxImages && ` You can capture up to ${maxImages - capturedImages.length} more photos or proceed with registration.`}
            </Text>

            <View style={styles.reviewButtons}>
              {capturedImages.length < maxImages && (
                <TouchableOpacity
                  style={styles.captureMoreButton}
                  onPress={() => setCurrentStep(1)}
                >
                  <Text style={styles.captureMoreButtonText}>Capture More</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={submitFaceRegistration}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.submitButtonGradient}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Animatable.View
                        animation="rotate"
                        iterationCount="infinite"
                        duration={1000}
                      >
                        <Ionicons
                          name="refresh"
                          size={moderateScale(20)}
                          color="#f5f1e8"
                        />
                      </Animatable.View>
                      <Text style={styles.submitButtonText}>Registering...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Complete Registration</Text>
                      <Ionicons name="checkmark" size={moderateScale(20)} color="#f5f1e8" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.reviewSkipButton}
              onPress={skipFaceRegistration}
            >
              <Text style={styles.reviewSkipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
  },
  
  // Permission Screen
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
  },
  permissionContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(245, 241, 232, 0.1)',
    borderRadius: moderateScale(20),
    padding: moderateScale(30),
  },
  permissionIcon: {
    marginBottom: verticalScale(20),
  },
  permissionTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#f5f1e8',
    fontFamily: 'Poppins-Bold',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  permissionText: {
    fontSize: moderateScale(16),
    color: 'rgba(245, 241, 232, 0.8)',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: moderateScale(24),
    marginBottom: verticalScale(30),
  },
  permissionButton: {
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    paddingVertical: verticalScale(15),
    paddingHorizontal: moderateScale(40),
    alignItems: 'center',
  },
  permissionButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#4a6fa5',
    fontFamily: 'Poppins-SemiBold',
  },

  // Intro Screen
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
  },
  introContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(245, 241, 232, 0.1)',
    borderRadius: moderateScale(20),
    padding: moderateScale(30),
  },
  introIcon: {
    marginBottom: verticalScale(20),
  },
  introTitle: {
    fontSize: moderateScale(26),
    fontWeight: '700',
    color: '#f5f1e8',
    fontFamily: 'Poppins-Bold',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  introText: {
    fontSize: moderateScale(16),
    color: 'rgba(245, 241, 232, 0.8)',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: moderateScale(24),
    marginBottom: verticalScale(30),
  },
  instructionsContainer: {
    marginBottom: verticalScale(30),
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  instructionText: {
    fontSize: moderateScale(14),
    color: '#f5f1e8',
    fontFamily: 'Poppins-Medium',
    marginLeft: moderateScale(15),
  },
  introButtons: {
    width: '100%',
  },
  startButton: {
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    marginBottom: verticalScale(15),
  },
  startButtonGradient: {
    flexDirection: 'row',
    paddingVertical: verticalScale(15),
    paddingHorizontal: moderateScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(10),
  },
  startButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#4a6fa5',
    fontFamily: 'Poppins-SemiBold',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: verticalScale(15),
  },
  skipButtonText: {
    fontSize: moderateScale(16),
    color: 'rgba(245, 241, 232, 0.7)',
    fontFamily: 'Poppins-Regular',
    textDecorationLine: 'underline',
  },

  // Camera Screen
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(10) : verticalScale(30),
    paddingBottom: verticalScale(20),
  },
  backButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginLeft: moderateScale(20),
  },
  progressText: {
    fontSize: moderateScale(14),
    color: '#f5f1e8',
    fontFamily: 'Poppins-Medium',
    marginBottom: verticalScale(5),
  },
  progressBar: {
    height: verticalScale(4),
    backgroundColor: 'rgba(245, 241, 232, 0.3)',
    borderRadius: moderateScale(2),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },

  // Face Guide
  faceGuideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: moderateScale(250),
    height: moderateScale(320),
    position: 'relative',
  },
  faceGuideCorner: {
    position: 'absolute',
    width: moderateScale(40),
    height: moderateScale(40),
    borderColor: '#f5f1e8',
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    top: 0,
    left: 0,
  },
  faceDetectedCorner: {
    borderColor: '#10b981',
  },
  topRight: {
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    top: 0,
    right: 0,
    left: 'auto',
  },
  bottomLeft: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
    bottom: 0,
    left: 0,
    top: 'auto',
  },
  bottomRight: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
  },
  guideText: {
    fontSize: moderateScale(16),
    color: '#f5f1e8',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    marginTop: verticalScale(20),
  },
  guideTextDetected: {
    color: '#10b981',
  },
  guideSubText: {
    fontSize: moderateScale(14),
    color: 'rgba(245, 241, 232, 0.6)',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: verticalScale(10),
  },
  countdownContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: moderateScale(-40),
    marginLeft: moderateScale(-40),
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: moderateScale(32),
    fontWeight: '700',
    color: '#f5f1e8',
    fontFamily: 'Poppins-Bold',
  },

  // Thumbnails
  thumbnailContainer: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(10),
  },
  thumbnailTitle: {
    fontSize: moderateScale(14),
    color: '#f5f1e8',
    fontFamily: 'Poppins-Medium',
    marginBottom: verticalScale(10),
  },
  thumbnailList: {
    flexDirection: 'row',
    gap: moderateScale(10),
  },
  thumbnail: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(8),
    backgroundColor: 'rgba(245, 241, 232, 0.2)',
    position: 'relative',
  },
  thumbnailRemove: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    backgroundColor: '#f5f1e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailMore: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(8),
    backgroundColor: 'rgba(245, 241, 232, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(245, 241, 232, 0.5)',
    borderStyle: 'dashed',
  },
  thumbnailMoreText: {
    fontSize: moderateScale(12),
    color: '#f5f1e8',
    fontFamily: 'Poppins-SemiBold',
  },

  // Camera Controls
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(40),
    paddingBottom: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(20),
  },
  galleryButton: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#f5f1e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonNormal: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: '#4a6fa5',
  },
  captureButtonAuto: {
    backgroundColor: '#10b981',
  },
  captureButtonLoading: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#4a6fa5',
  },
  captureButtonLabel: {
    fontSize: moderateScale(10),
    color: '#4a6fa5',
    fontFamily: 'Poppins-Medium',
    marginTop: verticalScale(5),
  },
  doneButton: {
    paddingVertical: verticalScale(15),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(25),
    backgroundColor: '#10b981',
  },
  doneButtonDisabled: {
    opacity: 0.5,
  },
  doneButtonText: {
    fontSize: moderateScale(14),
    color: '#f5f1e8',
    fontFamily: 'Poppins-SemiBold',
  },

  // Review Screen
  reviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
  },
  reviewContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(245, 241, 232, 0.1)',
    borderRadius: moderateScale(20),
    padding: moderateScale(30),
  },
  reviewIcon: {
    marginBottom: verticalScale(20),
  },
  reviewTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#f5f1e8',
    fontFamily: 'Poppins-Bold',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  reviewText: {
    fontSize: moderateScale(16),
    color: 'rgba(245, 241, 232, 0.8)',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: moderateScale(24),
    marginBottom: verticalScale(30),
  },
  reviewButtons: {
    width: '100%',
    gap: verticalScale(15),
  },
  captureMoreButton: {
    paddingVertical: verticalScale(15),
    paddingHorizontal: moderateScale(30),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: '#f5f1e8',
    alignItems: 'center',
  },
  captureMoreButtonText: {
    fontSize: moderateScale(16),
    color: '#f5f1e8',
    fontFamily: 'Poppins-SemiBold',
  },
  submitButton: {
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    paddingVertical: verticalScale(15),
    paddingHorizontal: moderateScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(10),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(10),
  },
  submitButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#f5f1e8',
    fontFamily: 'Poppins-SemiBold',
  },
  reviewSkipButton: {
    alignItems: 'center',
    paddingVertical: verticalScale(15),
    marginTop: verticalScale(10),
  },
  reviewSkipButtonText: {
    fontSize: moderateScale(14),
    color: 'rgba(245, 241, 232, 0.7)',
    fontFamily: 'Poppins-Regular',
    textDecorationLine: 'underline',
  },
});
