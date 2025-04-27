import styles from './page.module.css';
import { Link } from '@tanstack/react-router';

const HomePage: React.FC = () => {

  return <div className={[styles.page, styles.home].join(' ')}>
    <img src="/appicon.png" alt="My SaaS Product" className={styles.appicon} />
    <h1>My SaaS Product</h1>
    <div>
      <Link to="/app/notes" className={styles.cta}>Go To App</Link>
    </div>
  </div>
};

export default HomePage;