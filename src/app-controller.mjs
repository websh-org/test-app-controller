import { assert } from "./utils";
import { register, overload, create } from './bios';
import { RemoteMasterPort } from "@websh/remote-master-port";
import "./app-api";


// Ensures that apis send correctly prefixed commands

function apiPortProxy(aid, port) {
  return {
    send: (cmd, ...args) => port.send(aid + '-' + cmd, ...args),
    request: (cmd, ...args) => port.request(aid + '-' + cmd, ...args),
    on: (event, ...args) => port.request(aid + '-' + event, ...args)
  }
}

register('app-controller', {
  readonly: {
    manifest: {},
    api: {},
  },
  self: {
    send(cmd, args = {}, transfer = []) {
      this.masterPort.send(cmd, args, transfer);
    },
    request(cmd, args = {}, transfer = []) {
      return this.masterPort.request(cmd, args, transfer);
    },
    on(event, fn) {
      this.masterPort.on(event, fn);
    },
    mountApi(aid) {
      const manifest = this.manifest;
      if (manifest.api[aid]) {
        this.api[aid] = create('app-api-' + aid, {
          port: apiPortProxy(aid, this.masterPort),
          manifest: manifest.api[aid]
        })
      }
    },
  },
  methods: {
    apiCall(aid, ...args) {
      assert(this.loaded, "app-not-loaded");
      assert(this.api[aid], "app-api-not-supported");
      try {
        return this.api[aid].call(...args);
      } catch (error) {
        assert(false, "app-call-failed");
      }
    }
  },
  on: {
    didLoad({ manifest }) {
      this.manifest = manifest;
    }
  },
  init({ iframe, url, debug = false }) {
    this.iframe = iframe;
    this.debug = debug;
    const parsed = new URL(url, location.href);
    this.url = parsed.href;
    this.origin = parsed.origin;
    this.masterPort = new RemoteMasterPort('SOUTH-TOOTH', iframe, { origin: this.origin, debug: this.debug });
    this.loaded = false;
    this.connected = false;
  },
  commands: {
    'load': {
      async execute() {
        assert(!this.loaded, "app-already-loaded");
        const promise = new Promise(async (resolve, reject) => {
          this.iframe.onload = async () => {
            this.loaded = true;
            this.iframe.onload = null;
            try {
              const manifest = await this.masterPort.connect();
              await this.didLoad({ manifest });
              this.connected = true;
              resolve(manifest);
            } catch (err) {
              reject(err);
            }
          }
        })
        this.iframe.removeAttribute('srcdoc');
        this.iframe.src = this.url;
        return promise;
      }
    },
    'close': {
      execute() {
        return new Promise(async (resolve, reject) => {
          const timeout = setTimeout(
            async () => {
              reject(new Error("app-close-timeout"));
            },
            5000
          );
          try {
            await this.request('app-close');
            clearTimeout(timeout);
            this.unload();
            resolve();
          } catch (error) {
            clearTimeout(timeout);
            reject(error);
          }
        })
      }
    },
    'unload': {
      async execute() {
        this.iframe.removeAttribute('src');
        this.iframe.srcdoc = "Not loaded";
        await this.masterPort.disconnect();
        this.connected = false;
        this.loaded = false;
      }
    }
  }
})

register('app-controller-test', {
  extends: 'app-controller',
  on: {
    didLoad() {
      this.mountApi('test');
    }
  }
})

register('app-controller-file',{
  extends: 'app-controller',
  on: {
    didLoad() {
      this.mountApi('file');
    },
  },
  commands: {
    'file-set': {
      async execute({file,format,content}) {
        return await this.api.file.call('open', { file, format, content })
      }
    },
    'file-get': {
      async execute({file}) {
        return await this.api.file.call('save', { file, format })
      }
    },
  }
})

register('desktop-window', {

})

overload('app-controller-file desktop-window', {
  init({fm}) {
    this.fm = fm;
  },
  commands: {
    'file-open': {
      async execute() {
        const { file, format, content } = await this.fm.call('file-open-dialog', { formats: this.fileFormats });
        return await this.call('file-set', { file, format, content });
      }
    }
  }
})