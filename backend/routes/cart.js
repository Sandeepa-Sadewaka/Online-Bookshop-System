const express = require('express');
const db = require('../config/db');
const auth = require('../server/middleware/authmiddleare');
const router = express.Router();

router.post('/addtocart', auth, async (req, res) => {
  const user_email = req.user.email;
  const { product_id, quantity } = req.body;

  // ✅ Corrected check
  if (!product_id || !quantity) {
    return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
  }

  try {
    await db.promise().query(
      `INSERT INTO cart (user_email, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [user_email, product_id, quantity, quantity]
    );

    res.status(200).json({ success: true, message: 'Item added to cart' });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
});

// routes/cart.js
router.get('/getcart', auth, async (req, res) => {
  const user_email = req.user.email;

  try {
    const [rows] = await db.promise().query(
      `SELECT *
       FROM cart 
       WHERE user_email = ?`,
      [user_email]
    );

    res.status(200).json({ success: true, cartItems: rows });
  } catch (err) {
    console.error('Get cart items error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve cart items' });
  }
});



//remove item from cart
// routes/cart.js

router.delete('/remove/:productId', auth, async (req, res) => {
  const user_email = req.user.email;
  const product_id = req.params.productId;

  try {
    await db.promise().query(
      `DELETE FROM cart WHERE user_email = ? AND product_id = ?`,
      [user_email, product_id]
    );

    res.status(200).json({ success: true, message: 'Cart item removed successfully' });
  } catch (err) {
    console.error('Remove cart item error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove cart item' });
  }
});
//update item quantity in cart
// routes/cart.js
router.put('/update/:productId', auth, async (req, res) => {
  const user_email = req.user.email;
  const product_id = req.params.productId;
  const { quantity } = req.body;  // ✅ Added quantity check

  // ✅ Corrected check
  if (!product_id || !quantity) {
    return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
  }

  try {
    await db.promise().query(
      `UPDATE cart SET quantity = ? WHERE user_email = ? AND product_id = ?`,
      [quantity, user_email, product_id]
    );

    res.status(200).json({ success: true, message: 'Cart item quantity updated successfully' });
  } catch (err) {
    console.error('Update cart item quantity error:', err);
    res.status(500).json({ success: false, message: 'Failed to update cart item quantity' });
  }
}); 


module.exports = router;


