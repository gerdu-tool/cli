import fs from '@app/helpers/fs';
import path from '@app/helpers/path';
import messages from '@app/messages';
import faker from '@test/__utils__/faker';
import chartSchema from '@app/schema/chart-schema';

describe('chart-schema', () => {
  const mapping = faker.createMapping();
  const chart = faker.createChart({ mappings: [mapping] });
  const filePath = path.resolve('./workspaces/ws-1', `${chart.name}.yaml`);
  const profile = faker.createProfile();
  const schema = ({
    ...chart,
    stages: chart.stages.reduce((c, s) => ({ ...c, [s.stage]: s.script }), {}),
    mappings: chart.mappings.reduce((c, p) => ({ ...c, [p.name]: p }), {}),
  });
  describe('get', () => {
    beforeEach(() => {
      fs.exists.mockImplementation(() => true);
      fs.readAllYaml.mockImplementation(() => schema);
    });
    it('returns config', () => {
      expect(chartSchema.get(filePath)).toMatchObject(chart);
    });
    it('raise if schema file is invalid', () => {
      fs.readAllYaml.mockImplementation(() => null);
      expect(() => chartSchema.get(filePath)).toThrowError(messages.schemaParseError(filePath));
    });
    it('raise error if chart name not provided', () => {
      fs.readAllYaml.mockImplementation(() => ({ ...chart, name: undefined }));
      expect(() => chartSchema.get(filePath)).toThrowError(messages.schemaPropMissing(filePath, 'chart.name'));
    });
    it('return false if chart repo not provided', () => {
      fs.readAllYaml.mockImplementation(() => ({ ...chart, repo: undefined }));
      expect(chartSchema.get(filePath).repo).toBeFalsy();
    });
    it('raise error if chart repo.git not provided', () => {
      fs.readAllYaml.mockImplementation(() => ({ ...chart, repo: { ...chart.repo, git: undefined } }));
      expect(() => chartSchema.get(filePath)).toThrowError(messages.schemaPropMissing(filePath, 'chart.repo.git'));
    });
    it('returns name as output if not provided', () => {
      fs.readAllYaml.mockImplementation(() => ({ ...chart, repo: { ...chart.repo, output: undefined } }));
      expect(chartSchema.get(filePath).repo.output).toBe(chart.name);
    });
    it('returns empty compose if not provided', () => {
      fs.readAllYaml.mockImplementation(() => ({ ...chart, compose: undefined }));
      expect(chartSchema.get(filePath).compose).toMatchObject({ version: '3.9' });
    });
    it('raise if schema file is invalid', () => {
      fs.readAllYaml.mockImplementation(() => null);
      expect(() => chartSchema.get(filePath)).toThrowError(messages.schemaParseError(filePath));
    });
    describe('stages', () => {
      it('returns empty array if not provided', () => {
        fs.readAllYaml.mockImplementation(() => ({ ...chart, stages: undefined }));
        expect(chartSchema.get(filePath).stages).toMatchObject([]);
      });
      it('returns empty array of scripts if not provided', () => {
        fs.readAllYaml.mockImplementation(() => ({ ...chart, stages: { pull: undefined } }));
        expect(chartSchema.get(filePath).stages[0].script).toMatchObject([]);
      });
    });
    describe('mappings', () => {
      it('returns empty array if not provided', () => {
        fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: undefined }));
        expect(chartSchema.get(filePath).mappings).toMatchObject([]);
      });
      it('raise if mapping host is missing', () => {
        fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, host: undefined } } }));
        expect(() => chartSchema.get(filePath)).toThrowError(messages.schemaPropMissing(filePath, 'chart.mapping.host'));
      });
      it('raise if mapping port is missing', () => {
        fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, port: undefined } } }));
        expect(() => chartSchema.get(filePath)).toThrowError(messages.schemaPropMissing(filePath, 'chart.mapping.port'));
      });
      it('raise if mapping service is missing', () => {
        fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, service: undefined } } }));
        expect(() => chartSchema.get(filePath)).toThrowError(messages.schemaPropMissing(filePath, 'chart.mapping.service'));
      });
      it('returns "/" as default for path', () => {
        fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, path: undefined } } }));
        expect(chartSchema.get(filePath).mappings[0].path).toBe('/');
      });
      describe('cors', () => {
        it('returns false, if cors not provided', () => {
          fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, cors: undefined } } }));
          expect(chartSchema.get(filePath).mappings[0].cors).toBeFalsy();
        });
        it('returns false sa default for allowCredentials, if not profivded', () => {
          fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, cors: { } } } }));
          expect(chartSchema.get(filePath).mappings[0].cors.allowCredentials).toBeFalsy();
        });
        it('returns default for allowOrigins, if not provided', () => {
          fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, cors: { } } } }));
          expect(chartSchema.get(filePath).mappings[0].cors.allowOrigins).toBe('*');
        });
        it('returns joined string for allowOrigins, if array provided', () => {
          fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, cors: { allowOrigins: ['x', 'y', 'z'] } } } }));
          expect(chartSchema.get(filePath).mappings[0].cors.allowOrigins).toBe('x,y,z');
        });
        it('returns joined string for allowOrigins, if object provided', () => {
          fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, cors: { allowOrigins: { x: null, y: null, z: null } } } } }));
          expect(chartSchema.get(filePath).mappings[0].cors.allowOrigins).toBe('x,y,z');
        });

        it('returns default for allowHeaders, if not provided', () => {
          fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, cors: { } } } }));
          expect(chartSchema.get(filePath).mappings[0].cors.allowHeaders).toBe('Content-Type,Authorization');
        });
        it('returns joined string for allowHeaders, if array provided', () => {
          fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, cors: { allowHeaders: ['x', 'y', 'z'] } } } }));
          expect(chartSchema.get(filePath).mappings[0].cors.allowHeaders).toBe('x,y,z');
        });
        it('returns joined string for allowHeaders, if object provided', () => {
          fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, cors: { allowHeaders: { x: null, y: null, z: null } } } } }));
          expect(chartSchema.get(filePath).mappings[0].cors.allowHeaders).toBe('x,y,z');
        });

        it('returns default for allowMethods, if not provided', () => {
          fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, cors: { } } } }));
          expect(chartSchema.get(filePath).mappings[0].cors.allowMethods).toBe('GET,PUT,POST,PATCH,DELETE,OPTIONS');
        });
        it('returns joined string for allowMethods, if array provided', () => {
          fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, cors: { allowMethods: ['x', 'y', 'z'] } } } }));
          expect(chartSchema.get(filePath).mappings[0].cors.allowMethods).toBe('x,y,z');
        });
        it('returns joined string for allowMethods, if object provided', () => {
          fs.readAllYaml.mockImplementation(() => ({ ...chart, mappings: { [profile.name]: { ...mapping, cors: { allowMethods: { x: null, y: null, z: null } } } } }));
          expect(chartSchema.get(filePath).mappings[0].cors.allowMethods).toBe('x,y,z');
        });
      });
    });
  });
});
