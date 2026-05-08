import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NewsDetails = (props: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => props.navigation.goBack('BookmarkScreen')}
          >
            <Image
              source={require('../../assets/png/backAerro.png')}
              style={styles.icon}
            />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <Image
              source={require('../../assets/png/shere.png')}
              style={styles.icon}
            />
            <Image
              source={require('../../assets/png/menu.png')}
              style={styles.icon}
            />
          </View>
        </View>

        <View style={styles.authorContainer}>
          <Image
            source={require('../../assets/png/BCClogo.png')}
            style={styles.authorImage}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.authorName}>BBC News</Text>
            <Text style={styles.time}>14m ago</Text>
          </View>

          <TouchableOpacity style={styles.followBtn}>
            <Text style={styles.followText}>Following</Text>
          </TouchableOpacity>
        </View>

        <Image
          source={require('../../assets/png/NewsImages.png')}
          style={styles.newsImage}
        />

        <Text style={styles.category}>Europe</Text>

        <Text style={styles.title}>
          Ukraine's President Zelensky to BBC: Blood money being paid for
          Russian oil
        </Text>

        <Text style={styles.description}>
          Ukrainian President Volodymyr Zelensky has accused European countries
          that continue to buy Russian oil of "earning their money in other
          people's blood". 
        </Text>

        <Text style={styles.description}>
          In an interview with the BBC, President Zelensky
          singled out Germany and Hungary, accusing them of blocking efforts to
          embargo energy sales, from which Russia stands to make up to £250bn
          ($326bn) this year. 
        </Text>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.action}>
          <Image
            source={require('../../assets/png/blankLike.png')}
            style={styles.heart}
          />
          <Text style={styles.count}>24.5K</Text>

          <TouchableOpacity onPress={() => props.navigation.navigate("CommentScreen")}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              marginLeft: 20,
            }}
          >
            <Image
              source={require('../../assets/png/Comment.png')}
              style={styles.comment}
            />
            <Text style={styles.count}>1K</Text>
          </TouchableOpacity>
        </View>

        <Image
          source={require('../../assets/png/Bookmark.png')}
          style={styles.bookmark}
        />
      </View>
    </SafeAreaView>
  );
};

export default NewsDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: 15,
  },

  headerRight: {
    flexDirection: 'row',
    gap: 15,
  },

  icon: {
    fontSize: 20,
  },

  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
    marginTop: 15,
  },

  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },

  time: {
    color: 'gray',
  },

  followBtn: {
    backgroundColor: '#2979ff',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 6,
  },

  followText: {
    color: '#fff',
    fontWeight: '600',
  },

  newsImage: {
    width: '92%',
    height: 220,
    alignSelf: 'center',
    borderRadius: 10,
    marginVertical: 10,
  },

  category: {
    color: 'gray',
    marginHorizontal: 15,
    marginTop: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 15,
    marginVertical: 8,
  },

  description: {
    fontSize: 15,
    color: '#555',
    marginHorizontal: 15,
    marginBottom: 10,
    lineHeight: 22,
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#eee',
    marginHorizontal: 10,
  },

  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  heart: {
    fontSize: 18,
  },

  comment: {
    fontSize: 18,
  },

  count: {
    fontSize: 14,
    color: '#050505',
  },

  bookmark: {
    fontSize: 20,
  },
});
