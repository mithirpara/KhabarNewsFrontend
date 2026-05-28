import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    image: require('../../assets/png/Banner1.png'),

    title: 'Lorem Ipsum is simply \ndummy',
    description:
      'Lorem Ipsum is simply dummy text of \nthe printing and typesetting industry.',
  },
  {
    id: '2',
    image: require('../../assets/png/Banner2.png'),
    title: 'Lorem Ipsum is simply \ndummy',
    description:
      'Lorem Ipsum is simply dummy text of \nthe printing and typesetting industry.',
  },
  {
    id: '3',
    image: require('../../assets/png/Banner3.png'),
    title: 'Lorem Ipsum is simply \ndummy',
    description:
      'Lorem Ipsum is simply dummy text of \nthe printing and typesetting industry.',
  },
];

const BannerScreen1 = ({ navigation }: any) => {
  const { colors } = useAppTheme();
  const flatListRef = useRef<any>(null);
  const [index, setIndex] = useState(0);

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: index + 1,
        animated: true,
      });
    } else {
      navigation.replace('LoginScreen'); // last screen
    }
  };

  const goBack = () => {
    if (index > 0) {
      flatListRef.current?.scrollToIndex({
        index: index - 1,
        animated: true,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        getItemLayout={(data, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        onMomentumScrollEnd={e => {
          const slideIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(slideIndex);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image} />
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.desc, { color: colors.mutedText }]}>{item.description}</Text>
          </View>
        )}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between',alignItems:'center',margin:20 }}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, index === i && styles.activeDot]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          {index > 0 ? (
            <TouchableOpacity onPress={goBack}>
              <Text style={[styles.back, { color: colors.mutedText }]}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
            <Text style={styles.nextText}>
              {index === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default BannerScreen1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width,
  },
  image: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 20,
    marginLeft:20,
  },
  desc: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
    marginLeft:20,
    fontWeight:"500",
  },
  dots: {
    flexDirection: 'row',
  
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#2563eb',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',    
  },
  back: {
    color: '#999',
    fontSize: 14,
    paddingHorizontal: 10,
    width: 55,
  },
  nextBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 8,
    width: 100,
  },
  nextText: {
    color: '#fff',
    fontSize: 14,
    width: '100%',
    textAlign: 'center',
  },
});
