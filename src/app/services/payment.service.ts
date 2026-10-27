import { isSupabaseConfigured, supabase } from './supabase';

export interface PaymentResult {
  paymentIntentId: string;
  status: 'succeeded' | 'requires_payment_method' | 'cancelled';
}

export const paymentService = {
  async createPaymentIntent(params: {
    amount: number;
    currency?: string;
    paymentMethod: 'card' | 'cash' | 'apple_pay';
    customerId: string;
    restaurantId: string;
  }): Promise<PaymentResult> {
    if (params.paymentMethod === 'cash') {
      return {
        paymentIntentId: `cash-${Date.now()}`,
        status: 'succeeded',
      };
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: params.amount,
          currency: params.currency ?? 'egp',
          customer_id: params.customerId,
          restaurant_id: params.restaurantId,
          payment_method_type: params.paymentMethod,
        },
      });
      if (error) throw error;
      return data;
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));

    return {
      paymentIntentId: `demo-${params.paymentMethod}-${Date.now()}`,
      status: 'succeeded',
    };
  },

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.functions.invoke('confirm-payment', {
        body: { payment_intent_id: paymentIntentId },
      });
      if (error) throw error;
      return data;
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      paymentIntentId,
      status: 'succeeded',
    };
  },
};
