import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Trash2, X } from 'lucide-react-native';
import { MenuItem } from '../../../types/models';
import { menuService } from '../../services/menu.service';
import { useAppStore } from '../../state/appStore';
import { useRestaurantStore } from '../../state/restaurantStore';
import CategoryChip from '../../components/CategoryChip';
import PrimaryButton from '../../components/PrimaryButton';
import { formatCurrency } from '../../utils/formatCurrency';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function MenuManagementScreen() {
  const userId = useAppStore((state) => state.userId);
  const restaurant = useRestaurantStore((state) => state.restaurant);
  const categories = useRestaurantStore((state) => state.categories);
  const storeItems = useRestaurantStore((state) => state.menuItems);
  const isLoading = useRestaurantStore((state) => state.isLoading);
  const loadAll = useRestaurantStore((state) => state.loadAll);
  const [items, setItems] = useState<MenuItem[]>(storeItems);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const refresh = useCallback(() => {
    loadAll(userId ?? 'demo-restaurant-owner');
  }, [loadAll, userId]);

  useFocusEffect(refresh);

  useEffect(() => {
    setItems(storeItems);
  }, [storeItems]);

  const filteredItems = selectedCategoryId === 'all'
    ? items
    : items.filter((item) => item.category_id === selectedCategoryId);

  function openCreateModal() {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('');
    setModalVisible(true);
  }

  function openEditModal(item: MenuItem) {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description ?? '');
    setPrice(String(item.price));
    setModalVisible(true);
  }

  async function saveItem() {
    if (!restaurant || !name.trim() || !price.trim()) return;
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice)) {
      Alert.alert('Invalid price', 'Enter a numeric price.');
      return;
    }

    if (editingItem) {
      const updates = { name: name.trim(), description: description.trim() || null, price: numericPrice };
      await menuService.updateItem(editingItem.id, updates);
      setItems((current) => current.map((item) => item.id === editingItem.id ? { ...item, ...updates } : item));
    } else {
      const created = await menuService.addItem({
        restaurant_id: restaurant.id,
        category_id: categories[0]?.id ?? null,
        name: name.trim(),
        description: description.trim() || null,
        price: numericPrice,
        image_url: null,
        is_available: true,
        sort_order: items.length + 1,
      });
      setItems((current) => [created, ...current]);
    }

    setModalVisible(false);
  }

  async function toggleAvailability(item: MenuItem, isAvailable: boolean) {
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_available: isAvailable } : entry));
    await menuService.toggleAvailability(item.id, isAvailable);
  }

  function deleteItem(item: MenuItem) {
    Alert.alert('Delete item', `Remove ${item.name} from the menu?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await menuService.deleteItem(item.id);
          setItems((current) => current.filter((entry) => entry.id !== item.id));
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.caption}>Menu management</Text>
            <Text style={styles.title}>{restaurant?.name ?? 'Menu'}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
            <Plus color="#FFFFFF" size={22} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          <CategoryChip label="All" active={selectedCategoryId === 'all'} onPress={() => setSelectedCategoryId('all')} />
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              label={category.name}
              active={selectedCategoryId === category.id}
              onPress={() => setSelectedCategoryId(category.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.list}>
          {filteredItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.itemCard} activeOpacity={0.9} onPress={() => openEditModal(item)}>
              {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.itemImage} /> : <View style={styles.itemImageFallback} />}
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
              </View>
              <View style={styles.itemActions}>
                <Switch
                  value={item.is_available}
                  onValueChange={(value) => toggleAvailability(item, value)}
                  trackColor={{ false: Colors.light.divider, true: Colors.accent.primaryLight }}
                  thumbColor={item.is_available ? Colors.accent.primary : '#FFFFFF'}
                />
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(item)}>
                  <Trash2 color={Colors.semantic.error} size={18} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredItems.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No items here</Text>
            <Text style={styles.emptyText}>Add a menu item or choose another category.</Text>
          </View>
        )}
      </ScrollView>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingItem ? 'Edit item' : 'Add item'}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <X color={Colors.light.textPrimary} size={20} />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Item name" value={name} onChangeText={setName} />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <TextInput style={styles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
            <PrimaryButton title={editingItem ? 'Save Changes' : 'Add Item'} onPress={saveItem} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  caption: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
  },
  title: {
    ...Typography.h1,
    color: Colors.light.textPrimary,
    marginTop: 2,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent.primary,
    borderRadius: 999,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  categories: {
    gap: 10,
    paddingVertical: 20,
  },
  list: {
    gap: 12,
  },
  itemCard: {
    alignItems: 'center',
    backgroundColor: Colors.light.elevated,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  itemImage: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 68,
    width: 68,
  },
  itemImageFallback: {
    backgroundColor: Colors.accent.primaryLight,
    borderRadius: 14,
    height: 68,
    width: 68,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
  },
  itemDescription: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    ...Typography.smallMedium,
    color: Colors.accent.primary,
    marginTop: 5,
  },
  itemActions: {
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: Colors.semantic.errorLight,
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  empty: {
    alignItems: 'center',
    backgroundColor: Colors.light.elevated,
    borderRadius: 20,
    padding: 24,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 12,
    padding: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.light.textPrimary,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: Colors.light.elevated,
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  input: {
    ...Typography.body,
    backgroundColor: Colors.light.elevated,
    borderColor: Colors.light.divider,
    borderRadius: 14,
    borderWidth: 1,
    color: Colors.light.textPrimary,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  multiline: {
    minHeight: 92,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
});
