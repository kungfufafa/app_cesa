import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { MenuItem } from '@/components/ui/MenuItem';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive", 
          onPress: async () => {
             await signOut();
          } 
        }
      ]
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-black" edges={['top']}>
      <ScrollView className="flex-1">
        <View className="p-6 bg-white dark:bg-slate-900 mb-6 items-center border-b border-slate-200 dark:border-slate-800">
           <View className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mb-4">
              <Text className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                {getInitials(user?.name)}
              </Text>
           </View>
           <Text className="text-xl font-bold text-slate-900 dark:text-white mb-1">
             {user?.name || 'User Name'}
           </Text>
           <Text className="text-slate-500 dark:text-slate-400 text-sm mb-1">
             {user?.email || 'email@example.com'}
           </Text>
           <Text className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider">
             ID: {user?.id || '---'}
           </Text>
        </View>

        <View className="mb-6 border-t border-slate-200 dark:border-slate-800">
          <MenuItem 
            icon="person.fill" 
            title="Edit Profile" 
            onPress={() => Alert.alert('Coming Soon', 'This feature is under development')}
          />
          <MenuItem 
            icon="gear" 
            title="Settings" 
            onPress={() => Alert.alert('Coming Soon', 'This feature is under development')}
          />
          <MenuItem 
            icon="questionmark.circle" 
            title="Help & Support" 
            onPress={() => Alert.alert('Coming Soon', 'This feature is under development')}
          />
        </View>

        <View className="border-t border-slate-200 dark:border-slate-800">
          <MenuItem 
            icon="rectangle.portrait.and.arrow.right" 
            title="Sign Out" 
            onPress={handleSignOut}
            destructive
            showChevron={false}
          />
        </View>
        
        <Text className="text-center text-slate-400 text-xs mt-8 mb-8">
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
