import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { requestPasswordReset } from '../../services/authApi';

const ForgetPassInputScreen = (props:any) => {
  const { colors } = useAppTheme();
  const [identifier, setIdentifier] = useState('');
  const [identifierErr, setIdentifierErr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handelsubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      setIdentifierErr('Email is required');
      return;
    }

    if (!emailRegex.test(trimmedIdentifier)) {
      setIdentifierErr('Please enter a valid email address');
      return;
    }

    setIdentifierErr('');

    try {
      setIsSubmitting(true);
      const response = await requestPasswordReset({
        identifier: trimmedIdentifier,
        channel: 'email',
      });

      const data = response?.data || {};

      props.navigation.navigate('OTPScreen', {
        requestId: data.requestId,
        identifier: data.destination || trimmedIdentifier,
        channel: 'email',
        expiresInSeconds: data.expiresInSeconds,
        devOtp: data.devOtp,
      });
    } catch (error: any) {
      Alert.alert('OTP failed', error?.message || 'Something went wrong while sending OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mainView}>
        <TouchableOpacity onPress={() => props.navigation.goBack("ForgotPasswordScreen")}>
        <Image
          source={require('../../assets/png/backAerro.png')}
          style={styles.image}
        />
</TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Forgot{'\n'}Password ?</Text>

        <Text style={[styles.subtitle, { color: colors.mutedText }]}>
          Don’t worry! it happens. Please enter the{'\n'}address associated with
          your account.
        </Text>
        <Text style={{ marginTop: 15,color: colors.mutedText,fontWeight:"400" }}>Email ID</Text>
        <TextInput
          style={[styles.textInput, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.surface }]}
          placeholder=''
          placeholderTextColor={colors.mutedText}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Text style={styles.errorText}>{identifierErr}</Text>
      
        <TouchableOpacity style={[styles.button, isSubmitting && styles.disabledBtn]} onPress={handelsubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ForgetPassInputScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainView: {
    margin: 20,
  },
  image: {
    width: 20,
    height: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 20,
    color: '#4E4B66',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    marginTop: 10,
    color: '#4E4B66',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#4E4B66',
    borderRadius: 6,
    marginTop: 10,
    color:"#000"
  },
  button: {
    backgroundColor: '#1E74F5',
    padding:16,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical:450,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  errorText: {
    color: '#C30052',
    fontSize: 12,
    marginTop: 4,
  },
   btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
