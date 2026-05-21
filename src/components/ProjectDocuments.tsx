'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { appConfig } from '@/config';

interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  updated_at: string;
  has_pages: boolean;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Python: '#3572A5',
  Go: '#00ADD8',
  'C++': '#f34b7d',
  'C#': '#178600',
  Java: '#b07219',
  Shell: '#89e051',
  PHP: '#4f5d95',
  Rust: '#dea584',
  Ruby: '#701516',
};

export const ProjectDocuments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'github' | 'drive'>('github');
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMethod, setSortMethod] = useState<'updated' | 'stars' | 'name'>('updated');
  const [showForks, setShowForks] = useState(false);

  // README Modal States
  const [readmeRepo, setReadmeRepo] = useState<string | null>(null);
  const [readmeHtml, setReadmeHtml] = useState<string | null>(null);
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [readmeError, setReadmeError] = useState<string | null>(null);

  // Fetch individual README content rendered as HTML
  const handleOpenReadme = async (repoName: string) => {
    setReadmeRepo(repoName);
    setReadmeLoading(true);
    setReadmeHtml(null);
    setReadmeError(null);

    try {
      const headers: Record<string, string> = {
        Accept: 'application/vnd.github.v3.html',
      };

      if (appConfig.githubToken) {
        headers['Authorization'] = `token ${appConfig.githubToken}`;
      }

      const response = await fetch(
        `https://api.github.com/repos/${appConfig.githubOwner}/${repoName}/readme`,
        { headers }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Dokumentasi README.md tidak ditemukan untuk repository ini.');
        }
        throw new Error(`Gagal memuat README: Status ${response.status}`);
      }

      const html = await response.text();
      setReadmeHtml(html);
    } catch (err: any) {
      console.error(err);
      setReadmeError(err.message || 'Terjadi kesalahan saat mengambil dokumen README.');
    } finally {
      setReadmeLoading(false);
    }
  };

  const handleCloseReadme = () => {
    setReadmeRepo(null);
    setReadmeHtml(null);
    setReadmeError(null);
  };

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const headers: Record<string, string> = {
          Accept: 'application/vnd.github.v3+json',
        };

        if (appConfig.githubToken) {
          headers['Authorization'] = `token ${appConfig.githubToken}`;
        }

        // Fetch both public and private repositories if authenticated
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
          if (response.status === 403) {
            throw new Error('Limit API GitHub tercapai atau autentikasi gagal. Silakan periksa token Anda.');
          }
          throw new Error(`Gagal mengambil data repository: Status ${response.status}`);
        }

        const data: Repository[] = await response.json();
        setRepos(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Terjadi kesalahan saat memuat project.');
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  // Filter and Sort Repositories
  const filteredRepos = repos
    .filter((repo) => {
      // Filter out forks if not enabled
      if (!showForks && repo.fork) return false;
      
      // Filter by search query (name, description, or language)
      const query = searchQuery.toLowerCase();
      const matchesName = repo.name.toLowerCase().includes(query);
      const matchesDesc = (repo.description || '').toLowerCase().includes(query);
      const matchesLang = (repo.language || '').toLowerCase().includes(query);
      
      return matchesName || matchesDesc || matchesLang;
    })
    .sort((a, b) => {
      if (sortMethod === 'stars') {
        return b.stargazers_count - a.stargazers_count;
      }
      if (sortMethod === 'name') {
        return a.name.localeCompare(b.name);
      }
      // Default: sort by updated_at
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  // Grouping logic: take first 2 hyphen-separated segments as project name.
  // e.g. dws-sicepat-api       → dws-sicepat
  //      dws-sicepat-middleware-ai → dws-sicepat
  //      business-transformation-webserver → business-transformation
  //      wms-colorindo-webserver → wms-colorindo
  //      github-pages           → github-pages  (only 2 parts, kept as-is)
  const groupedRepos = useMemo(() => {
    const groups: Record<string, Repository[]> = {};
    
    filteredRepos.forEach(repo => {
      const parts = repo.name.split('-');
      // Use first 2 segments if available, otherwise use the full name
      const projectName = parts.length >= 2
        ? parts.slice(0, 2).join('-')
        : repo.name;
      
      if (!groups[projectName]) {
        groups[projectName] = [];
      }
      groups[projectName].push(repo);
    });
    
    return groups;
  }, [filteredRepos]);

  const getLanguageColor = (lang: string | null) => {
    if (!lang) return '#6b7280';
    return LANGUAGE_COLORS[lang] || '#3b82f6';
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to extract Google Drive Folder ID from URL
  const extractDriveId = (url: string) => {
    if (!url) return '';
    // Matches patterns like:
    // https://drive.google.com/drive/folders/1NuEWMGEEsTCbarTOqAXuZUe1ZWGxRJXz
    // or https://drive.google.com/drive/u/0/folders/1NuEWMGEEsTCbarTOqAXuZUe1ZWGxRJXz
    // or id=1NuEWMGEEsTCbarTOqAXuZUe1ZWGxRJXz
    const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/) || url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  const driveId = extractDriveId(appConfig.driveSopUrl);

  return (
    <>
    <section className="docs-section" id="sop" aria-labelledby="section-docs-title">
      <div className="section-header-container">
        <h2 className="section-label" id="section-docs-title">
          Daftar Project & Dokumentasi
        </h2>
        
        {/* Tab Switcher Navigation */}
        <div className="tab-navigation" role="tablist">
          <button
            className={`tab-btn ${activeTab === 'github' ? 'active' : ''}`}
            onClick={() => setActiveTab('github')}
            role="tab"
            aria-selected={activeTab === 'github'}
            id="tab-github"
          >
            <svg className="tab-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            GitHub Project Directory
          </button>
          
          <button
            className={`tab-btn ${activeTab === 'drive' ? 'active' : ''}`}
            onClick={() => setActiveTab('drive')}
            role="tab"
            aria-selected={activeTab === 'drive'}
            id="tab-drive"
          >
            <svg className="tab-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <polygon points="12 2 2 22 22 22"></polygon>
            </svg>
            Google Drive SOP Documents
          </button>
        </div>
      </div>

      {activeTab === 'github' && (
        <div className="tab-pane-content">
          <p className="section-subtitle">
            Direktori repositori aktif di bawah organisasi <strong>{appConfig.githubOwner}</strong>.
            Pilih project untuk melihat dokumentasi teknis, SOP, atau halaman portal live.
          </p>

          {/* Control Bar: Search and Filters */}
          <div className="control-bar">
            <div className="search-wrapper">
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Cari repositori, deskripsi, atau bahasa pemrograman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Cari project"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="clear-search-btn"
                  aria-label="Hapus pencarian"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="filter-group">
              {/* Sort Selector */}
              <div className="select-wrapper">
                <select
                  value={sortMethod}
                  onChange={(e) => setSortMethod(e.target.value as any)}
                  className="filter-select"
                  aria-label="Urutkan berdasarkan"
                >
                  <option value="updated">Terakhir Diperbarui</option>
                  <option value="stars">Bintang Terbanyak</option>
                  <option value="name">Nama (A-Z)</option>
                </select>
              </div>

              {/* Fork Toggle */}
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showForks}
                  onChange={(e) => setShowForks(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                Tampilkan Fork
              </label>
            </div>
          </div>

          {/* Main Content Area */}
          {loading && (
            <div className="repos-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="repo-card skeleton-card">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-desc"></div>
                  <div className="skeleton-desc short"></div>
                  <div className="skeleton-footer">
                    <div className="skeleton-badge"></div>
                    <div className="skeleton-btn"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="error-box">
              <div className="error-icon-wrapper">
                <svg
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h4>Gagal Memuat Repositori</h4>
              <p>{error}</p>
              <a
                href={`https://github.com/${appConfig.githubOwner}`}
                target="_blank"
                rel="noopener noreferrer"
                className="primary-btn error-btn"
              >
                Buka Profil GitHub
              </a>
            </div>
          )}

          {!loading && !error && filteredRepos.length === 0 && (
            <div className="empty-box">
              <svg
                viewBox="0 0 24 24"
                width="48"
                height="48"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="empty-icon"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
              <p>Tidak ada repositori yang cocok dengan kata kunci pencarian Anda.</p>
            </div>
          )}

          {!loading && !error && filteredRepos.length > 0 && (
            <div className="repos-container">
              {Object.keys(groupedRepos).sort().map((projectName) => (
                <div key={projectName} className="project-group">
                  <div className="project-group-title">
                    <div className="project-group-header">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                      <h2>{projectName}</h2>
                    </div>
                    <span className="project-repo-count">{groupedRepos[projectName].length} Repositori</span>
                  </div>
                  <div className="repos-grid">
                    {groupedRepos[projectName].map((repo) => {
                      const isSelf = repo.name === appConfig.repoName;
                      const liveUrl = isSelf
                        ? appConfig.portalUrl
                        : repo.homepage;

                      const readmeUrl = `${repo.html_url}#readme`;
                      
                      return (
                        <article key={repo.id} className="repo-card" id={`repo-card-${repo.id}`}>
                          <div className="repo-card-header">
                            <h3 className="repo-name">
                              {repo.name}
                              {repo.fork && <span className="fork-badge">Fork</span>}
                              {repo.archived && <span className="archived-badge">Arsip</span>}
                            </h3>
                            <div className="repo-stats">
                              <span className="stat-item" title="Stars">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="currentColor" strokeWidth="1">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                {repo.stargazers_count}
                              </span>
                              <span className="stat-item" title="Forks">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="6" y1="3" x2="6" y2="15" />
                                  <circle cx="18" cy="6" r="3" />
                                  <circle cx="6" cy="18" r="3" />
                                  <path d="M18 9a9 9 0 0 1-9 9" />
                                </svg>
                                {repo.forks_count}
                              </span>
                            </div>
                          </div>

                          <p className="repo-description">
                            {repo.description || 'Tidak ada deskripsi yang ditambahkan untuk repositori ini.'}
                          </p>

                          <div className="repo-meta">
                            {repo.language && (
                              <span className="repo-language">
                                <span
                                  className="language-dot"
                                  style={{ backgroundColor: getLanguageColor(repo.language) }}
                                ></span>
                                {repo.language}
                              </span>
                            )}
                            <span className="repo-date">Update: {formatDate(repo.updated_at)}</span>
                          </div>

                          <div className="repo-actions">
                            <a
                              href={repo.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="repo-action-btn github-link"
                              id={`btn-github-${repo.id}`}
                            >
                              <span>Code</span>
                            </a>
                            <button
                              onClick={() => handleOpenReadme(repo.name)}
                              className="repo-action-btn doc-link"
                              id={`btn-doc-${repo.id}`}
                              type="button"
                            >
                              <span>SOP & Readme</span>
                            </button>
                            {liveUrl && (
                              <a
                                href={liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="repo-action-btn live-link"
                                id={`btn-live-${repo.id}`}
                              >
                                <span>Live Page</span>
                              </a>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'drive' && (
        <div className="tab-pane-content">
          <div className="drive-sop-container">
            <div className="drive-sop-header">
              <p className="drive-description">
                Menampilkan folder dokumen Standar Operasional Prosedur (SOP) resmi langsung dari Google Drive. 
                Anda juga dapat membuka folder penuh untuk mengunggah atau mengatur file.
              </p>
              <a
                href={appConfig.driveSopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="primary-btn drive-open-btn"
                id="btn-open-drive"
              >
                <span>Buka di Google Drive</span>
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drive-btn-icon"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>

            {driveId ? (
              <div className="drive-iframe-wrapper">
                {/* Fallback spinner inside the iframe wrapper */}
                <div className="drive-iframe-loading">
                  <div className="drive-spinner"></div>
                  <p>Memuat Google Drive...</p>
                </div>
                <iframe
                  src={`https://drive.google.com/embeddedfolderview?id=${driveId}#list`}
                  width="100%"
                  height="650"
                  frameBorder="0"
                  allowFullScreen
                  title="Google Drive SOP Embedded Viewer"
                  className="drive-iframe"
                  style={{ backgroundColor: 'white', colorScheme: 'light' }}
                ></iframe>
              </div>
            ) : (
              <div className="error-box">
                <div className="error-icon-wrapper">
                  <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h4>Folder Tidak Terkonfigurasi</h4>
                <p>Silakan periksa konfigurasi driveSopUrl di file config.json Anda.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </section>

      {/* README Modal rendered via Portal to escape transformed ancestor */}
      {readmeRepo && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div className="readme-modal-overlay" onClick={handleCloseReadme} role="dialog" aria-modal="true">
          <div className="readme-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="readme-modal-header">
              <div className="readme-modal-title-group">
                <svg className="readme-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3>README.md - {readmeRepo}</h3>
              </div>
              <button className="readme-modal-close" onClick={handleCloseReadme} aria-label="Tutup modal">
                &times;
              </button>
            </div>

            <div className="readme-modal-content">
              {readmeLoading && (
                <div className="readme-loading-state">
                  <div className="drive-spinner"></div>
                  <p>Memuat konten dokumentasi...</p>
                </div>
              )}

              {readmeError && (
                <div className="readme-error-state">
                  <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <h4>Gagal Memuat Dokumentasi</h4>
                  <p>{readmeError}</p>
                </div>
              )}

              {!readmeLoading && !readmeError && readmeHtml && (
                <div
                  className="readme-html-content markdown-body"
                  dangerouslySetInnerHTML={{ __html: readmeHtml }}
                />
              )}
            </div>

            <div className="readme-modal-footer">
              <a
                href={`https://github.com/${appConfig.githubOwner}/${readmeRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="repo-action-btn github-link readme-view-github-btn"
              >
                <span>Buka di GitHub</span>
              </a>
              <button className="primary-btn readme-close-btn" onClick={handleCloseReadme}>
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
