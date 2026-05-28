import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { resetPassword } from '../../services/authApi';

const ResetPassword = (props: any) => {
  const { colors } = useAppTheme();
  const [Show, setShow] = useState(false);
  const [show, setshow] = useState(false);

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handelreset = async () => {
    if (isSubmitting) {
      return;
    }

    let isValid = true;

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!newPassword) {
      setNewPasswordError('Confirm Password is required');
      isValid = false;
    } else if (password !== newPassword) {
      setNewPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setNewPasswordError('');
    }

    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword({
        resetToken: props.route?.params?.resetToken,
        newPassword: password,
      });

      props.navigation.navigate('CongratulationScreen');
    } catch (error: any) {
      Alert.alert('Reset failed', error?.message || 'Something went wrong while resetting password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styels.container, { backgroundColor: colors.background }]}>
      <View>
        <TouchableOpacity onPress={() => props.navigation.navigate("OTPScreen")}>
          <Image source={require('../../assets/png/backAerro.png')} />
        </TouchableOpacity>
        <Text style={[styels.title, { color: colors.text }]}>Reset{'\n'}Password</Text>

        <Text style={[styels.passText, { color: colors.mutedText }]}>New Password</Text>
        <View style={[styels.inputBox, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}>
          <TextInput
            style={[styels.input, { color: colors.text }]}
            placeholder=""
            placeholderTextColor={colors.mutedText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!Show}
          />
          <TouchableOpacity
            onPress={() => setShow(!Show)}
            style={{ alignItems: 'center' }}
          >
            <Image
              style={[styels.eye, { tintColor: colors.icon }]}
              source={
                Show
                  ? require('../../assets/png/visibility.png')
                  : require('../../assets/png/visibilityOff.png')
              }
            />
          </TouchableOpacity>
        </View>
        <Text style={styels.erroetext}>{passwordError}</Text>

        <Text style={[styels.passText, { color: colors.mutedText }]}>Confirm new password</Text>
        <View style={[styels.inputBox, { backgroundColor: colors.surface, borderColor: colors.inputBorder }]}>
          <TextInput
            style={[styels.input, { color: colors.text }]}
            placeholder=""
            placeholderTextColor={colors.mutedText}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!show}
          />
          <TouchableOpacity
            onPress={() => setshow(!show)}
            style={{ alignItems: 'center' }}
          >
            <Image
              style={[styels.eye, { tintColor: colors.icon }]}
              source={
                show
                  ? require('../../assets/png/visibility.png')
                  : require('../../assets/png/visibilityOff.png')
              }
            />
          </TouchableOpacity>
        </View>
        <Text style={styels.erroetext}>{newPasswordError}</Text>
      </View>
      <View>
        <TouchableOpacity style={[styels.SubmitTouchable, isSubmitting && styels.disabledBtn]} onPress={handelreset} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styels.SubmitText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ResetPassword;

const styels = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  title: {
    color: '#4E4B66',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 30,
  },
  passText: {
    marginTop: 30,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#4E4B66',
    borderRadius: 8,
    color: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  eye: {
    fontSize: 18,
    right: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#000',
  },
  SubmitTouchable: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  SubmitText: {
    color: '#fff',
    textAlign: 'center',
  },
  erroetext: {
    color: 'red',
  },
});
