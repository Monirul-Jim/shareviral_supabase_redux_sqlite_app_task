import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { addCategory } from '../redux/slices/categorySlice';
import { Category } from '../types/task';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

export default function CategoriesScreen() {
  const { categories, loading, error } = useSelector((state: RootState) => state.categories as any);
  const dispatch = useDispatch<AppDispatch>();
  const isOnline = useNetworkStatus();

  const [newCatName, setNewCatName] = useState('');

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    dispatch(addCategory({ name: newCatName.trim(), color: '#4F46E5' })); // Default indigo
    setNewCatName('');
  };

  const renderItem = ({ item, index }: { item: Category; index: number }) => (
    <Animated.View 
      entering={FadeInUp.delay(index * 50).springify()}
      layout={Layout.springify()}
    >
      <View className="flex-row items-center bg-white p-4 mb-3 rounded-2xl shadow-sm border border-slate-100">
        <View 
          className="w-4 h-4 rounded-full mr-4"
          style={{ backgroundColor: item.color || '#CBD5E1' }} 
        />
        <Text className="text-lg font-semibold text-slate-800">{item.name}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">Categories</Text>
      </View>
      
      {!isOnline && (
        <View className="bg-red-50 mx-6 mb-4 p-3 rounded-xl border border-red-100">
          <Text className="text-red-500 font-semibold text-xs">Offline - You cannot create categories right now.</Text>
        </View>
      )}

      {error && <Text className="text-red-500 mx-6 mb-4 text-xs">{error}</Text>}

      <View className="flex-row px-6 mb-6">
        <TextInput
          className="flex-1 bg-white rounded-2xl p-4 text-base text-slate-900 shadow-sm border border-slate-100 mr-3"
          placeholder="New category name..."
          placeholderTextColor="#94A3B8"
          value={newCatName}
          onChangeText={setNewCatName}
        />
        <TouchableOpacity
          className={`justify-center items-center px-6 rounded-2xl shadow-sm ${(!isOnline || loading || !newCatName.trim()) ? 'bg-slate-300' : 'bg-indigo-600'}`}
          onPress={handleAddCategory}
          disabled={!isOnline || loading || !newCatName.trim()}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Add</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
