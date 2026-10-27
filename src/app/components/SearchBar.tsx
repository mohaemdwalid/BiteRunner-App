import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Search color={Colors.light.textSecondary} size={20} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? 'Search restaurants or dishes...'}
        placeholderTextColor={Colors.light.textSecondary}
        style={styles.input}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.light.elevated,
    borderColor: Colors.light.divider,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  input: {
    ...Typography.body,
    color: Colors.light.textPrimary,
    flex: 1,
    paddingVertical: 0,
  },
});
