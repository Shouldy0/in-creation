'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-11-17.clover',
});

export async function createCheckoutSession() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, plan')
        .eq('id', user.id)
        .single();

    if (profile?.plan === 'pro') {
        return { url: '/co-process' }; // Already pro
    }

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
                supabaseUserId: user.id,
            },
        });
        customerId = customer.id;

        // We should save this customer ID, but ideally the webhook handles it. 
        // For specific flow reliability we can update it here too.
        await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const priceId = process.env.STRIPE_PRICE_ID_PRO || 'price_1Set4SFQHVPUUsfZdm8LytKu';

    if (!priceId) {
        console.error("STRIPE_PRICE_ID_PRO not set");
        throw new Error("Stripe configuration missing");
    }

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/co-process?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/co-process?canceled=true`,
        metadata: {
            userId: user.id
        }
    });

    return { url: session.url };
}

export async function createCustomerPortal() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single();

    if (!profile?.stripe_customer_id) {
        throw new Error("No subscription found");
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/settings`,
    });

    return { url: session.url };
}
