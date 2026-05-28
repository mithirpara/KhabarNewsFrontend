import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import OtpInputs from 'react-native-otp-inputs';
import { useAppTheme } from '../../hooks/useAppTheme';
import { resendPasswordResetOtp, verifyPasswordResetOtp } from '../../services/authApi';

const RESEND_SECONDS = 60;

const OTPScreen = ( props:any ) => {
  const { colors } = useAppTheme();
  const params = props.route?.params || {};

  const [otp, setOtp] = useState('');
  const [error, setError] = useState(false);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (isVerifying) {
      return;
    }

    if (otp.length !== 4) {
      setError(true);
      return;
    }

    try {
      setIsVerifying(true);
      setError(false);

      const response = await verifyPasswordResetOtp({
        requestId: params.requestId,
        otp,
      });

      props.navigation.replace("ResetPasswordScreen", {
        resetToken: response?.data?.resetToken,
      });
    } catch (verifyError: any) {
      setError(true);
      Alert.alert('Invalid OTP', verifyError?.message || 'Please enter a valid OTP.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) {
      return;
    }

    try {
      setIsResending(true);
      await resendPasswordResetOtp({
        requestId: params.requestId,
        channel: params.channel,
      });

      setTimer(RESEND_SECONDS);
      setOtp('');
      setError(false);
    } catch (resendError: any) {
      Alert.alert('Resend failed', resendError?.message || 'Could not resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
         
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => props.navigation.goBack()}>
          <Image source={require("../../assets/png/backAerro.png")} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>OTP Verification</Text>

        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          Enter the OTP sent to {params.identifier || 'your account'}
        </Text>

        <View style={styles.otpWrapper}>
          <OtpInputs
            autofillFromClipboard={false}
            numberOfInputs={4}
            handleChange={(code) => {
              setOtp(code);
              setError(false);
            }}
            keyboardType="phone-pad"
            inputStyles={[
              styles.otpBox,
              { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
              error && styles.errorBox
            ]}
            focusStyles={styles.focusBox}
          />
        </View>

        {error && (
          <Text style={styles.errorText}>
            Invalid OTP
          </Text>
        )}

        <View style={styles.resendBlock}>
          <TouchableOpacity onPress={handleResend} disabled={timer > 0 || isResending}>
            <Text style={[styles.timerText, { color: colors.mutedText }]}>
              {timer > 0 ? (
                <>Resend code in <Text style={styles.timer}>{timer}s</Text></>
              ) : isResending ? (
                'Resending...'
              ) : (
                'Resend code'
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.bottom, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Verify</Text>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default OTPScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F9',
    justifyContent: 'space-between',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#4E4B66',
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: '#6E7191',
    textAlign: 'center',
    marginBottom: 30,
  },

  otpWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 70,
    marginTop: 4,
    marginBottom: 18,
  },

  otpBox: {
    width: 54,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#D1D1D6',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 6,
  },

  focusBox: {
    borderColor: '#1E74F5',
  },

  errorBox: {
    borderColor: '#FF2D55',
  },

  errorText: {
    color: '#FF2D55',
    fontSize: 14,
    marginTop: 0,
    marginBottom: 8,
    textAlign: 'center',
  },

  resendBlock: {
    minHeight: 28,
    justifyContent: 'center',
  },

  timerText: {
    fontSize: 14,
    color: '#6E7191',
    width:"100%",
    textAlign:"center"
  },

  timer: {
    color: '#FF2D55',
    fontWeight: 'bold',
  },
  bottom: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#EFEFEF',
  },

  button: {
    backgroundColor: '#1E74F5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
