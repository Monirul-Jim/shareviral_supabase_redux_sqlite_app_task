import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { fetchLocalTasks, syncTasks, toggleTaskComplete } from '../redux/slices/taskSlice';
import { fetchLocalCategories, syncCategories } from '../redux/slices/categorySlice';
import { useFilteredTasks } from '../hooks/useFilteredTasks';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { router } from 'expo-router';
import { Task } from '../types/task';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

export default function TaskListScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const isOnline = useNetworkStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'done'>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'created_at'>('created_at');

  useEffect(() => {
    dispatch(fetchLocalCategories());
    dispatch(fetchLocalTasks());
  }, [dispatch]);

  useEffect(() => {
    if (isOnline) {
      dispatch(syncCategories());
      dispatch(syncTasks());
    }
  }, [isOnline, dispatch]);

  const { filteredTasks, isRefreshing, lastRefreshed, error } = useFilteredTasks({
    categoryId: null,
    status: statusFilter,
    sortBy,
    searchQuery,
  });

  const renderItem = ({ item, index }: { item: Task; index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 50).springify()}
      layout={Layout.springify()}
    >
      <TouchableOpacity
        className={`flex-row items-center bg-white rounded-2xl p-4 mb-3 shadow-sm border border-slate-100 ${item.status === 'done' ? 'opacity-70' : ''}`}
        activeOpacity={0.8}
        onPress={() => router.push(`/task/${item.id}`)}
      >
        <TouchableOpacity
          className={`w-7 h-7 rounded-full border-2 mr-4 items-center justify-center ${item.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-transparent'}`}
          onPress={() => dispatch(toggleTaskComplete({ id: item.id, status: item.status === 'open' ? 'done' : 'open' }))}
        >
          {item.status === 'done' && <Text className="text-white font-bold text-base">✓</Text>}
        </TouchableOpacity>

        <View className="flex-1">
          <Text className={`text-lg font-bold text-slate-800 mb-1 ${item.status === 'done' ? 'line-through text-slate-400' : ''}`}>
            {item.title}
          </Text>
          <View className="flex-row items-center">
            {item.is_starred && <Text className="text-xs mr-1">⭐</Text>}
            <Text className="text-sm text-slate-500 font-medium">
              {item.due_date ? `Due ${new Date(item.due_date).toLocaleDateString()}` : 'No Due Date'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      {!isOnline && (
        <View className="bg-red-500 p-2 items-center">
          <Text className="text-white font-semibold text-xs">No Connection • Reading Local Data</Text>
        </View>
      )}

      <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
        <View>
          <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">My Tasks</Text>
          {lastRefreshed && (
            <Text className="text-xs text-slate-500 mt-1">Synced: {new Date(lastRefreshed).toLocaleTimeString()}</Text>
          )}
        </View>
        {isRefreshing && <ActivityIndicator size="small" color="#4F46E5" />}
      </View>
      
      {error && <Text className="text-red-500 mx-6 mb-2 text-xs">{error}</Text>}

      <View className="px-6 mb-4">
        <TextInput
          className="bg-white rounded-2xl p-4 text-base text-slate-900 shadow-sm border border-slate-100"
          placeholder="Search your tasks..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View className="flex-row justify-between items-center px-6 mb-5">
        <View className="flex-row gap-2">
          {(['all', 'open', 'done'] as const).map(s => (
            <TouchableOpacity
              key={s}
              className={`px-4 py-2 rounded-full border ${statusFilter === s ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'}`}
              onPress={() => setStatusFilter(s)}
            >
              <Text className={`text-sm font-semibold ${statusFilter === s ? 'text-white' : 'text-slate-500'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          className="px-3 py-2 rounded-full bg-slate-100"
          onPress={() => setSortBy(prev => prev === 'created_at' ? 'due_date' : 'created_at')}
        >
          <Text className="text-xs font-semibold text-slate-600">
            Sort: {sortBy === 'created_at' ? 'Newest' : 'Due Date'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        className="absolute bottom-8 right-8 bg-indigo-600 w-16 h-16 rounded-full justify-center items-center shadow-lg"
        activeOpacity={0.9}
        onPress={() => router.push('/task/new')}
      >
        <Text className="text-white text-3xl font-light -mt-1">+</Text>
      </TouchableOpacity>
    </View>
  );
}
