import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { addTask, updateTask, deleteTask, toggleTaskStarLocal } from '../../redux/slices/taskSlice';
import { addCategory } from '../../redux/slices/categorySlice';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { Task, Category } from '../../types/task';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const dispatch = useDispatch<AppDispatch>();
  const isOnline = useNetworkStatus();

  const taskState = useSelector((state: RootState) => state.tasks as any);
  const tasks = taskState?.tasks || [];
  const categoryState = useSelector((state: RootState) => state.categories as any);
  const categories = categoryState?.categories || [];

  const existingTask = tasks.find((t: Task) => t.id === id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const resultAction = await dispatch(addCategory({
        name: newCategoryName.trim(),
        color: '#4F46E5', // default color
      })).unwrap();
      setCategoryId(resultAction.id);
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (err: any) {
      Alert.alert('Error', err.toString());
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (existingTask && !isNew) {
        setTitle(existingTask.title);
        setDescription(existingTask.description || '');
        setCategoryId(existingTask.category_id);
        setIsStarred(existingTask.is_starred || false);
      } else if (isNew) {
        setTitle('');
        setDescription('');
        setCategoryId(null);
        setIsStarred(false);
      }
    }, [existingTask, isNew])
  );

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    try {
      if (isNew) {
        await dispatch(addTask({
          title,
          description,
          category_id: categoryId,
          status: 'open',
          due_date: new Date(Date.now() + 86400000).toISOString() // Default 1 day from now
        })).unwrap();
        Alert.alert('Success', 'Task added successfully!', [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        await dispatch(updateTask({
          id,
          title,
          description,
          category_id: categoryId,
        })).unwrap();

        if (existingTask?.is_starred !== isStarred) {
          await dispatch(toggleTaskStarLocal({ id, isStarred })).unwrap();
        }
        Alert.alert('Success', 'Task updated successfully!', [{ text: 'OK', onPress: () => router.back() }]);
      }
    } catch (err: any) {
      Alert.alert('Error', err.toString());
    }
  };

  const handleDelete = async () => {
    if (isNew) return;
    try {
      await dispatch(deleteTask(id)).unwrap();
      router.back();
    } catch (err: any) {
      Alert.alert('Delete Failed', err.toString());
    }
  };

  const handleToggleStar = () => {
    const newVal = !isStarred;
    setIsStarred(newVal);
    if (!isNew) {
      dispatch(toggleTaskStarLocal({ id, isStarred: newVal }));
    }
  };

  return (
    <Animated.View entering={FadeIn} className="flex-1 bg-slate-50 px-6 pt-6">
      
      <Text className="text-sm font-bold text-slate-600 mb-2 uppercase tracking-widest">Title</Text>
      <TextInput
        className="bg-white rounded-2xl p-4 text-base text-slate-900 border border-slate-200 shadow-sm mb-6"
        value={title}
        onChangeText={setTitle}
        placeholder="What needs to be done?"
        placeholderTextColor="#94A3B8"
      />

      <Text className="text-sm font-bold text-slate-600 mb-2 uppercase tracking-widest">Description</Text>
      <TextInput
        className="bg-white rounded-2xl p-4 text-base text-slate-900 border border-slate-200 shadow-sm h-32 mb-6"
        value={description}
        onChangeText={setDescription}
        multiline
        textAlignVertical="top"
        placeholder="Add some details..."
        placeholderTextColor="#94A3B8"
      />

      {!isNew && (
        <View className="flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <View className="flex-row items-center">
            <Text className="text-xl mr-3">⭐</Text>
            <Text className="text-base font-semibold text-slate-700">Starred (Local Only)</Text>
          </View>
          <Switch 
            value={isStarred} 
            onValueChange={handleToggleStar} 
            trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
            thumbColor={isStarred ? '#4F46E5' : '#F8FAFC'}
          />
        </View>
      )}

      <Text className="text-sm font-bold text-slate-600 mb-2 uppercase tracking-widest">Category</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {categories?.map((cat: Category) => (
          <TouchableOpacity
            key={cat.id}
            className={`px-4 py-2 rounded-full border ${categoryId === cat.id ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}
            onPress={() => setCategoryId(cat.id === categoryId ? null : cat.id)}
          >
            <Text className={`font-semibold ${categoryId === cat.id ? 'text-white' : 'text-slate-600'}`}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          className="px-4 py-2 rounded-full border border-dashed border-slate-400 bg-slate-50"
          onPress={() => setIsAddingCategory(true)}
        >
          <Text className="font-semibold text-slate-500">+ Add New</Text>
        </TouchableOpacity>
      </View>

      {isAddingCategory && (
        <View className="flex-row gap-2 mb-8">
          <TextInput
            className="flex-1 bg-white rounded-xl p-3 text-sm border border-slate-200 shadow-sm"
            placeholder="New category name"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
          />
          <TouchableOpacity 
            className="bg-indigo-600 rounded-xl px-4 justify-center"
            onPress={handleAddCategory}
          >
            <Text className="text-white font-bold">Add</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-slate-200 rounded-xl px-4 justify-center"
            onPress={() => setIsAddingCategory(false)}
          >
            <Text className="text-slate-600 font-bold">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="mt-auto pb-8 gap-3">
        <TouchableOpacity 
          className={`py-4 rounded-2xl items-center shadow-sm ${(!isOnline && isNew) ? 'bg-slate-300' : 'bg-indigo-600'}`}
          onPress={handleSave} 
          disabled={!isOnline && isNew}
        >
          <Text className="text-white font-bold text-lg">Save Task</Text>
        </TouchableOpacity>
        
        {!isNew && (
          <TouchableOpacity 
            className={`py-4 rounded-2xl items-center border ${!isOnline ? 'border-slate-200 bg-slate-100' : 'border-red-100 bg-red-50'}`}
            onPress={handleDelete} 
            disabled={!isOnline}
          >
            <Text className={`font-bold text-lg ${!isOnline ? 'text-slate-400' : 'text-red-500'}`}>Delete Task</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}
