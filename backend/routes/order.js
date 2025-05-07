const express = require('express');
const router = express.Router(); // Use a router instead of app

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Assuming `authenticate` is a middleware from your main server file
const authenticate = require('../server/middleware/authmiddleare'); // Adjust path accordingly

// Get order details by session ID
router.get('/session/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product', 'customer'],
    });

    // Retrieve payment intent for additional details
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

    // Format order details
    const orderDetails = {
      orderId: session.id,
      customerEmail: session.customer_details.email,
      items: session.line_items.data.map(item => ({
        productId: item.price.product.metadata.productId,
        name: item.price.product.name,
        price: item.price.unit_amount / 100,
        quantity: item.quantity,
        image: item.price.product.images?.[0] || '/default-book.jpg',
      })),
      subtotal: session.amount_subtotal / 100,
      total: session.amount_total / 100,
      shipping: session.shipping_cost?.amount_total ? session.shipping_cost.amount_total / 100 : 0,
      tax: session.total_details.amount_tax / 100,
      paymentStatus: paymentIntent.status,
      shippingAddress: session.shipping_details?.address,
      estimatedDelivery: '3-5 business days',
    };

    res.json(orderDetails);
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ error: 'Failed to retrieve order details', details: err.message });
  }
});

// Export the router to use in the main server file
module.exports = router;
