import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CreditCard, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { isValidCartItem, type CartItem } from '@/lib/store';
import { supabase } from '@/lib/supabaseClient';

interface PaymentProps {
  items: CartItem[];
  total: number;
  customerInfo: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function Payment({ items, total, customerInfo, onSuccess, onCancel }: PaymentProps) {
  const validItems = items.filter(isValidCartItem);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [codError, setCodError] = useState<string | null>(null);
  const [codOrderId, setCodOrderId] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const { data, error } = await supabase.rpc('create_order', orderData);
      
      if (error) {
        throw new Error(error.message || 'Failed to create order via RPC');
      }
      return data;
    },
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    // Only handle client-side Cashfree SDK logic here
    // ... existing Cashfree SDK logic ...
    setIsProcessing(false);
  };

  const handleCashOnDelivery = async () => {
    setCodError(null);
    setIsRetrying(false);
    try {
      const phoneNumber = customerInfo.customerPhone.replace(/\D/g, '');
      const isValidIndianPhone = /^(\+?91)?[6-9]\d{9}$/.test(phoneNumber);
      if (!isValidIndianPhone) {
        throw new Error('Please enter a valid Indian phone number starting with 6-9 and having 10 digits.');
      }

      const rpcPayload = {
        customerName: customerInfo.customerName,
        customerEmail: customerInfo.customerEmail,
        customerPhone: phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`,
        total: total,
        items: validItems.map(item => ({
          product_id: item.variant.id,
          product_name: item.name,
          quantity: item.quantity,
          price_per_item: item.price,
        })),
      };

      const newOrderId = await createOrderMutation.mutateAsync(rpcPayload);

      setCodOrderId(newOrderId);
      window.location.href = `/payment-success?orderId=${newOrderId}`;

    } catch (error: any) {
      setCodError(error?.message || 'Unable to place order. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} {item.variant.size} x {item.quantity}
                </span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 font-bold">
              <div className="flex justify-between">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-playfair font-bold">Choose Payment Method</h3>

        {/* Online Payment */}
        <Card className="border-2 border-primary hover:bg-primary/5 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <CreditCard className="text-white w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium">Pay Online</h4>
                  <p className="text-sm text-muted-foreground">Card, UPI, Netbanking & More</p>
                </div>
              </div>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="bg-primary hover:bg-primary/90"
              >
                {isProcessing ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Secured by Cashfree</span>
            </div>
          </CardContent>
        </Card>

        {/* Cash on Delivery */}
        <Card className="border hover:bg-secondary/5 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h4 className="font-medium">Cash on Delivery</h4>
                  <p className="text-sm text-muted-foreground">Pay when you receive</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleCashOnDelivery}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? 'Placing...' : 'Place Order'}
              </Button>
            </div>
            {codError && (
              <div className="mt-4 text-destructive text-sm">
                {codError}
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => { setIsRetrying(true); handleCashOnDelivery(); }} disabled={isRetrying}>
                    Retry
                  </Button>
                  <Button size="sm" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Back to Cart
        </Button>
      </div>
    </div>
  );
}
