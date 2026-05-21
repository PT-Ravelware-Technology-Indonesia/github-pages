import React from 'react';
import { Navbar } from '@/components/Navbar';
import { ProjectDocuments, Repository } from '@/components/ProjectDocuments';
import { appConfig } from '@/config';

// Fetch repositories at build-time on the server
async function fetchRepositories(): Promise<Repository[]> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (appConfig.githubToken) {
      headers['Authorization'] = `token ${appConfig.githubToken}`;
    }

    let endpoint = '';
    if (appConfig.ownerType === 'org') {
      endpoint = `https://api.github.com/orgs/${appConfig.githubOwner}/repos?per_page=100${appConfig.githubToken ? '&type=all' : ''}`;
    } else {
      endpoint = appConfig.githubToken
        ? `https://api.github.com/user/repos?per_page=100`
        : `https://api.github.com/users/${appConfig.githubOwner}/repos?per_page=100`;
    }

    const response = await fetch(endpoint, { headers });

    if (!response.ok) {
      console.error(`Failed to fetch repositories: Status ${response.status}`);
      return [];
    }

    const data: Repository[] = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching repositories at build time:', err);
    return [];
  }
}

export default async function Home() {
  const initialRepos = await fetchRepositories();

  const githubRepoUrl = `https://github.com/${appConfig.githubOwner}/${appConfig.repoName}`;
  const githubProfileUrl = `https://github.com/${appConfig.githubOwner}`;

  return (
    <div className="main-content">
      {/* Dynamic Background Glows */}
      <div className="bg-glow-container" aria-hidden="true">
        <div className="glow-1"></div>
        <div className="glow-2"></div>
      </div>

      {/* Navbar Component */}
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="hero-section" id="overview">
          <div className="badge-wrapper">
            <span className="portal-badge" id="hero-badge">
              <span className="badge-dot"></span>
              Internal Portal
            </span>
          </div>

          <h1 className="hero-title" id="main-heading">
            {appConfig.departmentName}
          </h1>

          <p className="hero-description" id="main-subheading">
            Satu pusat kendali informasi untuk kolaborasi tim, dokumentasi standar operasional (SOP), 
            serta direktori dan status monitoring aplikasi departemen.
          </p>

          <div className="cta-group">
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-btn"
              id="cta-github-repo"
            >
              <span>Kunjungi GitHub Repository</span>
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>

            {appConfig.projectUrl && (
              <a
                href={appConfig.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-btn"
                id="cta-project-board"
              >
                <span>Project Board</span>
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <rect x="7" y="7" width="3" height="9" />
                  <rect x="14" y="7" width="3" height="5" />
                </svg>
              </a>
            )}
          </div>
        </section>

        {/* Feature/Service Grid */}
        <section className="features-section" aria-labelledby="section-services-title">
          <h2 className="section-label" id="section-services-title">
            Portal Resources
          </h2>

          <div className="features-grid">
            {/* Feature 1: Repository Owner Profile */}
            <div className="feature-card" id="card-organization">
              <div className="card-icon-wrapper">
                <svg
                  className="card-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Organisasi GitHub</h3>
              <p>
                Akses semua repositori kode dan kontribusi tim di bawah naungan pemilik akun/organisasi 
                <strong> {appConfig.githubOwner}</strong>.
              </p>
              <a
                href={githubProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="card-link"
                id="link-github-org"
              >
                <span>Lihat Profil GitHub</span>
                <svg
                  className="card-link-icon"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>

            {/* Feature 2: SOP & Documentation */}
            <div className="feature-card" id="card-sop">
              <div className="card-icon-wrapper">
                <svg
                  className="card-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3>Dokumentasi & SOP</h3>
              <p>
                Cari panduan teknis, langkah implementasi, serta Standar Operasional Prosedur 
                tim IT yang terstruktur dan mudah diakses.
              </p>
              <a href="#sop" className="card-link" id="link-read-sop">
                <span>Pelajari SOP</span>
                <svg
                  className="card-link-icon"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>

            {/* Feature 3: Monitoring Link */}
            {appConfig.kumaUrl && (
              <div className="feature-card" id="card-monitoring">
                <div className="card-icon-wrapper">
                  <svg
                    className="card-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <h3>Status Infrastruktur</h3>
                <p>
                  Pantau ketersediaan server, basis data, dan aplikasi internal secara real-time 
                  melalui dashboard Uptime Kuma kami.
                </p>
                <a
                  href={appConfig.kumaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-link"
                  id="link-view-monitoring"
                >
                  <span>Buka Uptime Kuma</span>
                  <svg
                    className="card-link-icon"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Project & Documentation Section */}
        <ProjectDocuments initialRepos={initialRepos} />
      </main>

      {/* Footer */}
      <footer className="site-footer" id="footer-section">
        <div className="footer-container">
          <ul className="footer-links">
            <li>
              <a href={githubRepoUrl} target="_blank" rel="noopener noreferrer" className="footer-link" id="footer-link-github">
                GitHub Repository
              </a>
            </li>
            {appConfig.portalUrl && (
              <li>
                <a href={appConfig.portalUrl} target="_blank" rel="noopener noreferrer" className="footer-link" id="footer-link-portal">
                  Live Portal Page
                </a>
              </li>
            )}
          </ul>
          <p className="footer-copyright" id="footer-copyright-text">
            &copy; {new Date().getFullYear()} {appConfig.departmentName}. Powered by Antigravity.
          </p>
        </div>
      </footer>
    </div>
  );
}
