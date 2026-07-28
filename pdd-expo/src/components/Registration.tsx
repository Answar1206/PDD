import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { UserProfile } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

interface RegistrationProps {
  backendUrl: string;
  onRegisterSuccess: (user: UserProfile) => void;
  onMockSignIn: () => void;
}

export default function Registration({ backendUrl, onRegisterSuccess, onMockSignIn }: RegistrationProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'register' | 'login'>('login');
  
  // OTP flow states
  const [otpStep, setOtpStep] = useState<'form' | 'verify'>('form');
  const [otpValue, setOtpValue] = useState('');

  const requestOtp = async (targetEmail: string) => {
    setErrorText('');
    setIsLoading(true);

    try {
      const res = await fetch(`${backendUrl}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        setOtpStep('verify');
      } else {
        setErrorText(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setErrorText('Could not connect to backend to request OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    setErrorText('');
    if (mode === 'register' && !fullName.trim()) {
      setErrorText('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorText('Please enter a valid investigator email address.');
      return;
    }
    if (password.length < 8) {
      setErrorText('Password must be at least 8 characters long.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setErrorText('Passwords do not match.');
      return;
    }

    onRegisterSuccess({
      name: fullName.trim() || email.split('@')[0],
      email: email.trim(),
      role: 'Forensic Investigator',
      avatarUrl: ''
    });
  };

  const handleVerifyOtp = async () => {
    if (!otpValue.trim()) {
      setErrorText('Please enter the 6-digit OTP code.');
      return;
    }

    setErrorText('');
    setIsLoading(true);

    try {
      const res = await fetch(`${backendUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otpValue.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        onRegisterSuccess({
          name: fullName.trim() || email.split('@')[0],
          email: email.trim(),
          role: 'Forensic Investigator',
          avatarUrl: ''
        });
      } else {
        setErrorText(data.error || 'Invalid OTP code.');
      }
    } catch (err) {
      setErrorText('Could not connect to backend to verify OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSignIn = () => {
    onRegisterSuccess({
      name: 'Dr. Elias Vance',
      email: 'e.vance@forensiq.ai',
      role: 'Chief Forensic Investigator',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAKWBJ-aLddn7E--oDjjwzZLYy7-QNSDxUJQHAT7nPkN7FshuuU1sIQRGTn8Q0N6cbd2xFAyE-ZT2KUSAbj3TTIBYi6h2ZyFP3kMP196kNPxeBREpM6PgSzVSJ0sGzVjGAovb0OXyB2ToPatpNdsWINOAnQ7S7ozshCCJCzoEmmFjZfjkn7lzmSE1jQQtsp8BcMK--hqqX5EHlbRoPPA4JbsH7Gc77EN_MWVOgPcdnxiwpLggsC9sdGLkhQDmUpqw_rcNW6MGCqSo'
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.logoText}>FORENSIQ <Text style={styles.logoAccent}>AI</Text></Text>
          <Text style={styles.subtitle}>Scientific Evidence Verification at Scale</Text>
        </View>

        {errorText ? (
          <View style={styles.errorBox}>
            <MaterialIcons name="error-outline" size={20} color="#721c24" />
            <Text style={styles.errorText}>{errorText}</Text>
          </View>
        ) : null}

        {otpStep === 'form' ? (
          <View style={styles.form}>
            <Text style={styles.title}>{mode === 'register' ? 'Create Account' : 'Welcome Back'}</Text>
            
            {mode === 'register' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Dr. Elias Vance"
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="e.vance@forensiq.ai"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {mode === 'register' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>{mode === 'register' ? 'Create Account' : 'Sign In'}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.switchModeContainer}>
              <Text style={styles.switchText}>
                {mode === 'register' ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setMode(mode === 'register' ? 'login' : 'register')}>
                <Text style={styles.switchLink}>{mode === 'register' ? 'Log In' : 'Register'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.title}>Verify Credentials</Text>
            <Text style={styles.infoText}>
              A 6-digit OTP code has been logged to the backend console. Please check the backend log/output window to copy it.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Enter 6-Digit OTP Code</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="123456"
                placeholderTextColor="#999"
                value={otpValue}
                onChangeText={setOtpValue}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleVerifyOtp} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Verify and Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backBtn} onPress={() => setOtpStep('form')}>
              <Text style={styles.backBtnText}>Back to Credentials Form</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#edebe6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    ...Platform.select({
      web: {
        height: '100vh',
      }
    })
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.15)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#300000',
    letterSpacing: -1,
  },
  logoAccent: {
    color: '#800000',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(48, 0, 0, 0.6)',
    marginTop: 4,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#300000',
    marginBottom: 16,
    textAlign: 'left',
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: '#721c24',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#300000',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 14,
    color: '#300000',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 20,
    letterSpacing: 8,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#800000',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  switchText: {
    fontSize: 13,
    color: '#666',
  },
  switchLink: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#800000',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
  quickAccessBtn: {
    backgroundColor: '#300000',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAccessBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  backBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#800000',
    fontSize: 13,
    fontWeight: 'bold',
  }
});
