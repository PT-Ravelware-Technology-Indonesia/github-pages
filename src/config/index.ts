import rawConfig from '../../config.json';

export interface AppConfig {
  githubOwner: string;
  repoName: string;
  ownerType: 'user' | 'org';
  departmentName: string;
  projectUrl: string;
  kumaUrl: string;
  portalUrl: string;
}

const DEFAULT_CONFIG: AppConfig = {
  githubOwner: 'Fyudaz-Apps',
  repoName: 'github-pages',
  ownerType: 'org',
  departmentName: 'IT Software Development',
  projectUrl: '',
  kumaUrl: 'https://kuma.ravelware.cloud',
  portalUrl: 'https://Fyudaz-Apps.github.io/github-pages/',
};

export const appConfig: AppConfig = {
  githubOwner: rawConfig.githubOwner?.trim() || DEFAULT_CONFIG.githubOwner,
  repoName: rawConfig.repoName?.trim() || DEFAULT_CONFIG.repoName,
  ownerType: (rawConfig.ownerType === 'user' || rawConfig.ownerType === 'org')
    ? rawConfig.ownerType
    : DEFAULT_CONFIG.ownerType,
  departmentName: rawConfig.departmentName?.trim() || DEFAULT_CONFIG.departmentName,
  projectUrl: rawConfig.projectUrl?.trim() || DEFAULT_CONFIG.projectUrl,
  kumaUrl: rawConfig.kumaUrl?.trim() || DEFAULT_CONFIG.kumaUrl,
  portalUrl: rawConfig.portalUrl?.trim() || DEFAULT_CONFIG.portalUrl,
};
