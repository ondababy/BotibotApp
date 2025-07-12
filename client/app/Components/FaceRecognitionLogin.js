import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { faceRecognitionService } from '../Services/faceRecognitionApi';

const { width, height } = Dimensions.get('window');

const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export default function FaceRecognitionLogin({ 
  visible, 
  onClose, 
  onSuccess, 
  onError 
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef(null);

  const handleStartRecognition = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        onError('Camera permission is required for face recognition');
        return;
      }
    }
    setShowCamera(true);
  };

  const captureAndRecognize = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);

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
      
      // Call face recognition API
      const response = await faceRecognitionService.recognizeFace(base64Image);

      if (response.success) {
        onSuccess(response.recognized_user);
        onClose();
      } else {
        Alert.alert(
          'Face Not Recognized',
          'Your face was not recognized. Please try again or use email login.',
          [
            { text: 'Try Again', style: 'default' },
            { text: 'Use Email', style: 'cancel', onPress: onClose },
          ]
        );
      }
    } catch (error) {
      console.error('Face recognition error:', error);
      onError(error.response?.data?.error || error.message || 'Face recognition failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setShowCamera(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {!showCamera ? (
          <LinearGradient colors={['#4a6fa5', '#3d5a8a']} style={styles.introContainer}>
            <View style={styles.introContent}>
              <Animatable.View animation="fadeInUp" style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="face-recognition"
                  size={moderateScale(80)}
                  color="#f5f1e8"
                />
              </Animatable.View>
              
              <Text style={styles.title}>Face Recognition Login</Text>
              <Text style={styles.subtitle}>
                Look at the camera to login with your face
              </Text>

              <View style={styles.instructionsContainer}>
                <View style={styles.instructionItem}>
                  <Ionicons name="sunny-outline" size={moderateScale(20)} color="#f5f1e8" />
                  <Text style={styles.instructionText}>Ensure good lighting</Text>
                </View>
                <View style={styles.instructionItem}>
                  <Ionicons name="person-outline" size={moderateScale(20)} color="#f5f1e8" />
                  <Text style={styles.instructionText}>Look directly at camera</Text>
                </View>
                <View style={styles.instructionItem}>
                  <Ionicons name="remove-outline" size={moderateScale(20)} color="#f5f1e8" />
                  <Text style={styles.instructionText}>Remove any obstructions</Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={handleStartRecognition}
                >
                  <LinearGradient
                    colors={['#f5f1e8', '#e8e2d4']}
                    style={styles.startButtonGradient}
                  >
                    <Text style={styles.startButtonText}>Start Recognition</Text>
                    <Ionicons name="camera" size={moderateScale(20)} color="#4a6fa5" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>Use Email Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        ) : (
          <CameraView
            style={styles.camera}
            ref={cameraRef}
            facing="front"
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.6)']}
              style={styles.cameraOverlay}
            >
              {/* Header */}
              <View style={styles.cameraHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleClose}
                >
                  <Ionicons name="close" size={moderateScale(24)} color="#f5f1e8" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Face Recognition</Text>
                <View style={styles.placeholder} />
              </View>

              {/* Face Guide */}
              <View style={styles.faceGuideContainer}>
                <View style={styles.faceGuide}>
                  <View style={styles.faceGuideCorner} />
                  <View style={[styles.faceGuideCorner, styles.topRight]} />
                  <View style={[styles.faceGuideCorner, styles.bottomLeft]} />
                  <View style={[styles.faceGuideCorner, styles.bottomRight]} />
                </View>
                <Text style={styles.guideText}>
                  {isProcessing ? 'Processing...' : 'Position your face within the frame'}
                </Text>
              </View>

              {/* Capture Button */}
              <View style={styles.captureContainer}>
                <TouchableOpacity
                  style={[
                    styles.captureButton,
                    isProcessing && styles.captureButtonDisabled,
                  ]}
                  onPress={captureAndRecognize}
                  disabled={isProcessing}
                >
                  <View style={styles.captureButtonInner}>
                    {isProcessing ? (
                      <Animatable.View
                        animation="pulse"
                        iterationCount="infinite"
                        style={styles.captureButtonLoading}
                      >
                        <Ionicons
                          name="refresh"
                          size={moderateScale(30)}
                          color="#f5f1e8"
                        />
                      </Animatable.View>
                    ) : (
                      <Ionicons
                        name="camera"
                        size={moderateScale(30)}
                        color="#4a6fa5"
                      />
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={styles.captureText}>
                  {isProcessing ? 'Recognizing face...' : 'Tap to capture'}
                </Text>
              </View>
            </LinearGradient>
          </CameraView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    width: '100%',
  },
  iconContainer: {
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#f5f1e8',
    fontFamily: 'Poppins-Bold',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: 'rgba(245, 241, 232, 0.8)',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: moderateScale(24),
    marginBottom: verticalScale(30),
  },
  instructionsContainer: {
    marginBottom: verticalScale(30),
    width: '100%',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  instructionText: {
    fontSize: moderateScale(14),
    color: '#f5f1e8',
    fontFamily: 'Poppins-Medium',
    marginLeft: moderateScale(12),
  },
  buttonContainer: {
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
  cancelButton: {
    alignItems: 'center',
    paddingVertical: verticalScale(15),
  },
  cancelButtonText: {
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
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: moderateScale(18),
    color: '#f5f1e8',
    fontFamily: 'Poppins-SemiBold',
  },
  placeholder: {
    width: moderateScale(40),
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

  // Capture Controls
  captureContainer: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(20),
  },
  captureButton: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: '#f5f1e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  captureButtonDisabled: {
    opacity: 0.7,
  },
  captureButtonInner: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonLoading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureText: {
    fontSize: moderateScale(14),
    color: '#f5f1e8',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
});
