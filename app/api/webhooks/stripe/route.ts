import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-11-17.clover', // Update to latest supported version
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    if (!webhookSecret) {
        return new NextResponse('Webhook Secret missing', { status: 500 });
    }

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = await createClient(); // Use createClient (service role would be better for write access without user session, but here we might need supabase-admin from a separate util or rely on RLS allowing service role)
    // Actually createClient() typically uses user auth from cookie. For webhooks we need SERVICE_ROLE access.
    // Assuming process.env.SUPABASE_SERVICE_ROLE_KEY exists and createClient can accept it or we use createClient from @supabase/supabase-js directly.

    // For now, let's log the event type.
    console.log(`Event type: ${event.type}`);

    // In a real implementation:
    // switch (event.type) {
    //   case 'checkout.session.completed':
    //     ... update user plan
    //   case 'customer.subscription.updated':
    //     ... update subscription status
    // }

    return new NextResponse('Received', { status: 200 });
}
