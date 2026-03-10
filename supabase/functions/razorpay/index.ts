import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Not authenticated');
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid auth token');

    const { action, ...params } = await req.json();

    if (action === 'create_order') {
      const { program_name, amount } = params;
      
      // Create Razorpay order
      const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay uses paise
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: { program_name, user_id: user.id },
        }),
      });

      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(`Razorpay order creation failed: ${JSON.stringify(order)}`);

      // Store pending payment
      await supabaseClient.from('payments').insert({
        user_id: user.id,
        razorpay_order_id: order.id,
        amount,
        program_name,
        status: 'pending',
      });

      return new Response(JSON.stringify({
        order_id: order.id,
        key_id: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'verify_payment') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

      // Verify signature using HMAC SHA256
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw', encoder.encode(RAZORPAY_KEY_SECRET),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      );
      const data = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);
      const signature = await crypto.subtle.sign('HMAC', key, data);
      const expectedSignature = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0')).join('');

      if (expectedSignature !== razorpay_signature) {
        throw new Error('Payment signature verification failed');
      }

      // Update payment status
      await supabaseClient.from('payments').update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'success',
      }).eq('razorpay_order_id', razorpay_order_id);

      // Get program details
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('program_name')
        .eq('razorpay_order_id', razorpay_order_id)
        .single();

      // Activate subscription
      const isMonthly = payment?.program_name === 'Premium Membership';
      const expiresAt = new Date();
      if (isMonthly) {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        const days = payment?.program_name?.includes('7') ? 7 : payment?.program_name?.includes('14') ? 14 : 28;
        expiresAt.setDate(expiresAt.getDate() + days);
      }

      await supabaseClient.from('subscriptions').insert({
        user_id: user.id,
        plan_name: payment?.program_name,
        plan_price: params.amount || 0,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        auto_renew: isMonthly,
      });

      // Update user profile
      await supabaseClient.from('profiles').update({
        subscription_status: 'active',
        program_purchased: payment?.program_name,
        program_start_date: new Date().toISOString(),
      }).eq('user_id', user.id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
