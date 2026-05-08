import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPasswordScreen = (props:any) => {
  const [selected, setSelected] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainView}>
        <Image
          source={require('../../assets/png/backAerro.png')}
          style={styles.image}
        />

        <Text style={styles.title}>Forgot{'\n'}Password ?</Text>

        <Text style={styles.subtitle}>
          Don’t worry! it happens. Please select the{'\n'}email or number
          associated with your{'\n'}account.
        </Text>

        <TouchableOpacity
          style={[styles.card, selected === 'email' && '']}
          onPress={() => setSelected('email')}
        >
          <View style={styles.iconBox}>
            <Image
              style={styles.icon}
              source={require('../../assets/png/email.png')}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>via Email:</Text>
            <Text style={styles.value}>example@youremail.com</Text>
          </View>

          <View style={styles.outerCircle}>
            {selected === 'email' && <View style={styles.innerCircle} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, selected === 'sms' && '']}
          onPress={() => setSelected('sms')}
        >
          <View style={styles.iconBox}>
            <Image
              style={styles.icon}
              source={require('../../assets/png/sms.png')}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>via SMS:</Text>
            <Text style={styles.value}>+62-8421-4512-2531</Text>
          </View>

          <View style={styles.outerCircle}>
            {selected === 'sms' && <View style={styles.innerCircle} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!selected}
          style={[styles.button, !selected && styles.disabledBtn]}
          onPress={() => props.navigation.navigate("ForgetPassInputScreen")}
        >
          <Text style={styles.btnText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

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
  emailImage: {
    width: 20,
    height: 20,
  },
  emailView: {
    backgroundColor: '#1877F2',
    width: 50,
    height: 50,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailContainer: {
    marginTop: 40,
    backgroundColor: '#EEF1F4',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emailText: {
    fontSize: 14,
    color: '#667080',
    fontWeight: '400',
  },
  emailInputText: {
    fontSize: 16,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  outerCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1877F2',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6F9',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
  },

  iconBox: {
    width: 45,
    height: 45,
    backgroundColor: '#1E74F5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
    color: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#777',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#1E74F5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical:350
  },
  disabledBtn: {
    backgroundColor: '#B0C7F7',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
