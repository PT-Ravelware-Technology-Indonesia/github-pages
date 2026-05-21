import rawConfig from '../../config.json';

export interface AppConfig {
  githubOwner: string;
  repoName: string;
  ownerType: 'user' | 'org';
  departmentName: string;
  projectUrl: string;
  kumaUrl: string;
  portalUrl: string;
  driveSopUrl: string;
  githubToken: string;
}

const DEFAULT_CONFIG: AppConfig = {
  githubOwner: 'PT-Ravelware-Technology-Indonesia',
  repoName: 'github-pages',
  ownerType: 'org',
  departmentName: 'Software Development',
  projectUrl: '',
  kumaUrl: 'https://kuma.ravelware.cloud',
  portalUrl: 'https://PT-Ravelware-Technology-Indonesia.github.io/github-pages/',
  driveSopUrl: 'https://drive.google.com/drive/folders/1NuEWMGEEsTCbarTOqAXuZUe1ZWGxRJXz',
  githubToken: '',
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
  driveSopUrl: rawConfig.driveSopUrl?.trim() || DEFAULT_CONFIG.driveSopUrl,
  githubToken: process.env.PORTAL_GITHUB_TOKEN || process.env.GITHUB_TOKEN || (rawConfig as any).githubToken?.trim() || DEFAULT_CONFIG.githubToken,
};
