import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgetPassInputScreen = (props:any) => {
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');

  const handelsubmit = () => {
  } 
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainView}>
        <TouchableOpacity onPress={() => props.navigation.goBack("ForgotPasswordScreen")}>
        <Image
          source={require('../../assets/png/backAerro.png')}
          style={styles.image}
        />
</TouchableOpacity>
        <Text style={styles.title}>Forgot{'\n'}Password ?</Text>

        <Text style={styles.subtitle}>
          Don’t worry! it happens. Please enter the{'\n'}address associated with
          your account.
        </Text>
        <Text style={{ marginTop: 15,color:"#4E4B66",fontWeight:"400" }}>Email ID / Mobile number</Text>
        <TextInput
          style={styles.textInput}
          placeholder=''
          placeholderTextColor={"#000"}
        />
      
        <TouchableOpacity style={styles.button} onPress={() => props.navigation.navigate("OTPScreen")}>
          <Text style={styles.btnText}>Submit</Text>
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
   btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
