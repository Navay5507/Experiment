import SafetyClient from './SafetyClient';
import styles from '../dashboard.module.css';

export const dynamic = 'force-dynamic';

export default function SafetyPage() {
  return (
    <div className={styles.content}>
      <SafetyClient />
    </div>
  );
}
