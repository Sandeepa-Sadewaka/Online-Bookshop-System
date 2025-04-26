import React , { useState } from 'react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function HomeScreen() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleClick = () => {
        navigate('/about');
    }

    const  handleSubmit = async (e) => {
        e.preventDefault();
        // Handle form submission logic here
        try {
          const response = await axios.post('http://localhost:5000/api/auth/register', {
            username,
            email,
            password
          });
          if (response.status === 200) {
            console.log('User registered successfully:', response.data);
            window.alert('User registered successfully!');
          }
        }
        catch (error) {
          console.error('Error registering user:', error);
        }

    }




  return (
    <div>
      <Header />
      <button onClick={handleClick}>About</button>

      <form onSubmit={handleSubmit}>
        <input type="text" onChange={(e) => setUsername(e.target.value)}/>
        <input type="email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Submit</button>
      </form>
      <Footer />
    </div>
  )
}

export default HomeScreen
