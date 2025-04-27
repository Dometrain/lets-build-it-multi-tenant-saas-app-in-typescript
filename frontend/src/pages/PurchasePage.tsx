import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import styles from './page.module.css';
import { getStripeCheckoutSession } from "../api";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY, {});

const PurchasePage: React.FC = () => {

  const fetchClientSecret = async () =>
    (await getStripeCheckoutSession()).secret;

  return <div className={[styles.page, styles.home].join(' ')}>
    <h2>Create a subscription</h2>
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{ fetchClientSecret }}
    >
      <EmbeddedCheckout className={styles.checkout} />
    </EmbeddedCheckoutProvider>
  </div>
};

export default PurchasePage;
