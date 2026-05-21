import React from 'react';
import { appConfig } from '@/config';

export const Navbar: React.FC = () => {
  return (
    <header className="site-header" id="navbar">
      <div className="navbar-container">
        <div className="logo-area">
          <svg
            className="logo-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="logo-text" id="navbar-logo-text">
            {appConfig.departmentName}
          </span>
        </div>
        <nav className="nav-navigation" aria-label="Main Navigation">
          <ul className="nav-menu">
            <li>
              <a href="#overview" className="nav-link" id="nav-link-overview">
                Overview
              </a>
            </li>
            {appConfig.projectUrl && (
              <li>
                <a
                  href={appConfig.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link"
                  id="nav-link-project"
                >
                  Project Board
                </a>
              </li>
            )}
            {appConfig.kumaUrl && (
              <li>
                <a
                  href={appConfig.kumaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link nav-link-status"
                  id="nav-link-kuma"
                >
                  <span className="status-indicator"></span>
                  Status Monitoring
                </a>
              </li>
            )}
          </ul>
        </nav>
        <div className="nav-actions">
          <a
            href={`https://github.com/${appConfig.githubOwner}/${appConfig.repoName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="github-btn"
            id="navbar-github-btn"
          >
            <span>GitHub</span>
            <svg
              className="btn-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
};
