import React from 'react';
import { ScrollView, TouchableOpacity, View, Text, Image, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const DATA = [
  {
    id: '1',
    type: 'today',
    name: 'BBC News',
    message: 'has posted new europe news “Ukraine\'s President Zele...”',
    time: '15m ago',
    image: require('../../assets/png/News1.png'),
    follow: false,
  },
  {
    id: '2',
    type: 'today',
    name: 'Modelyn Saris',
    message: 'is now following you',
    time: '1h ago',
    image: require('../../assets/png/News2.png'),
    follow: true,
  },
  {
    id: '3',
    type: 'today',
    name: 'BBC News',
    message: 'has posted new europe news “Ukraine\'s President Zele...”',
    time: '15m ago',
    image: require('../../assets/png/News1.png'),
    follow: false,
  },
  {
    id: '4',
    type: 'today',
    name: 'BBC News',
    message: 'has posted new europe news “Ukraine\'s President Zele...”',
    time: '15m ago',
    image: require('../../assets/png/News1.png'),
    follow: false,
  },
  {
    id: '5',
    type: 'yesterday',
    name: 'Marley Botosh',
    message: 'is now following you',
    time: '1 Day ago',
    image: require('../../assets/png/News3.png'),
    follow: true,
  },
  {
    id: '6',
    type: 'today',
    name: 'BBC News',
    message: 'has posted new europe news “Ukraine\'s President Zele...”',
    time: '15m ago',
    image: require('../../assets/png/News1.png'),
    follow: false,
  },
];
const Notification = (props:any) => {

   const renderItem = ({ item, index }) => (
    <View>
      
      {index === 0 && (
        <Text style={styles.sectionTitle}>Today, April 22</Text>
      )}

      {index === 3 && (
        <Text style={styles.sectionTitle}>Yesterday, April 21</Text>
      )}

      <View style={styles.card}>
        
        <Image source={item.image} style={styles.avatar} />

        <View style={styles.content}>
          <Text style={styles.text}>
            {item.name} 
            {item.message}
          </Text>

          <Text style={styles.time}>{item.time}</Text>
        </View>

        {item.follow && (
          <TouchableOpacity style={styles.followBtn}>
            <Text style={styles.followText}>+ Follow</Text>
          </TouchableOpacity>
        )}

      </View>

    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
             <View >

      <View style={styles.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Image source={require('../../assets/png/backAerro.png')} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notification</Text>

        <Image source={require('../../assets/png/menu.png')} />
      </View>

      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

    </View>
    </SafeAreaView>
  );
}

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  sectionTitle: {
    marginTop: 15,
    marginLeft: 15,
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#E9EDF1',
    marginHorizontal: 15,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  content: {
    flex: 1,
    marginLeft: 10,
  },

  text: {
    fontSize: 14,
    color: '#333',
  },

  bold: {
    fontWeight: 'bold',
  },

  time: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },

  followBtn: {
    borderWidth: 1,
    borderColor: '#2979FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  followText: {
    color: '#2979FF',
    fontWeight: '600',
  },
});