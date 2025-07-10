import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { router } from "expo-router";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { validateForm } from "../../Utils/validation";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as Progress from "react-native-progress";
import axios from "axios";
import baseURL from "../../../assets/common/baseUrl";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

const InputField = React.memo(
  ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    keyboardType = "default",
    multiline = false,
    icon,
    rightIcon,
    secureTextEntry = false,
    delay = 0,
  }) => (
    <Animatable.View
      animation="fadeInLeft"
      delay={delay}
      style={styles.inputContainer}
    >
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        {icon && <View style={styles.inputIcon}>{icon}</View>}
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#a0aec0"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          autoCorrect={false}
          autoCapitalize={secureTextEntry ? "none" : "words"}
          secureTextEntry={secureTextEntry}
        />
        {rightIcon && <View>{rightIcon}</View>}
        {value.length > 0 && !error && !rightIcon && (
          <Animatable.View animation="bounceIn" style={styles.checkIcon}>
            <Ionicons
              name="checkmark-circle"
              size={moderateScale(18)}
              color="#10b981"
            />
          </Animatable.View>
        )}
      </View>
      {error && (
        <Animatable.View animation="shake" style={styles.errorContainer}>
          <Ionicons
            name="alert-circle"
            size={moderateScale(14)}
            color="#e53e3e"
          />
          <Text style={styles.errorText}>{error}</Text>
        </Animatable.View>
      )}
    </Animatable.View>
  )
);

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    age: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Calculate completion progress using useMemo to avoid recalculation on every render
  const completionProgress = useMemo(() => {
    const filledFields = Object.values(formData).filter(
      (value) => value !== ""
    ).length;
    const totalFields = Object.keys(formData).length;
    return filledFields / totalFields;
  }, [formData]);

  // Run animations only once when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // Remove formData dependency

  // Memoize the input change handler to prevent unnecessary re-renders
  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field if it exists
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  const handleSubmit = async () => {
    const validation = validateForm(formData);

    if (validation.isValid) {
      setIsLoading(true);
      try {
        // Call the actual API endpoint
        const response = await axios.post(`${baseURL}/auth/register`, formData);

        // Store user data and token
        await AsyncStorage.setItem("jwt", response.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => router.push("/Screen/Main") },
        ]);
      } catch (error) {
        let errorMessage = "Failed to create account. Please try again.";

        if (axios.isAxiosError(error)) {
          if (!error.response) {
            errorMessage =
              "Network error. Please check your internet connection.";
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
        Alert.alert("Registration Failed", errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(validation.errors);
      const firstErrorSection = Object.keys(validation.errors)[0];
      if (
        firstErrorSection.includes("firstName") ||
        firstErrorSection.includes("lastName")
      ) {
        setCurrentSection(0);
      } else if (
        firstErrorSection.includes("email") ||
        firstErrorSection.includes("contact")
      ) {
        setCurrentSection(1);
      } else {
        setCurrentSection(2);
      }
    }
  };

  const sections = [
    { title: "Basic", icon: "person-outline" },
    { title: "Contact", icon: "mail-outline" },
    { title: "Emergency", icon: "call-outline" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#4a6fa5", "#3d5a8a"]} style={styles.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons
                  name="arrow-back"
                  size={moderateScale(20)}
                  color="#f5f1e8"
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Create Account</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Progress Bar */}
            <Animatable.View
              animation="fadeIn"
              delay={300}
              style={styles.progressContainer}
            >
              <Progress.Bar
                progress={completionProgress}
                width={width - moderateScale(40)}
                height={verticalScale(5)}
                color="#f5f1e8"
                unfilledColor="rgba(245, 241, 232, 0.2)"
                borderWidth={0}
                borderRadius={3}
              />
              <Text style={styles.progressText}>
                {Math.round(completionProgress * 100)}% Complete
              </Text>
            </Animatable.View>

            <Animated.View
              style={[
                styles.formCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <BlurView
                intensity={10}
                tint="light"
                style={styles.blurContainer}
              >
                {/* Form Header with Animation */}
                <Animatable.View
                  animation="fadeInDown"
                  delay={400}
                  style={styles.formHeader}
                >
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                      name="account-plus"
                      size={moderateScale(32)}
                      color="#4a6fa5"
                    />
                  </View>
                  <Text style={styles.formTitle}>Personal Information</Text>
                  <Text style={styles.formSubtitle}>
                    Please fill in all required fields
                  </Text>
                </Animatable.View>

                {/* Section Tabs */}
                <Animatable.View
                  animation="fadeIn"
                  delay={500}
                  style={styles.tabContainer}
                >
                  {sections.map((section, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.tab,
                        currentSection === index && styles.activeTab,
                      ]}
                      onPress={() => setCurrentSection(index)}
                    >
                      <Ionicons
                        name={section.icon}
                        size={moderateScale(18)}
                        color={currentSection === index ? "#4a6fa5" : "#a0aec0"}
                      />
                      <Text
                        style={[
                          styles.tabText,
                          currentSection === index && styles.activeTabText,
                        ]}
                      >
                        {section.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </Animatable.View>

                {/* Personal Details Section */}
                {currentSection === 0 && (
                  <View style={styles.section}>
                    <InputField
                      label="First Name *"
                      value={formData.firstName}
                      onChangeText={(value) =>
                        handleInputChange("firstName", value)
                      }
                      placeholder="Enter your first name"
                      error={errors.firstName}
                      icon={
                        <Ionicons
                          name="person-outline"
                          size={moderateScale(18)}
                          color="#4a6fa5"
                        />
                      }
                      delay={100}
                    />

                    <InputField
                      label="Middle Name"
                      value={formData.middleName}
                      onChangeText={(value) =>
                        handleInputChange("middleName", value)
                      }
                      placeholder="Enter your middle name (optional)"
                      icon={
                        <Ionicons
                          name="person-outline"
                          size={moderateScale(18)}
                          color="#4a6fa5"
                        />
                      }
                      delay={200}
                    />

                    <InputField
                      label="Last Name *"
                      value={formData.lastName}
                      onChangeText={(value) =>
                        handleInputChange("lastName", value)
                      }
                      placeholder="Enter your last name"
                      error={errors.lastName}
                      icon={
                        <Ionicons
                          name="person-outline"
                          size={moderateScale(18)}
                          color="#4a6fa5"
                        />
                      }
                      delay={300}
                    />

                    <InputField
                      label="Age *"
                      value={formData.age}
                      onChangeText={(value) => handleInputChange("age", value)}
                      placeholder="Enter your age"
                      keyboardType="numeric"
                      error={errors.age}
                      icon={
                        <MaterialCommunityIcons
                          name="cake-variant"
                          size={moderateScale(18)}
                          color="#4a6fa5"
                        />
                      }
                      delay={400}
                    />
                  </View>
                )}

                {/* Contact Information Section */}
                {currentSection === 1 && (
                  <View style={styles.section}>
                    <InputField
                      label="Address *"
                      value={formData.address}
                      onChangeText={(value) =>
                        handleInputChange("address", value)
                      }
                      placeholder="Enter your full address"
                      multiline={true}
                      error={errors.address}
                      icon={
                        <Ionicons
                          name="location-outline"
                          size={moderateScale(18)}
                          color="#4a6fa5"
                        />
                      }
                      delay={100}
                    />

                    <InputField
                      label="Email Address *"
                      value={formData.email}
                      onChangeText={(value) =>
                        handleInputChange("email", value)
                      }
                      placeholder="Enter your email address"
                      keyboardType="email-address"
                      error={errors.email}
                      icon={
                        <Ionicons
                          name="mail-outline"
                          size={moderateScale(18)}
                          color="#4a6fa5"
                        />
                      }
                      delay={200}
                    />

                    <InputField
                      label="Password *"
                      value={formData.password}
                      onChangeText={(value) =>
                        handleInputChange("password", value)
                      }
                      placeholder="Create a secure password"
                      error={errors.password}
                      icon={
                        <Ionicons
                          name="lock-closed-outline"
                          size={moderateScale(18)}
                          color="#4a6fa5"
                        />
                      }
                      secureTextEntry={!showPassword}
                      delay={300}
                      rightIcon={
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeIcon}
                        >
                          <Ionicons
                            name={
                              showPassword ? "eye-outline" : "eye-off-outline"
                            }
                            size={moderateScale(18)}
                            color="#4a6fa5"
                          />
                        </TouchableOpacity>
                      }
                    />

                    <InputField
                      label="Confirm Password *"
                      value={formData.confirmPassword}
                      onChangeText={(value) =>
                        handleInputChange("confirmPassword", value)
                      }
                      placeholder="Confirm your password"
                      error={errors.confirmPassword}
                      icon={
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={moderateScale(18)}
                          color="#4a6fa5"
                        />
                      }
                      secureTextEntry={!showPassword}
                      delay={400}
                      rightIcon={
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeIcon}
                        >
                          <Ionicons
                            name={
                              showPassword ? "eye-outline" : "eye-off-outline"
                            }
                            size={moderateScale(18)}
                            color="#4a6fa5"
                          />
                        </TouchableOpacity>
                      }
                    />

                    <InputField
                      label="Contact Number *"
                      value={formData.contactNumber}
                      onChangeText={(value) =>
                        handleInputChange("contactNumber", value)
                      }
                      placeholder="Enter your phone number"
                      keyboardType="phone-pad"
                      error={errors.contactNumber}
                      icon={
                        <Ionicons
                          name="call-outline"
                          size={moderateScale(18)}
                          color="#4a6fa5"
                        />
                      }
                      delay={300}
                    />
                  </View>
                )}

                {/* Emergency Contact Section */}
                {currentSection === 2 && (
                  <View style={styles.section}>
                    <InputField
                      label="Contact Person Name *"
                      value={formData.emergencyContactName}
                      onChangeText={(value) =>
                        handleInputChange("emergencyContactName", value)
                      }
                      placeholder="Enter emergency contact name"
                      error={errors.emergencyContactName}
                      icon={
                        <FontAwesome5
                          name="user-shield"
                          size={moderateScale(16)}
                          color="#4a6fa5"
                        />
                      }
                      delay={100}
                    />

                    <InputField
                      label="Contact Person Number *"
                      value={formData.emergencyContactNumber}
                      onChangeText={(value) =>
                        handleInputChange("emergencyContactNumber", value)
                      }
                      placeholder="Enter emergency contact number"
                      keyboardType="phone-pad"
                      error={errors.emergencyContactNumber}
                      icon={
                        <Ionicons
                          name="call-outline"
                          size={moderateScale(18)}
                          color="#4a6fa5"
                        />
                      }
                      delay={200}
                    />
                  </View>
                )}

                {/* Navigation Buttons */}
                <View style={styles.navigationButtons}>
                  {currentSection > 0 && (
                    <TouchableOpacity
                      style={styles.prevButton}
                      onPress={() => setCurrentSection(currentSection - 1)}
                    >
                      <Ionicons
                        name="arrow-back"
                        size={moderateScale(18)}
                        color="#4a6fa5"
                      />
                      <Text style={styles.prevButtonText}>Previous</Text>
                    </TouchableOpacity>
                  )}

                  {currentSection < 2 ? (
                    <TouchableOpacity
                      style={[
                        styles.nextButton,
                        currentSection === 0 && styles.fullWidthButton,
                      ]}
                      onPress={() => setCurrentSection(currentSection + 1)}
                    >
                      <Text style={styles.nextButtonText}>Next</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={moderateScale(18)}
                        color="#f5f1e8"
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.submitButton,
                        isLoading && styles.submitButtonDisabled,
                      ]}
                      onPress={handleSubmit}
                      disabled={isLoading}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={["#4a6fa5", "#3d5a8a"]}
                        style={styles.submitGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
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
                                size={moderateScale(18)}
                                color="#f5f1e8"
                              />
                            </Animatable.View>
                            <Text style={styles.submitButtonText}>
                              Creating...
                            </Text>
                          </View>
                        ) : (
                          <>
                            <Text style={styles.submitButtonText}>
                              Create Account
                            </Text>
                            <Ionicons
                              name="checkmark-circle"
                              size={moderateScale(18)}
                              color="#f5f1e8"
                            />
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Terms and Conditions */}
                <Animatable.View
                  animation="fadeIn"
                  delay={800}
                  style={styles.termsContainer}
                >
                  <Text style={styles.termsText}>
                    By creating an account, you agree to our{" "}
                    <Text style={styles.termsLink}>Terms</Text> and{" "}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </Animatable.View>
              </BlurView>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(20),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(20),
    paddingTop: Platform.OS === "ios" ? verticalScale(10) : verticalScale(30),
    paddingBottom: verticalScale(10),
  },
  backButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "rgba(245, 241, 232, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "600",
    color: "#f5f1e8",
    fontSize: moderateScale(13), 
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  placeholder: {
    width: moderateScale(36),
  },
  progressContainer: {
    paddingHorizontal: moderateScale(20),
    marginBottom: verticalScale(15),
  },
  progressText: {
    fontSize: moderateScale(11),
    color: "rgba(245, 241, 232, 0.8)",
    marginTop: verticalScale(6),
    fontFamily: "Poppins-Regular",
  },
  formCard: {
    marginHorizontal: moderateScale(20),
    borderRadius: moderateScale(20),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    flex: 1,
  },
  blurContainer: {
    backgroundColor: "rgba(245, 241, 232, 0.95)",
    padding: moderateScale(20),
    flex: 1,
  },
  formHeader: {
    alignItems: "center",
    marginBottom: verticalScale(16),
  },
  iconContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    backgroundColor: "rgba(74, 111, 165, 0.1)",
    borderRadius: moderateScale(30),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: verticalScale(12),
  },
  formTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#4a6fa5",
    fontFamily: "Poppins-Bold",
    marginBottom: verticalScale(4),
  },
  formSubtitle: {
    fontSize: moderateScale(12),
    color: "#6b7280",
    fontFamily: "Poppins-Regular",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: verticalScale(16),
    backgroundColor: "rgba(74, 111, 165, 0.05)",
    borderRadius: moderateScale(12),
    padding: moderateScale(3),
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(10),
    gap: moderateScale(4),
  },
  activeTab: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: moderateScale(11),
    color: "#a0aec0",
    fontFamily: "Poppins-Medium",
  },
  activeTabText: {
    color: "#4a6fa5",
  },
  section: {
    marginBottom: verticalScale(16),
  },
  inputContainer: {
    marginBottom: verticalScale(14),
  },
  inputLabel: {
    fontSize: moderateScale(13),
    fontWeight: "500",
    color: "#4a6fa5",
    marginBottom: verticalScale(6),
    fontFamily: "Poppins-Medium",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(74, 111, 165, 0.3)",
    borderRadius: moderateScale(10),
    overflow: "hidden",
  },
  inputWrapperError: {
    borderColor: "#e53e3e",
    backgroundColor: "#fed7d7",
  },
  inputIcon: {
    width: moderateScale(40),
    height: verticalScale(44),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(74, 111, 165, 0.08)",
  },
  input: {
    flex: 1,
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(14),
    color: "#2d3748",
    fontFamily: "Poppins-Regular",
  },
  textArea: {
    height: verticalScale(70),
    textAlignVertical: "top",
  },
  checkIcon: {
    paddingRight: moderateScale(10),
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(4),
  },
  errorText: {
    fontSize: moderateScale(11),
    color: "#e53e3e",
    marginLeft: moderateScale(4),
    fontFamily: "Poppins-Regular",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: verticalScale(16),
    gap: moderateScale(10),
  },
  prevButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#4a6fa5",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12), // Slightly reduced from 14
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(6),
    minWidth: moderateScale(100),
  },
  prevButtonText: {
    color: "#4a6fa5",
    fontSize: moderateScale(13), // Slightly reduced from 14
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#4a6fa5",
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(12), // Slightly reduced from 14
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(6),
    shadowColor: "#4a6fa5",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    minWidth: moderateScale(100),
  },
  fullWidthButton: {
    flex: 2,
  },
  nextButtonText: {
    color: "#f5f1e8",
    fontSize: moderateScale(13), // Slightly reduced from 14
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  submitButton: {
    flex: 1,
    borderRadius: moderateScale(12),
    overflow: "hidden",
    shadowColor: "#4a6fa5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.15,
  },
  submitGradient: {
    flexDirection: "row",
    paddingVertical: verticalScale(12), // Slightly reduced from 14
    paddingHorizontal: moderateScale(10), // Add horizontal padding
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(6),
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
  },
  submitButtonText: {
    color: "#f5f1e8",
    fontSize: moderateScale(14), // Slightly reduced from 15
    fontWeight: "600",
    letterSpacing: 0.3,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  termsContainer: {
    marginTop: verticalScale(14),
    paddingHorizontal: moderateScale(16),
  },
  termsText: {
    fontSize: moderateScale(11),
    color: "#6b7280",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    lineHeight: moderateScale(16),
  },
  termsLink: {
    color: "#4a6fa5",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
