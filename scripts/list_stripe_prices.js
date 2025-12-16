require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
});

async function listPrices() {
    try {
        const prices = await stripe.prices.list({
            expand: ['data.product'],
            limit: 10,
            active: true,
        });

        if (prices.data.length === 0) {
            console.log('No active prices found.');
        } else {
            console.log('Found Prices:');
            prices.data.forEach(price => {
                const product = price.product;
                console.log(`- Product: ${product.name} | Price ID: ${price.id} | Amount: ${price.unit_amount / 100} ${price.currency.toUpperCase()} (${price.recurring?.interval || 'one-time'})`);
            });
        }
    } catch (error) {
        console.error('Error fetching prices:', error.message);
    }
}

listPrices();
