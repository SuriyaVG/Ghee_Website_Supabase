import { useEffect, useState } from 'react';
import { useLocation, Link, useSearchParams } from 'react-router-dom';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const clearCart = useCartStore((state) => state.clearCart);

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'cod_success'>('loading');
  const [order, setOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const orderId = searchParams.get('orderId');
  const cfOrderId = searchParams.get('cf_order_id');

  useEffect(() => {
    // Case 1: Cash on Delivery (COD) Success
    if (orderId) {
      const fetchCodOrder = async (attempt = 1) => {
        setStatus('loading');
        setErrorMessage('');
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
          
          if (error) throw new Error(error.message || 'Order not found.');
          
          setOrder(data);
          setStatus('cod_success');
          clearCart();
        } catch (err: any) {
          if (attempt < 4) {
            setTimeout(() => fetchCodOrder(attempt + 1), 2 ** attempt * 1000);
            setRetryCount(attempt);
          } else {
            setErrorMessage('Could not retrieve your order details. Please contact support.');
            setStatus('error');
          }
        }
      };
      fetchCodOrder();
      return;
    }

    // Case 2: Cashfree Online Payment Success
    if (cfOrderId) {
      // The logic to verify payment with a backend is now deferred to a Supabase Edge Function.
      // For now, we assume the verification will happen and we clear the cart.
      // In a full implementation, we would poll an Edge Function endpoint here.
      toast({
        title: 'Payment in Progress',
        description: 'Your payment is being verified. You will receive a confirmation email shortly.',
      });
      clearCart();
      // Since we don't have the final order details from our backend yet, we'll just show a generic success.
      setStatus('success');
      setOrder({ id: cfOrderId, cf: true }); // Mock order object
      return;
    }

    // Case 3: Invalid URL
    setErrorMessage('Invalid return URL. No order information found.');
    setStatus('error');

  }, [orderId, cfOrderId, clearCart, toast]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
        <p className="text-xl font-semibold">Processing your order...</p>
        {retryCount > 0 && <p className="text-muted-foreground">Retrying... (Attempt {retryCount + 1})</p>}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <XCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">An Error Occurred</h1>
        <p className="text-muted-foreground mb-6">{errorMessage}</p>
        <Button asChild>
          <Link to="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  if (status === 'cod_success' && order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
        <div className="text-muted-foreground mb-6 text-left bg-card p-4 rounded-lg">
          <p><strong>Order ID:</strong> #{order.id}</p>
          <p><strong>Name:</strong> {order.customer_name}</p>
          <p><strong>Phone:</strong> {order.customer_phone}</p>
          <p><strong>Total:</strong> ₹{order.total}</p>
          <p><strong>Payment Method:</strong> Cash on Delivery</p>
          <p className="mt-2">Your order will be delivered in 3–5 business days.</p>
        </div>
        <Button asChild>
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }
  
  if (status === 'success' && order?.cf) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Received!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your payment! Your order is being processed. 
          You will receive a confirmation email shortly.
        </p>
         <Button asChild>
          <Link to="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return null; // Should not be reached
}
