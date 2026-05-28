import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addComment, likeComment } from '../../redux/Slices/commentSlices';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getThemeColors } from '../../constants/theme';

const CommentScreen = (props: any) => {
  const [text, setText] = useState('');
  const data = useSelector((state: any) => state.comments.comments);
  const themeMode = useSelector((state: any) => state.theme.mode);
  const colors = getThemeColors(themeMode);
  const dispatch = useDispatch();

  const handleSend = () => {
    if (text.trim() === '') return;

    const newComment = {
      id: Date.now().toString(),
      image: require('../../assets/png/comment2.png'),
      name: 'You',
      avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
      text: text,
      time: 'now',
      likes: 0,
      replies: [],
    };

    dispatch(addComment(newComment));
    setText('');
  };

  const renderReply = (reply: any) => (
    <View
      key={reply.id}
      style={{ flexDirection: 'row', marginTop: 10, marginLeft: 55 }}
    >
      <Image
        source={{ uri: reply.avatar }}
        style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }}
      />

      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600', color: colors.text }}>{reply.name}</Text>
        <Text style={{ color: colors.text }}>{reply.text}</Text>

        <View style={{ flexDirection: 'row', marginTop: 5 }}>
          <Text style={styles.meta}>{reply.time}</Text>
          <Text style={styles.meta}> ❤️ {reply.likes} likes</Text>
          <Text style={styles.meta}> ↩ reply</Text>
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }: any) => (
    <View style={{ flexDirection: 'row', paddingVertical: 12 }}>
      <Image
        source={{ uri: item.avatar }}
        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
      />

      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '700', color: colors.text }}>{item.name}</Text>
        <Text style={{ color: colors.text }}>{item.text}</Text>

        <View style={{ flexDirection: 'row', marginTop: 5 }}>
          <Text style={styles.meta}>{item.time}</Text>

          <TouchableOpacity onPress={() => dispatch(likeComment(item.id))}>
            <Text style={styles.meta}> 🤍 {item.likes} likes</Text>
          </TouchableOpacity>

          <Text style={styles.meta}> ↩ reply</Text>
        </View>

        {item.replies?.length > 0 && renderReply(item.replies[0])}

        {item.replies?.length > 1 && (
          <Text style={styles.seeMore}>See more ({item.replies.length})</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}
        >
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Image source={require('../../assets/png/backAerro.png')} style={{ tintColor: colors.icon }} />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              textAlign: 'center',
              flex: 1,
              color: colors.text,
            }}
          >
            Comment
          </Text>
        </View>
        <View style={{ justifyContent: 'space-between', flex: 1 }}>
          <View>
            <FlatList
              data={data}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={{
                padding: 15,
                paddingBottom: 100,
              }}
            />
          </View>
          <View>
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                placeholder="Type your comment"
                value={text}
                onChangeText={setText}
                placeholderTextColor={'#A0A3BD'}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                <Image source={require('../../assets/png/sendIcon.png')} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  meta: {
    color: '#888',
    fontSize: 12,
    marginRight: 10,
  },
  seeMore: {
    marginLeft: 55,
    marginTop: 5,
    color: '#666',
  },
  inputBox: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    position: 'absolute',
    alignItems: 'center',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: -20,
    marginBottom: 5,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 20,
    height: 50,
    color: '#333',
    borderWidth: 1,
    borderColor: '#000',
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: '#1877F2',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommentScreen;
