const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
// const bookRoutes = require('./routes/books');
// const cartRoutes = require('./routes/cart');
// const orderRoutes = require('./routes/orders');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/', (req, res) => {
    res.send('API is running...');
});
