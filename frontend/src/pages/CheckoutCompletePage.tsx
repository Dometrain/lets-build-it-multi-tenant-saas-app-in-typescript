import { fetchAuthSession } from 'aws-amplify/auth';
import styles from './page.module.css';
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

const CheckoutCompletePage: React.FC = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const refreshAuthToken = async () => {
      try {
        const authSession = await fetchAuthSession({ forceRefresh: true });
        if (!authSession.tokens) {
          setError('Not logged in!');
          return;
        }
        const userGroups = authSession.tokens.idToken?.payload['cognito:groups'] as string[];
        const tenantId = userGroups?.find(x => x.startsWith("sub_"));
        if (!tenantId) setError('Subscription has not yet been created, try refreshing this page');
        navigate({ to: "/app/notes" });
      } catch (error: any) {
        setError(error.message);
      }
    }
    setTimeout(() => refreshAuthToken(), 2000);
  }, []);

  return <div className={[styles.page, styles.home].join(' ')}>
    {error ? <h2>{error}</h2>
      : <h1>Completing Checkout...</h1>}
  </div>
};

export default CheckoutCompletePage;
