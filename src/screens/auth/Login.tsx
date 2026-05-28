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
import { useDispatch } from 'react-redux';
import CheckBox from '../../component/CheckBox';
import { setAuthUser } from '../../redux/Slices/authSlice';
import { loginUser } from '../../services/authApi';
import { saveAuthUser } from '../../services/authStorage';
import { useAppTheme } from '../../hooks/useAppTheme';
import { registerPushToken } from '../../services/pushNotificationService';

const Login = (props: any) => {
  const { colors } = useAppTheme();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [agree, setAgree] = useState(false);
  const [Show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleLogin = async () => {
    if (isSubmitting) {
      return;
    }

    let isValid = true;

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!isValid) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await loginUser({
        email: email.trim(),
        password,
      });

      const user = response?.data || {};
      const authUser = {
        userId: user.userId || '',
        email: user.email || email.trim(),
        username: user.username || '',
        fullName: user.fullName || '',
      };

      await saveAuthUser(authUser);
      dispatch(setAuthUser(authUser));
      registerPushToken(authUser.userId).catch(error => {
        console.log('Push token registration failed:', error?.message || error);
      });

      props.navigation.reset({
        index: 0,
        routes: [{ name: 'HomeNavigation' }],
      });
    } catch (error: any) {
      Alert.alert('Login failed', error?.message || 'Something went wrong while logging in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View>
        <Text style={[styles.title, { color: colors.text }]}>Hello</Text>
        <Text style={styles.subtitle}>Again!</Text>
        <Text style={[styles.welcomeBack, { color: colors.mutedText }]}>
          Welcome back you've {'\n'}been missed!
        </Text>

        <View style={{ marginTop: 30 }}>
          <Text style={{ color: colors.text }}>Username</Text>
          <TextInput
            style={[styles.textinput, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.surface }]}
            placeholder="Enter email"
            placeholderTextColor={colors.mutedText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={{ color: '#C30052', fontSize: 12 }}>{emailError}</Text>
          <View>
            <Text style={{ marginTop: 15, color: colors.text }}>Password</Text>
            <View style={[styles.inputBox, { borderColor: colors.inputBorder, backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter password"
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
                  style={[styles.eye, { tintColor: colors.icon }]}
                  source={
                    Show
                      ? require('../../assets/png/visibility.png')
                      : require('../../assets/png/visibilityOff.png')
                  }
                />
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#C30052', fontSize: 12 }}>
              {passwordError}
            </Text>
          </View>
          <View style={styles.checkBoxView}>
            <CheckBox
              label="Remember me"
              checked={agree}
              onPress={() => setAgree(!agree)}
            />
            <TouchableOpacity onPress={() => props.navigation.navigate('ForgotPasswordScreen')}>
              <Text style={styles.forgotPasswordText}>
                Forgot the Password?
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              style={[styles.loginTouchable, isSubmitting && styles.loginDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={[styles.orContinue, { color: colors.mutedText }]}>or continue with</Text>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-around' }}
          >
            <TouchableOpacity style={[styles.iconView, { borderColor: colors.border }]}>
              <View style={styles.imageView}>
                <Image
                  source={require('../../assets/png/Facebook.png')}
                  style={styles.imageStyle}
                />
                <Text style={[styles.facebookText, { color: colors.mutedText }]}>Facebook</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconView, { borderColor: colors.border }]}>
              <View style={styles.imageView}>
                <Image
                  source={require('../../assets/png/google.png')}
                  style={styles.imageStyle}
                />
                <Text style={[styles.googleText, { color: colors.mutedText }]}>Google</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 30,
            }}
          >
            <Text style={[styles.accountText, { color: colors.mutedText }]}>don't have an account ?</Text>
            <TouchableOpacity
              onPress={() => props.navigation.navigate('SignUpScreen')}
            >
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 50,
    fontWeight: '700',
    color: '#050505',
  },
  subtitle: {
    fontSize: 50,
    color: '#2563eb',
    fontWeight: '900',
  },
  welcomeBack: {
    fontSize: 20,
    fontWeight: '400',
    color: '#667080',
  },
  loginTouchable: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    minHeight: 48,
    justifyContent: 'center',
  },
  loginDisabled: {
    opacity: 0.7,
  },
  loginText: {
    color: '#fff',
    textAlign: 'center',
  },
  orContinue: {
    textAlign: 'center',
    marginTop: 20,
    color: '#667080',
    fontWeight: '400',
  },
  textinput: {
    borderWidth: 1,
    borderColor: '#4E4B66',
    borderRadius: 8,
    color: '#000',
    marginTop: 10,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#4E4B66',
    borderRadius: 8,
    color: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  eye: {
    right: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#000',
  },
  signupText: { color: '#2563eb',width:50 },
  accountText: { color: '#667080',width:150 },
  iconView: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    width: 150,
    alignItems: 'center',
  },
  imageView: { alignItems: 'center', flexDirection: 'row' },
  imageStyle: { width: 20, height: 20 },
  googleText: { marginLeft: 10, width: 50, color: '#667080' },
  facebookText: { marginLeft: 10, color: '#667080' },
  forgotPasswordText: { color: '#2563eb', width: 150, marginLeft: 12 },
  checkBoxView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
