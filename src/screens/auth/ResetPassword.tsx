import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ResetPassword = (props: any) => {
  const [Show, setShow] = useState(false);
  const [show, setshow] = useState(false);

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');

  const handelreset = () => {
    if (!password) {
      setPasswordError('Password is required');
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
    } else {
      setPasswordError('');
    }

    if (!newPassword) {
      setNewPasswordError('Confirm Password is required');
    } else if (password !== newPassword) {
      setNewPasswordError('Passwords do not match');
    } else {
      setNewPasswordError('');
    }

    if (password && password.length >= 6 && newPassword) {
      props.navigation.navigate('CongratulationScreen');
    }
  };

  return (
    <SafeAreaView style={styels.container}>
      <View>
        <TouchableOpacity onPress={() => props.navigation.navigate("OTPScreen")}>
          <Image source={require('../../assets/png/backAerro.png')} />
        </TouchableOpacity>
        <Text style={styels.title}>Reset{'\n'}Password</Text>

        <Text style={styels.passText}>New Password</Text>
        <View style={styels.inputBox}>
          <TextInput
            style={styels.input}
            placeholder=""
            placeholderTextColor={'#000'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!Show}
          />
          <TouchableOpacity
            onPress={() => setShow(!Show)}
            style={{ alignItems: 'center' }}
          >
            <Image
              style={styels.eye}
              source={
                Show
                  ? require('../../assets/png/visibility.png')
                  : require('../../assets/png/visibilityOff.png')
              }
            />
          </TouchableOpacity>
        </View>
        <Text style={styels.erroetext}>{passwordError}</Text>

        <Text style={styels.passText}>Confirm new password</Text>
        <View style={styels.inputBox}>
          <TextInput
            style={styels.input}
            placeholder=""
            placeholderTextColor={'#000'}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!show}
          />
          <TouchableOpacity
            onPress={() => setshow(!show)}
            style={{ alignItems: 'center' }}
          >
            <Image
              style={styels.eye}
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
        <TouchableOpacity style={styels.SubmitTouchable} onPress={handelreset}>
          <Text style={styels.SubmitText}>Submit</Text>
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
  SubmitText: {
    color: '#fff',
    textAlign: 'center',
  },
  erroetext: {
    color: 'red',
  },
});
