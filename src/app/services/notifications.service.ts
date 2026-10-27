import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let expoPushToken: string | null = null;

export const notificationService = {
  async registerForPushNotifications(): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return null;

      const token = await Notifications.getExpoPushTokenAsync({ projectId: 'biterunner' });
      expoPushToken = token.data;
      return token.data;
    } catch {
      return null;
    }
  },

  getPushToken(): string | null {
    return expoPushToken;
  },

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    secondsFromNow: number = 2,
  ) {
    if (Platform.OS === 'web') return;

    await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: secondsFromNow },
    });
  },

  async sendOrderConfirmed(restaurantName: string) {
    await this.scheduleLocalNotification(
      'Order Confirmed!',
      `${restaurantName} has accepted your order.`,
      { type: 'order_confirmed' },
    );
  },

  async sendOrderPreparing(restaurantName: string) {
    await this.scheduleLocalNotification(
      'Preparing Your Order',
      `${restaurantName} is preparing your food.`,
      { type: 'order_preparing' },
    );
  },

  async sendOrderPickedUp() {
    await this.scheduleLocalNotification(
      'On the Way!',
      'Your driver has picked up the order.',
      { type: 'order_picked_up' },
    );
  },

  async sendOrderDelivered() {
    await this.scheduleLocalNotification(
      'Delivered!',
      'Your order has been delivered. Enjoy!',
      { type: 'order_delivered' },
    );
  },

  async sendNewOrderForRestaurant(orderId: string) {
    await this.scheduleLocalNotification(
      'New Order!',
      'You have a new incoming order.',
      { type: 'new_order', orderId },
    );
  },

  addNotificationListener(
    callback: (notification: Notifications.Notification) => void,
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  },

  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void,
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};
