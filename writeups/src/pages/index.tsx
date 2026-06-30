import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header
      className={clsx('hero', styles.heroBanner)}
      style={{
        backgroundColor: 'var(--color-canvas)',
        padding: '80px 24px 64px',
        textAlign: 'left',
        minHeight: 'auto',
        borderBottom: '1px solid var(--color-border)',
      }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(48px, 8vw, 96px)',
            lineHeight: 0.95,
            color: 'var(--color-text-primary)',
            textTransform: 'uppercase',
            margin: 0,
            letterSpacing: '1px',
          }}>
          {siteConfig.title}
        </h1>
        <p
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '14px',
            color: 'var(--color-accent)',
            textTransform: 'uppercase',
            letterSpacing: '2.5px',
            marginTop: '20px',
            fontWeight: 600,
          }}>
          {siteConfig.tagline}
        </p>
        <div
          style={{
            marginTop: '24px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '17px',
            color: 'var(--color-text-secondary)',
            maxWidth: '700px',
            lineHeight: 1.7,
          }}>
          <p>
            A persistent repository of writeups, methodologies, and findings.
            Covering everything from HTB Sherlocks blue team exercises to
            reverse engineering binaries.
          </p>
        </div>
      </div>
    </header>
  );
}

function StoryStream() {
  return (
    <div style={{ padding: '64px 24px', backgroundColor: 'var(--color-canvas)' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="story-stream">
          <Link to="/docs/HTB-Sherlocks" className="story-tile">
            <span className="story-kicker">Blue Team Ops</span>
            <h2 className="story-headline">HTB Sherlocks</h2>
            <p className="story-deck">
              Writeups for HackTheBox Sherlocks scenarios. Exploring incident
              response, log analysis, and digital forensics methodologies.
            </p>
          </Link>

          <Link to="/docs/Lets-Defend" className="story-tile highlight">
            <span className="story-kicker">SOC & Incident Response</span>
            <h2 className="story-headline">LetsDefend</h2>
            <p className="story-deck">
              Hands-on SOC analyst platform walkthroughs. Investigating alerts,
              analyzing malware, and completing playbooks.
            </p>
          </Link>

          <Link to="/docs/Crackme" className="story-tile">
            <span className="story-kicker">Reverse Engineering</span>
            <h2 className="story-headline">Crackme Writeups</h2>
            <p className="story-deck">
              Binary exploitation, assembly analysis, and reversing challenges.
              Breaking software to understand how it works.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Cybersecurity Writeups for HTB Sherlocks, LetsDefend, and Crackmes">
      <HomepageHeader />
      <main>
        <StoryStream />
      </main>
    </Layout>
  );
}
