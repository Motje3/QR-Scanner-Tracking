// Profile.tsx
import { View, Text, Image, TouchableOpacity, ScrollView, ImageSourcePropType } from 'react-native';
import React from 'react';
import { icons } from '@/constants/icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { wp, hp } from '../utils/responsive';

const fallbackImage = require('../../assets/images/default-profile.png');

const Profile = () => {
  const router = useRouter();
  const { darkMode, username, email, profileImage, accentColor } = useApp();
  const { logout } = useAuth();

  const theme = {
    background: darkMode ? '#0f0D23' : '#ffffff',
    text: darkMode ? '#ffffff' : '#0f0D23',
    secondaryText: darkMode ? '#9CA3AF' : '#6B7280',
    borderColor: darkMode ? '#2D2D2D' : '#E5E7EB',
  };

  const handleEditProfile = () => {
    router.push('/profile/editprofile');
  };

  const handleChangePassword = () => {
    router.push('/profile/changepassword');
  };

  const handleSettings = () => {
    router.push('/profile/appsettings');
  };

  const handleLogout = async () => {
    await logout();
  };

  const options = [
    { title: 'Profiel bewerken', icon: icons.edit, action: handleEditProfile },
    { title: 'Wachtwoord aanpassen', icon: icons.lock, action: handleChangePassword },
    { title: 'App instellingen', icon: icons.setting, action: handleSettings },
    { title: 'Uitloggen', icon: icons.logout, color: '#EF4444', action: handleLogout },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Top Header */}
      <View
        style={{
          backgroundColor: accentColor,
          height: hp(9),
          borderBottomLeftRadius: wp(8),
          borderBottomRightRadius: wp(8),
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: hp(2),
        }}
      >
        <Text style={{ color: '#fff', fontSize: wp(5), fontWeight: 'bold', marginTop: hp(2) }}>
          Profiel
        </Text>
      </View>

      {/* Profile Info */}
      <View style={{ alignItems: 'center', marginTop: hp(5) }}>
        <Image
          source={profileImage?.trim() ? { uri: profileImage } : fallbackImage}
          style={{ width: wp(24), height: wp(24), borderRadius: wp(12) }}
        />
        <Text style={{ color: theme.text, fontSize: wp(4.5), fontWeight: 'bold', marginTop: hp(1) }}>
          {username}
        </Text>
        <Text style={{ color: theme.secondaryText, fontSize: wp(3.5) }}>{email}</Text>
      </View>

      {/* Options */}
      <ScrollView style={{ marginTop: hp(3), paddingHorizontal: wp(6) }}>
        {options.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={item.action}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: hp(2),
              borderBottomWidth: 1,
              borderBottomColor: theme.borderColor,
            }}
          >
            <Image
              source={item.icon as ImageSourcePropType}
              style={{
                width: wp(6),
                height: wp(6),
                tintColor: accentColor,
                marginRight: wp(3),
              }}
            />
            <Text style={{ color: item.color || theme.text, fontSize: wp(4) }}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Profile;
