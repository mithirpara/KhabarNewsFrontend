import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { updateProfile } from '../../redux/Slices/editProfileSlice';
import { updateProfileData } from '../../redux/Slices/profileSlice';
import { saveProfile } from '../../services/profileApi';

type FormErrors = {
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  website: string;
};

const EditProfile = (props: any) => {
  const editData = useSelector((state: any) => state.editProfile);
  const profileData = useSelector((state: any) => state.profile);
  const authData = useSelector((state: any) => state.auth);

  const initialUsername = editData.username || profileData.username || '';
  const initialFullName = editData.fullName || profileData.fullName || '';
  const initialEmail = editData.email || profileData.email || '';
  const initialPhoneNumber = editData.phoneNumber || profileData.phoneNumber || '';
  const initialBio = editData.bio || profileData.bio || '';
  const initialWebsite = editData.website || profileData.website || '';
  const initialImage = editData.image || profileData.image || null;

  const [visible, setVisible] = useState(false);
  const [username, setUsername] = useState(initialUsername);
  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [bio, setBio] = useState(initialBio);
  const [website, setWebsite] = useState(initialWebsite);
  const [image, setImage] = useState<string | number | null>(initialImage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<FormErrors>({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    website: '',
  });
  const dispatch = useDispatch();
  const displayImageSource: ImageSourcePropType =
    typeof image === 'string' && image
      ? { uri: image }
      : image || require('../../assets/png/profile-1.png');

  const validateUsername = (value: string) => {
    if (!value.trim()) {
      return 'Username required';
    }
    return '';
  };

  const validateFullName = (value: string) => {
    if (!value.trim()) {
      return 'Full name required';
    }
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value) return 'Email required';

    if (!/^\S+@\S+\.\S+$/.test(value)) {
      return 'Invalid email';
    }

    return '';
  };

  const validatePhone = (value: string) => {
    if (!value) return 'Phone required';

    if (value.length !== 10) {
      return 'Enter 10 digit number';
    }

    return '';
  };

  const validateBio = (value: string) => {
    if (!value.trim()) {
      return 'Bio required';
    }
    return '';
  };

  const validateWebsite = (value: string) => {
    if (value && !/^https?:\/\/.+\..+/.test(value)) {
      return 'Invalid URL';
    }
    return '';
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
    const trimmedBio = bio.trim();
    const trimmedWebsite = website.trim();

    const newErrors: FormErrors = {
      username: validateUsername(trimmedUsername),
      fullName: validateFullName(trimmedFullName),
      email: validateEmail(trimmedEmail),
      phoneNumber: validatePhone(cleanedPhoneNumber),
      bio: validateBio(trimmedBio),
      website: validateWebsite(trimmedWebsite),
    };

    setError(newErrors);

    const isValid = Object.values(newErrors).every(value => value === '');

    if (!isValid) {
      Alert.alert('Invalid details');
      return;
    }

    try {
      setIsSubmitting(true);

      const currentUser = auth().currentUser;
      const userId = currentUser?.uid || authData?.userId;

      if (!userId) {
        Alert.alert('Login required', 'Please log in before updating your profile.');
        return;
      }

      const previousRemoteImage =
        typeof editData?.image === 'string' && editData.image
          ? editData.image
          : typeof profileData?.image === 'string' && profileData.image
            ? profileData.image
            : '';

      let remoteImageUrl = previousRemoteImage;
      let selectedImageValue: string | number =
        typeof image === 'string' && image
          ? image
          : previousRemoteImage || require('../../assets/png/profile-1.png');

      if (typeof image === 'string' && image) {
        if (image.startsWith('http')) {
          remoteImageUrl = image;
        } else if (currentUser?.uid) {
          const uploadedUrl = await uploadImageToFirebase(image);
          if (uploadedUrl) {
            remoteImageUrl = uploadedUrl;
            selectedImageValue = uploadedUrl;
          }
        }
      }

      const updatedProfile = {
        username: trimmedUsername,
        fullName: trimmedFullName,
        email: trimmedEmail,
        phoneNumber: cleanedPhoneNumber,
        bio: trimmedBio,
        website: trimmedWebsite,
        image: selectedImageValue,
      };

      const response = await saveProfile({
        userId,
        username: trimmedUsername,
        fullName: trimmedFullName,
        email: trimmedEmail,
        phoneNumber: cleanedPhoneNumber,
        bio: trimmedBio,
        website: trimmedWebsite,
        profileImage:
          typeof selectedImageValue === 'string' ? selectedImageValue : '',
      });

      const savedProfile = response?.data || {};
      const savedImage = savedProfile.profileImage || updatedProfile.image;

      const syncedProfile = {
        ...updatedProfile,
        username: savedProfile.username || updatedProfile.username,
        fullName: savedProfile.fullName || updatedProfile.fullName,
        email: savedProfile.email || updatedProfile.email,
        phoneNumber: savedProfile.phoneNumber || updatedProfile.phoneNumber,
        bio: savedProfile.bio || updatedProfile.bio,
        website: savedProfile.website || updatedProfile.website,
        image: savedImage,
      };

      dispatch(updateProfile(syncedProfile));
      dispatch(updateProfileData(syncedProfile));

      Alert.alert('Profile updated', response?.message || 'Your profile has been saved successfully.', [
        {
          text: 'OK',
          onPress: () => props.navigation.goBack(),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Update failed', err?.message || 'Something went wrong while saving your profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImageToFirebase = async (uri: string) => {
    if (!uri) return null;

    const userId = auth().currentUser?.uid || authData?.userId;

    if (!userId) {
      return null;
    }

    try {
      const reference = storage().ref(`profileImages/${userId}.jpg`);
      await reference.putFile(uri);
      return await reference.getDownloadURL();
    } catch (uploadError) {
      console.log('Upload Error:', uploadError);
      return null;
    }
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
      },
      response => {
        if (response.didCancel || response.errorCode) return;

        const uri = response.assets?.[0]?.uri;
        if (uri) setImage(uri);
        setVisible(false);
      },
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
      },
      response => {
        if (response.didCancel || response.errorCode) return;

        const uri = response.assets?.[0]?.uri;
        if (uri) setImage(uri);
        setVisible(false);
      },
    );
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (permissionError) {
        return false;
      }
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <Image source={require('../../assets/png/Wrong.png')} />
            </TouchableOpacity>
            <Text>Edit Profile</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#1877F2" />
              ) : (
                <Image source={require('../../assets/png/right.png')} />
              )}
            </TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.profile}>
              <View style={styles.imageView}>
                <Image source={displayImageSource} style={styles.image} />
                <TouchableOpacity style={styles.avtar} onPress={() => setVisible(true)}>
                  <Image source={require('../../assets/png/CameraIcon.png')} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ gap: 5, marginTop: 20, marginBottom: 50 }}>
              <Text style={styles.title}>Username</Text>
              <TextInput
                placeholder=""
                placeholderTextColor={'#4E4B66'}
                style={styles.textInput}
                value={username}
                onChangeText={setUsername}
              />
              {error.username ? <Text style={styles.error}>{error.username}</Text> : null}

              <Text style={styles.title}>Full Name</Text>
              <TextInput
                placeholder=""
                placeholderTextColor={'#4E4B66'}
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
              />
              {error.fullName ? <Text style={styles.error}>{error.fullName}</Text> : null}

              <Text style={styles.title}>Email Address</Text>
              <TextInput
                placeholder=""
                placeholderTextColor={'#4E4B66'}
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
              />
              {error.email ? <Text style={styles.error}>{error.email}</Text> : null}

              <Text style={styles.title}>Phone Number</Text>
              <TextInput
                placeholder=""
                placeholderTextColor={'#4E4B66'}
                keyboardType="phone-pad"
                style={styles.textInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
              {error.phoneNumber ? <Text style={styles.error}>{error.phoneNumber}</Text> : null}

              <Text style={styles.title}>Bio</Text>
              <TextInput
                placeholder=""
                placeholderTextColor={'#4E4B66'}
                style={styles.textInput}
                value={bio}
                onChangeText={setBio}
              />
              {error.bio ? <Text style={styles.error}>{error.bio}</Text> : null}

              <Text style={styles.title}>Website</Text>
              <TextInput
                placeholder=""
                placeholderTextColor={'#4E4B66'}
                style={styles.website}
                value={website}
                onChangeText={setWebsite}
              />
              {error.website ? <Text style={styles.websiteError}>{error.website}</Text> : null}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      <Modal transparent visible={visible} animationType="slide">
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.box}>
              <TouchableOpacity onPress={openCamera}>
                <Text style={styles.option}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={openGallery} style={{ marginBottom: 30 }}>
                <Text style={styles.option}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setVisible(false)} style={styles.cancle}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageView: {
    height: 125,
    width: 125,
    borderWidth: 1,
    backgroundColor: '#EEF1F4',
    borderColor: '#EEF1F4',
    borderRadius: 63,
    alignItems: 'center',
  },
  image: { height: 125, width: 125, borderRadius: 63 },
  avtar: {
    backgroundColor: '#1877F2',
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    position: 'absolute',
    bottom: 10,
    right: 2,
  },
  profile: { alignItems: 'center', marginTop: 50 },
  textInput: { borderWidth: 1, borderRadius: 8, color: '#4E4B66' },
  title: { color: '#4E4B66', marginTop: 15 },
  website: {
    borderWidth: 1,
    borderRadius: 8,
    color: '#4E4B66',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  box: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  option: {
    fontSize: 16,
    paddingVertical: 15,
  },
  cancle: {
    borderWidth: 1,
    borderColor: '#ff0303',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff0303',
  },
  cancelText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
  websiteError: {
    color: 'red',
    fontSize: 12,
  },
});



