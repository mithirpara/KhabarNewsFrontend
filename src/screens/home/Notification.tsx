import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import RemoteImage from '../../component/RemoteImage';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  getNotifications,
  NotificationItem,
} from '../../services/notificationApi';
import {
  getSavedFollowIds,
  removeFollowId,
  saveFollowId,
} from '../../services/followStorage';
import { sendFollowNotification } from '../../services/pushNotificationService';

const avatarFallback = require('../../assets/png/BCClogo.png');
const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
});

const getStartOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatNotificationSectionDate = (value?: string) => {
  const notificationDate = value ? new Date(value) : new Date();

  if (Number.isNaN(notificationDate.getTime())) {
    return '';
  }

  const today = getStartOfDay(new Date());
  const itemDay = getStartOfDay(notificationDate);
  const diffDays = Math.round(
    (today.getTime() - itemDay.getTime()) / (24 * 60 * 60 * 1000),
  );
  const formattedDate = monthFormatter.format(notificationDate);

  if (diffDays === 0) {
    return `Today, ${formattedDate}`;
  }

  if (diffDays === 1) {
    return `Yesterday, ${formattedDate}`;
  }

  return formattedDate;
};

const fallbackNotifications: NotificationItem[] = [
  {
    id: '1',
    name: 'BBC News',
    message: 'has posted new europe news "Ukraine\'s President Zele..."',
    time: '15m ago',
    createdAt: new Date().toISOString(),
    follow: false,
  },
  {
    id: '2',
    name: 'Modelyn Saris',
    message: 'is now following you',
    time: '1h ago',
    createdAt: new Date().toISOString(),
    follow: true,
  },
  {
    id: '3',
    name: 'Omar Merditz',
    message: 'comment to your news "Minting Your First NFT: A..."',
    time: '1h ago',
    createdAt: new Date().toISOString(),
    follow: false,
  },
  {
    id: '4',
    name: 'Marley Botosh',
    message: 'is now following you',
    time: '1 Day ago',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    follow: true,
  },
  {
    id: '5',
    name: 'CNN',
    message: 'has posted new travel news "Her train broke down. Her pho..."',
    time: '1 Day ago',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    follow: false,
  },
  {
    id: '6',
    name: 'USA Today',
    message: 'likes your news "Wind power produced more electricity..."',
    time: '1 Day ago',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    follow: false,
  },
  {
    id: '7',
    name: 'Travel Daily',
    message: 'comment to your news "Her phone died. And then..."',
    time: '2 Days ago',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    follow: true,
  },
  {
    id: '8',
    name: 'Health News',
    message: 'has posted new health news "Simple habits for a..."',
    time: '2 Days ago',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    follow: false,
  },
  {
    id: '9',
    name: 'James Wilson',
    message: 'is now following you',
    time: '3 Days ago',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    follow: true,
  },
  {
    id: '10',
    name: 'BBC News',
    message: 'has posted new politics news "Leaders meet today..."',
    time: '3 Days ago',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    follow: true,
  },
];

const Notification = (props: any) => {
  const { colors } = useAppTheme();
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(fallbackNotifications);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const getNotificationFollowId = (item: NotificationItem) =>
    String(item.authorId || item.sourceId || item.userId || item.name || item.id);

  const loadFollowedIds = useCallback(async () => {
    try {
      const savedIds = await getSavedFollowIds();
      setFollowedIds(savedIds);
    } catch (error) {
      console.warn('Failed to load notification follow state', error);
    }
  }, []);

  const loadNotifications = async () => {
    try {
      setRefreshing(true);
      const data = await getNotifications(10);
      setNotifications(data.length > 0 ? data.slice(0, 10) : fallbackNotifications);
    } catch (error) {
      console.log('Notification API error:', error);
      setNotifications(fallbackNotifications);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFollowedIds();
    }, [loadFollowedIds]),
  );

  const toggleFollow = async (item: NotificationItem) => {
    const followId = getNotificationFollowId(item);
    const willFollow = !followedIds.includes(followId);

    setFollowedIds(previousIds =>
      willFollow
        ? Array.from(new Set([...previousIds, followId]))
        : previousIds.filter(id => id !== followId),
    );

    try {
      if (willFollow) {
        await saveFollowId(followId);
        await sendFollowNotification(followId);
      } else {
        await removeFollowId(followId);
      }
    } catch (error: any) {
      setFollowedIds(previousIds =>
        willFollow
          ? previousIds.filter(id => id !== followId)
          : Array.from(new Set([...previousIds, followId])),
      );
      Alert.alert(
        'Notification failed',
        error?.message || 'Follow ho gaya, lekin notification send nahi hui.',
      );
    }
  };

  const getSectionTitle = (item: NotificationItem, index: number) => {
    const itemSectionTitle = item.sectionTitle || formatNotificationSectionDate(item.createdAt || item.date);
    const previousItem = notifications[index - 1];
    const previousSectionTitle =
      previousItem?.sectionTitle ||
      formatNotificationSectionDate(previousItem?.createdAt || previousItem?.date);

    if (itemSectionTitle) {
      return index === 0 || previousSectionTitle !== itemSectionTitle
        ? itemSectionTitle
        : '';
    }

    if (item.type && (index === 0 || notifications[index - 1]?.type !== item.type)) {
      const typeDate =
        item.type === 'yesterday'
          ? new Date(Date.now() - 24 * 60 * 60 * 1000)
          : new Date();

      return formatNotificationSectionDate(typeDate.toISOString());
    }

    return '';
  };

  const renderItem = ({ item, index }: { item: NotificationItem; index: number }) => {
    const sectionTitle = getSectionTitle(item, index);
    const isFollowing = followedIds.includes(getNotificationFollowId(item));

    return (
      <View>
        {!!sectionTitle && (
          <Text style={[styles.sectionTitle, { color: colors.mutedText }]}>
            {sectionTitle}
          </Text>
        )}

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <RemoteImage
            uri={item.avatar || item.image}
            fallbackSource={avatarFallback}
            style={styles.avatar}
          />

          <View style={styles.content}>
            <Text style={[styles.text, { color: colors.text }]}>
              <Text style={styles.bold}>{item.name}</Text> {item.message}
            </Text>

            <Text style={[styles.time, { color: colors.mutedText }]}>
              {item.time}
            </Text>
          </View>

          {item.follow && (
            <TouchableOpacity
              onPress={() => toggleFollow(item)}
              style={[
                styles.followBtn,
                isFollowing && styles.followingBtn,
              ]}
            >
              <Text
                style={[
                  styles.followText,
                  isFollowing && styles.followingText,
                ]}
              >
                {isFollowing ? 'Following' : '+ Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mainView}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <Image
              source={require('../../assets/png/backAerro.png')}
              style={{ tintColor: colors.icon }}
            />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Notification
          </Text>

          <Image
            source={require('../../assets/png/menu.png')}
            style={{ tintColor: colors.icon }}
          />
        </View>

        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadNotifications}
              tintColor={colors.icon}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  mainView: {
    flex: 1,
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

  followingBtn: {
    backgroundColor: '#2979FF',
  },

  followText: {
    color: '#2979FF',
    fontWeight: '600',
  },

  followingText: {
    color: '#fff',
  },
});
