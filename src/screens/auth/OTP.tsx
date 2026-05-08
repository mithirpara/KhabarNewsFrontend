import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import OtpInputs from 'react-native-otp-inputs';

const OTPScreen = ( props:any ) => {

  const [otp, setOtp] = useState('');
  const [error, setError] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = () => {

    if (otp.length !== 4) {
      setError(true);
      return;
    }

    if (otp !== "1234") {
      setError(true);
      return;
    }

    setError(false);

    
    navigation.replace("ResetPasswordScreen");
  };

  return (
    <View style={styles.container}>
         
      <View style={styles.content}>
        <View>
        <TouchableOpacity>
          <Image source={require("../../assets/png/backAerro.png")}/>
         </TouchableOpacity>
         </View>
        <Text style={styles.title}>OTP Verification</Text>

        <Text style={styles.subtitle}>
          Enter the OTP sent to +67-1234-5678-9
        </Text>

        <OtpInputs
          numberOfInputs={4}
          handleChange={(code) => {
            setOtp(code);
            setError(false);
          }}
          keyboardType="number-pad"
          inputStyles={[
            styles.otpBox,
            error && styles.errorBox
          ]}
          focusStyles={styles.focusBox}
        />

        {error && (
          <Text style={styles.errorText}>
             Invalid OTP
          </Text>
        )}

        <Text style={styles.timerText}>
          Resend code in <Text style={styles.timer}>{timer}s</Text>
        </Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.button}
          onPress={()=> props.navigation.navigate("ResetPasswordScreen")}
        >
          <Text style={styles.btnText}>Verify</Text>
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
    paddingHorizontal: 35,
    marginTop: 70,
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
    marginBottom: 35,
  },

  otpBox: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderColor: '#D1D1D6',
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 8,
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
    marginTop: 35,
    alignSelf: 'flex-start',  
    marginLeft: 15,
    width:'100%'
  
  },

  timerText: {
    marginTop: 35,
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
