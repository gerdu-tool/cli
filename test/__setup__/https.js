import https from 'https';

jest.spyOn(https, 'get').mockImplementation((url, cb) => {
  cb({ on: jest.fn() });
  return { on: jest.fn() };
});
