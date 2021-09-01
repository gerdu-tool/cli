import fs from '@app/helpers/fs';
import path from '@app/helpers/path';
import messages from '@app/messages';
import faker from '@test/__utils__/faker';
import workspaceSchema from '@app/schema/workspace-schema';

describe('workspace-schema', () => {
  const mapping = faker.createMapping();
  const chart = faker.createChart({ mappings: [mapping] });
  const profile = faker.createProfile();
  const workspace = faker.createWorkspace({ charts: [chart], profiles: [profile], path: path.resolve('./workspaces/ws-1') });
  const wsPath = workspace.path;
  const filePath = path.resolve(`${wsPath}/.gerdu.yaml`);
  const chartSchema = ({
    ...chart,
    stages: chart.stages.reduce((c, s) => ({ ...c, [s.stage]: s.script }), {}),
    mappings: chart.mappings.reduce((c, p) => ({ ...c, [p.name]: p }), {}),
  });
  const schemaWorkspace = ({
    ...workspace,
    path: undefined,
    charts: workspace.charts.map((s) => `${s.name}.yaml`),
    profiles: workspace.profiles.reduce((c, p) => ({ ...c, [p.name]: p.services }), {}),
  });
  describe('get', () => {
    beforeEach(() => {
      fs.exists.mockImplementation(() => true);
      fs.readAllYaml.mockImplementation((p) => (p === filePath ? schemaWorkspace : chartSchema));
    });
    it('returns config', () => {
      expect(workspaceSchema.get(filePath)).toMatchObject(workspace);
    });
    it('raise if name is not provided', () => {
      fs.readAllYaml.mockImplementation(() => ({ ...schemaWorkspace, name: undefined, charts: [] }));
      expect(() => workspaceSchema.get(filePath)).toThrowError(messages.schemaPropMissing(filePath, 'name'));

      fs.readAllYaml.mockImplementation(() => ({ ...schemaWorkspace, name: null, charts: [] }));
      expect(() => workspaceSchema.get(filePath)).toThrowError(messages.schemaPropMissing(filePath, 'name'));
    });
    it('raise if schema file is invalid', () => {
      fs.readAllYaml.mockImplementation(() => null);
      expect(() => workspaceSchema.get(filePath)).toThrowError(messages.schemaParseError(filePath));
    });
    it('returns empty compose if not provided', () => {
      fs.readAllYaml.mockImplementation(() => ({ ...chart, compose: undefined }));
      fs.readAllYaml.mockImplementationOnce(() => ({ ...schemaWorkspace, compose: undefined }));
      expect(workspaceSchema.get(filePath).compose).toMatchObject({ version: '3.9' });
    });
    it('returns empty charts if not provided', () => {
      fs.readAllYaml.mockImplementation(() => ({ ...schemaWorkspace, charts: undefined }));
      expect(workspaceSchema.get(filePath).charts).toMatchObject([]);
    });
    describe('profiles', () => {
      it('returns empty array if not provided', () => {
        fs.readAllYaml.mockImplementation(() => ({ ...schemaWorkspace, charts: [], profiles: undefined }));
        expect(workspaceSchema.get(filePath).profiles).toMatchObject([]);
      });
      it('returns empty array of services if not provided', () => {
        fs.readAllYaml.mockImplementation(() => ({ ...schemaWorkspace, charts: [], profiles: { [profile.name]: undefined } }));
        expect(workspaceSchema.get(filePath).profiles[0].services).toMatchObject([]);
      });
    });
  });
});
