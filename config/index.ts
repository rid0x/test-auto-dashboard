import { ProjectConfig, ProjectName } from '../src/core/types/project.types';
import { getpriceConfig } from './getprice.config';
import { willsoorConfig } from './willsoor.config';
import { pieceofcaseConfig } from './pieceofcase.config';
import { szpakiConfig } from './4szpaki.config';
import { moncredoConfig } from './moncredo.config';
import { pierrereneConfig } from './pierrerene.config';
import { abazurConfig } from './abazur.config';
import { cornetteConfig } from './cornette.config';
import { enteloConfig } from './entelo.config';
import { distriparkConfig } from './distripark.config';
import { elakiernikConfig } from './elakiernik.config';

const projectConfigs: Record<ProjectName, ProjectConfig> = {
  getprice: getpriceConfig,
  willsoor: willsoorConfig,
  pieceofcase: pieceofcaseConfig,
  '4szpaki': szpakiConfig,
  moncredo: moncredoConfig,
  pierrerene: pierrereneConfig,
  abazur: abazurConfig,
  cornette: cornetteConfig,
  entelo: enteloConfig,
  distripark: distriparkConfig,
  elakiernik: elakiernikConfig,
};

export function getProjectConfig(name: ProjectName): ProjectConfig {
  const config = projectConfigs[name];
  if (!config) {
    throw new Error(`Unknown project: ${name}. Available: ${Object.keys(projectConfigs).join(', ')}`);
  }
  return config;
}

export function getActiveProject(): ProjectName {
  const project = process.env.PROJECT as ProjectName;
  if (!project || !projectConfigs[project]) {
    throw new Error(
      `PROJECT env var must be set to one of: ${Object.keys(projectConfigs).join(', ')}. ` +
      `Got: "${project}"`
    );
  }
  return project;
}

export { getpriceConfig, willsoorConfig, pieceofcaseConfig, szpakiConfig, moncredoConfig, pierrereneConfig, abazurConfig, cornetteConfig, enteloConfig, distriparkConfig, elakiernikConfig };
