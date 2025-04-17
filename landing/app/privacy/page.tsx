export default function Privacy() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-gray-800 dark:text-gray-200">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Last updated: March 28, 2025
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
        <p>
          Memi Chat (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;)
          respects your privacy. This Privacy Policy explains what personal data
          we collect, how we use it, and your rights.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          2. Information We Collect
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>Email Address:</strong> Used for account creation,
            authentication, and communication.
          </li>
          <li>
            <strong>Conversations & Inputs:</strong> Stored to provide
            continuity, personalization, and app functionality.
          </li>
          <li>
            <strong>Device & Usage Data:</strong> Browser type, device info, and
            app usage data, used for analytics and troubleshooting.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. How We Use Your Data</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>To provide and personalize your experience in the app.</li>
          <li>To store your AIs, chat history, and preferences.</li>
          <li>To communicate important updates or support info.</li>
          <li>To monitor for abuse and improve service quality.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          4. AI-Generated Conversations
        </h2>
        <p>
          Conversations in Memi Chat may be used anonymously to improve AI
          models, enhance personalization, or develop new features. We do not
          sell or publish personal conversations.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5. Data Sharing</h2>
        <p>
          We do not sell your personal data. We may share information with
          trusted third-party providers (e.g., hosting, analytics) who help us
          operate the app, under strict confidentiality agreements.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          6. Data Storage & Security
        </h2>
        <p>
          Your data is stored securely using industry best practices. While no
          system is 100% secure, we work hard to protect your information from
          unauthorized access or misuse.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">7. Data Retention</h2>
        <p>
          We retain your data for as long as your account is active. You can
          request account deletion and removal of your stored data at any time
          by contacting us.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">8. Your Rights</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Request access to your stored data.</li>
          <li>Request correction or deletion of your data.</li>
          <li>Withdraw consent to data processing (where applicable).</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          9. Children&apos;s Privacy
        </h2>
        <p>
          Memi Chat is not intended for children under 13. We do not knowingly
          collect data from children without parental consent.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          10. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. If we make
          significant changes, we will notify you via the app or email.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">11. Contact Us</h2>
        <p>
          Questions or concerns? Contact us at{" "}
          <a
            href="mailto:privacy@memichat.com"
            className="text-blue-600 dark:text-blue-400 underline"
          >
            privacy@memichat.com
          </a>
          .
        </p>
      </section>
    </main>
  );
}
