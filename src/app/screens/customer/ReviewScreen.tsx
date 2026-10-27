import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Star } from 'lucide-react-native';
import { reviewsService } from '../../services/reviews.service';
import { useAppStore } from '../../state/appStore';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function ReviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const orderId = route.params?.orderId as string;
  const restaurantId = route.params?.restaurantId as string;
  const userId = useAppStore((state) => state.userId);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitReview = useCallback(async () => {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please select a star rating.');
      return;
    }
    setSubmitting(true);
    try {
      await reviewsService.submitReview({
        orderId,
        customerId: userId ?? 'demo-customer',
        restaurantId,
        rating,
        comment: comment.trim() || null,
      });
      Alert.alert('Thank you!', 'Your review has been submitted.', [
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  }, [rating, comment, orderId, restaurantId, userId, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Order</Text>
        <View style={styles.iconButtonPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>How was your food?</Text>
        <Text style={styles.subtitle}>Your feedback helps restaurants improve.</Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= (hoverRating || rating);
            return (
              <TouchableOpacity
                key={star}
                activeOpacity={0.7}
                onPressIn={() => setHoverRating(star)}
                onPress={() => setRating(star)}
                onPressOut={() => setHoverRating(0)}
                style={styles.starButton}
              >
                <Star
                  size={44}
                  color={filled ? Colors.accent.secondary : Colors.light.divider}
                  fill={filled ? Colors.accent.secondary : 'transparent'}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {rating > 0 && (
          <Text style={styles.ratingLabel}>
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent!'}
          </Text>
        )}

        <View style={styles.inputPanel}>
          <Text style={styles.inputLabel}>Add a comment (optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Tell us about your experience..."
            placeholderTextColor={Colors.light.textTertiary}
            multiline
            maxLength={500}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{comment.length}/500</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={submitting ? 'Submitting...' : 'Submit Review'}
          loading={submitting}
          disabled={rating === 0}
          onPress={submitReview}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: Colors.light.elevated,
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  iconButtonPlaceholder: {
    height: 42,
    width: 42,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    ...Typography.h1,
    color: Colors.light.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  starsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 32,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    ...Typography.h3,
    color: Colors.accent.secondary,
    marginTop: 14,
    textAlign: 'center',
  },
  inputPanel: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 20,
    marginTop: 28,
    padding: 16,
  },
  inputLabel: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
    marginBottom: 10,
  },
  textInput: {
    ...Typography.body,
    backgroundColor: '#FFFFFF',
    borderColor: Colors.light.divider,
    borderRadius: 14,
    borderWidth: 1,
    color: Colors.light.textPrimary,
    height: 120,
    padding: 14,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.light.textTertiary,
    marginTop: 8,
    textAlign: 'right',
  },
  footer: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopColor: Colors.light.divider,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
  },
});
