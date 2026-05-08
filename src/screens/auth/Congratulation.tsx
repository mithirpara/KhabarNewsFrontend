import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';

const Congratulation = ({ navigation }: any) => {
  return (
    <View style={styles.container}>

      <View style={styles.logoContainer}>
        <Image source={require("../../assets/png/logoKhabar.png")}/>
        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>
          Your account is ready to use
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('HomeNavigation')}
      >
        <Text style={styles.buttonText}>Go to Homepage</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Congratulation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },

  logoContainer: {
    // marginTop: 80,
    alignItems:"center",
    justifyContent:"center",
    flex:1,
    width:"100%"
  },

 

  logoIcon: {
    color: '#2F80ED',
  },


  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A4A68',
    marginTop: 50,
  },

  subtitle: {
    fontSize: 14,
    color: '#7D7D9C',
    width:"100%",
    textAlign:"center"
    
  },

  button: {
    width: '90%',
    height: 55,
    backgroundColor: '#2F80ED',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
