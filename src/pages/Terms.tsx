import { useNavigate } from 'react-router-dom';
import Screen from '../components/Screen';
import Header from '../components/Header';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <Screen>
      <Header title="Terms of Service" onBack={() => navigate(-1)} />
      <div className="legal-page">
        <p className="legal-meta">Effective date: 14 October 2026</p>

        <p>
          By using Hearth, you agree to these terms. Please read them carefully.
        </p>

        <h2>1. Who can use Hearth</h2>
        <p>
          You must be 18 or older. You must provide accurate information when
          creating your account.
        </p>

        <h2>2. Your account</h2>
        <ul>
          <li>Keep your password secret.</li>
          <li>You are responsible for activity on your account.</li>
          <li>One account per person.</li>
        </ul>

        <h2>3. Your data</h2>
        <p>
          You own your data. We store it for you under the terms in our Privacy
          Policy. You can export or delete it at any time from Settings.
        </p>

        <h2>4. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Break any law using Hearth.</li>
          <li>Try to hack, overload, or disrupt our systems.</li>
          <li>Reverse-engineer our software.</li>
          <li>Abuse other users.</li>
          <li>Scrape data using bots.</li>
        </ul>

        <h2>5. Our intellectual property</h2>
        <p>
          The Hearth name, logo, design, and code are ours. You may use the app
          for personal use, but you may not copy, resell, or redistribute it.
        </p>

        <h2>6. Availability</h2>
        <p>
          We aim for 99.9% uptime but do not guarantee it. Occasional
          maintenance windows are possible.
        </p>

        <h2>7. Payments (future plans)</h2>
        <p>
          When paid plans launch, pricing will be clear before you are charged.
          Refunds will follow your local consumer law.
        </p>

        <h2>8. Termination</h2>
        <ul>
          <li>You can delete your account anytime.</li>
          <li>
            We may suspend accounts that violate these terms or put other users
            at risk.
          </li>
        </ul>

        <h2>9. Disclaimers</h2>
        <p>Hearth is a home maintenance tracker. It is not:</p>
        <ul>
          <li>Professional home inspection.</li>
          <li>Legal, financial, or contractor advice.</li>
          <li>A warranty or guarantee of any kind.</li>
        </ul>
        <p>
          We are not liable for missed maintenance, damage to your home, or
          costs of any kind arising from use of the app.
        </p>

        <h2>10. Limits of liability</h2>
        <p>
          To the maximum extent permitted by law, our total liability is limited
          to whatever you paid us in the last 12 months (which is $0 if you're
          on the free plan).
        </p>

        <h2>11. Governing law</h2>
        <p>
          These terms are governed by the laws of India, unless local law
          requires otherwise.
        </p>

        <h2>12. Changes</h2>
        <p>
          We'll notify you before significant changes. Continued use after a
          change means you accept the updated terms.
        </p>

        <h2>13. Contact</h2>
        <p>
          Questions? Email{' '}
          <a href="mailto:wirtznjr@gmail.com">wirtznjr@gmail.com</a>.
        </p>
      </div>
    </Screen>
  );
}