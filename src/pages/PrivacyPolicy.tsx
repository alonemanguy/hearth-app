import { useNavigate } from 'react-router-dom';
import Screen from '../components/Screen';
import Header from '../components/Header';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <Screen>
      <Header title="Privacy Policy" onBack={() => navigate(-1)} />
      <div className="legal-page">
        <p className="legal-meta">Effective date: 14 October 2026</p>

        <p>
          Hearth ("we", "us", "our") provides a home maintenance app. This
          policy explains what data we collect, how we use it, and your rights.
          We take this seriously — your home is private.
        </p>

        <h2>1. Who we are</h2>
        <p>
          Hearth is operated by the Hearth team. For any privacy question, write
          to <a href="mailto:wirtznjr@gmail.com">wirtznjr@gmail.com</a>.
        </p>

        <h2>2. What we collect</h2>
        <p>We collect only what is needed to run Hearth.</p>
        <ul>
          <li>
            <strong>Account data</strong> — email address, password (hashed with
            bcrypt, never visible to us), and your help-level preference.
          </li>
          <li>
            <strong>Home data (yours, private to you)</strong> — property
            details you enter, appliance details, tasks, notes, warranty dates,
            and notification preferences.
          </li>
          <li>
            <strong>Device data (for push)</strong> — a push subscription
            endpoint, encryption keys, and a user-agent string to identify your
            device.
          </li>
          <li>
            <strong>Technical data</strong> — basic server logs (IP, timestamp,
            retained up to 90 days) and anonymized error logs.
          </li>
        </ul>
        <p>
          We do <strong>not</strong> collect: location, contacts, photos,
          browsing history, biometric data, or any third-party tracking.
        </p>

        <h2>3. How we use your data</h2>
        <ul>
          <li>Provide the core app — tasks, reminders, appliances.</li>
          <li>Send the notifications you asked for.</li>
          <li>Respond to support requests.</li>
          <li>Detect and fix bugs.</li>
        </ul>
        <p>
          We <strong>do not</strong> sell your data, share it with advertisers,
          use it to train AI models, or give it to data brokers.
        </p>

        <h2>4. Legal bases (GDPR)</h2>
        <p>If you are in the EU or UK, we rely on:</p>
        <ul>
          <li>
            <strong>Contract</strong> — to provide the app you signed up for.
          </li>
          <li>
            <strong>Consent</strong> — for push notifications.
          </li>
          <li>
            <strong>Legitimate interest</strong> — for security and abuse
            prevention.
          </li>
        </ul>

        <h2>5. Who we share with</h2>
        <p>
          We work with the following processors, all under strict contractual
          obligations:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — database and authentication.
          </li>
          <li>
            <strong>Vercel</strong> — application hosting.
          </li>
          <li>
            <strong>Google Firebase Cloud Messaging</strong> — push notification
            delivery.
          </li>
          <li>
            <strong>Sentry</strong> — anonymized error monitoring.
          </li>
        </ul>
        <p>We never sell your data or share it with advertisers.</p>

        <h2>6. Your rights</h2>
        <p>You can, at any time:</p>
        <ul>
          <li>
            <strong>Access</strong> your data — export it from Settings.
          </li>
          <li>
            <strong>Delete</strong> your account — permanent and immediate.
          </li>
          <li>
            <strong>Correct</strong> your data — edit anytime in the app.
          </li>
          <li>
            <strong>Port</strong> your data — export as JSON.
          </li>
          <li>
            <strong>Object</strong> to processing — contact us.
          </li>
        </ul>
        <p>
          For EU/UK users, you can complain to your local Data Protection
          Authority. For India, the Data Protection Board.
        </p>

        <h2>7. How long we keep data</h2>
        <ul>
          <li>Active accounts — kept while you use Hearth.</li>
          <li>Deleted accounts — wiped within 30 days.</li>
          <li>Server logs — retained up to 90 days.</li>
        </ul>

        <h2>8. Security</h2>
        <ul>
          <li>Encrypted in transit (HTTPS).</li>
          <li>Encrypted at rest (Supabase).</li>
          <li>Row-Level Security isolates your data from other users.</li>
          <li>Passwords hashed with bcrypt.</li>
        </ul>

        <h2>9. Children</h2>
        <p>
          Hearth is for users aged 18 and older. We do not knowingly collect
          data from minors.
        </p>

        <h2>10. International transfers</h2>
        <p>
          Your data may be processed in the United States, the European Union,
          or India. For transfers out of the EU, we use Standard Contractual
          Clauses.
        </p>

        <h2>11. Changes to this policy</h2>
        <p>
          We will email you before significant changes take effect. Continued
          use after changes means you accept the updated policy.
        </p>

        <h2>12. Contact</h2>
        <p>
          Questions? Email{' '}
          <a href="mailto:wirtznjr@gmail.com">wirtznjr@gmail.com</a>.
        </p>
      </div>
    </Screen>
  );
}