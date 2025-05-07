import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import HomeComponent from '../components/Home/HomeComponent';

function Home() {

  return (
    <div className="home-page">
      <Header />
       <HomeComponent />
      <Footer />
    </div>
  );
}

export default Home;