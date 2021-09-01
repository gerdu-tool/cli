jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'group').mockImplementation(() => {});
jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
jest.spyOn(console, 'table').mockImplementation(() => {});
