import child from 'child_process';
import EventEmitter from 'events';

jest.spyOn(child, 'spawn').mockImplementation(() => ({
  stdout: new EventEmitter(),
  stderr: new EventEmitter(),
  stdin: {
    write: jest.fn(),
  },
}));
