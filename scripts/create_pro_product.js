require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
});

async function createProProduct() {
    try {
        const product = await stripe.products.create({
            name: 'PRO — Co-Creazione',
            description: 'Accesso agli spazi creativi condivisi "Co-Process".',
        });

        console.log(`Product created: ${product.name} (${product.id})`);

        const priceEur = await stripe.prices.create({
            product: product.id,
            unit_amount: 900, // 9.00 EUR
            currency: 'eur',
            recurring: { interval: 'month' },
        });

        console.log(`Price created (EUR): ${priceEur.id} (9.00 EUR/month)`);

        const priceUsd = await stripe.prices.create({
            product: product.id,
            unit_amount: 1200, // 12.00 USD
            currency: 'usd',
            recurring: { interval: 'month' },
        });

        console.log(`Price created (USD): ${priceUsd.id} (12.00 USD/month)`);

    } catch (error) {
        console.error('Error creating product:', error.message);
    }
}

createProProduct();
