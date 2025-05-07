import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './screens/HomeScreen';
import AboutScreen from './screens/AboutScreen';
import CartScreen from './screens/CartScreen';
import RegisterScreen from './screens/RegisterScreen';
import BooksScreen from './screens/BooksScreen';
import BookDetails from './screens/BookDetails';
import Login from './components/Auth/Login';
import ProfileScreen from './screens/ProfileScreen';
import Success from './components/Common/Succes';
import OrderScreen from './screens/OrderScreen';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/about" element={<AboutScreen />} />
          <Route path="/cart" element={<CartScreen /> } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={< RegisterScreen />} />
          <Route path="/books" element={<BooksScreen />} />
          <Route path="/book-details/:id" element={<BookDetails />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/payment-success" element={<Success />} />
          <Route path="/order" element={< OrderScreen/>} />
          <Route path="/order-success" element={<Success />} />
        </Routes>
    </Router>
  );
}

export default App;
