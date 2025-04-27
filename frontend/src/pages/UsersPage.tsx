import { useQuery } from "@tanstack/react-query";
import { fetchUsersInTenant } from "../api";
import UserTable from "../components/UserTable";
import styles from './page.module.css';
import NewUserForm from "../components/NewUserForm";

const UsersPage: React.FC = () => {
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsersInTenant,
  });

  return <div className={styles.page}>
    <h1>Users</h1>
    { users ? <UserTable users={users} /> : 'Loading...' }
    <NewUserForm />
  </div>
};

export default UsersPage;
