import styles from './page.module.css';
import { AuthContext } from "../contexts/AuthContext";
import { Link } from '@tanstack/react-router';
import { useContext } from 'react';

const HomePage: React.FC = () => {
  const { login, currentUser } = useContext(AuthContext);

  return <div className={[styles.page, styles.home].join(' ')}>
    <img src="/appicon.png" alt="My SaaS Product" className={styles.appicon} />
    <h1>My SaaS Product</h1>
    <div>{currentUser ?
      <Link to="/app/notes" className={styles.cta}>Go To App</Link>
      : <button onClick={login} className={styles.cta}>Login</button>}</div>
  </div>
};

export default HomePage;
