import rawConfig from '../../config.json';

export interface SopItem {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
}

export interface AppConfig {
  githubOwner: string;
  repoName: string;
  ownerType: 'user' | 'org';
  departmentName: string;
  projectUrl: string;
  kumaUrl: string;
  portalUrl: string;
  sops: SopItem[];
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
  sops: [
    {
      id: "sop-1",
      name: "SOP Google Drive Ravelware",
      description: "Dokumen standar operasional prosedur untuk tim di dalam folder Google Drive terpusat.",
      url: "https://drive.google.com/drive/folders/1NuEWMGEEsTCbarTOqAXuZUe1ZWGxRJXz",
      category: "Drive Folder"
    }
  ],
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
  sops: rawConfig.sops || DEFAULT_CONFIG.sops,
  githubToken: process.env.NEXT_PUBLIC_GITHUB_TOKEN || rawConfig.githubToken?.trim() || DEFAULT_CONFIG.githubToken,
};
