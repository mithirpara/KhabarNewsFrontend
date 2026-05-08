import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';

const CheckBox = ({ checked, onPress, label }) => {
  const [isChecked, setIsChecked] = useState(true);

  return (
    <View>
      <TouchableOpacity
        style={styles.row}
        onPress={() => setIsChecked(!isChecked)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isChecked && styles.checkedBox]}>
          {isChecked && <Text style={styles.tick}>✓</Text>}
        </View>

        <Text style={styles.label}>Remember me </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CheckBox;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  box: {
    width: 22,
    height: 22,
    // borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderColor: '#333',
  },
  checked: {
    backgroundColor: '#007AFF',
  },
  tick: {
    color: '#fff',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 14,
    width: 100,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 4,
  },
  checkedBox: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },

  label: {
    fontSize: 16,
  },
  status: {
    marginTop: 20,
  },
});
