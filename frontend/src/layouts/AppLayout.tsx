import { Link, Outlet } from "@tanstack/react-router";
import styles from './AppLayout.module.css';
import { Notebook, Activity, Users } from 'lucide-react';
import { AuthContext } from "../contexts/AuthContext";
import { useContext } from "react";

const AppLayout: React.FC = () => {
  const { currentUser, logout } = useContext(AuthContext);

  return <div className={styles.layout}>
    <nav className={styles.menu}>
      <Link to="/">
        <img src="/appicon.png" alt="My SaaS Product" className={styles.appicon} />
      </Link>
      <Link to="/app/notes" className={styles.menuitem}>
        <Notebook />Notes
      </Link>
      <Link to="/app/reports" className={styles.menuitem}>
        <Activity />Reports
      </Link>
      <Link to="/app/users" className={styles.menuitem}>
        <Users />Users
      </Link>
    </nav>
    <main>
      <header className={styles.header}>
        <Link to="/" onClick={logout}>{currentUser?.email}</Link>
      </header>
      <Outlet />
    </main>
  </div>
};

export default AppLayout;
