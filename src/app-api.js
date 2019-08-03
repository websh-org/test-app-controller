import { register } from './bios';
import { assert } from './utils.mjs';

register("app-api", {
  init({ port, manifest }) {
    this.port = port;
    this.manifest = manifest;
  },
  readonly: {
    manifest: {}
  },
  self: {
    request(command, args) {
      return this.port.request(command,args);
    },
    send(command, args) {
      return this.port.send(command,args);
    }
  }
});


register("app-api-file", {
  extends: "app-api",
  readonly: {
    currentFile: null
  },
  commands: {
    "open": {
      async execute({ file, content }) {
        const { format, type, extension } = file;
        await this.request(
          "open",
          { format, type, extension, content },
          "OK"
        );
        this.currentFile = file;
      }
    },
    "save": {
      async execute({ saveContent }) {
        assert(this.currentFile, "file-no-current-file");
        this.call('save-as',{saveContent,file:this.currentFile})
      }
    },
    "save-as": {
      async execute({ file , saveContent }) {
        const { format, extension, type } = file;
        const {content} = await this.request("save", {
          format,
          extension,
          type
        });
        this.currentFile = await saveContent({content});
      }
    }
  }
});

register("app-api-test", {
  extends: "app-api",
  commands: {
    "ping":{
      execute (...args) {
        return this.request("ping",...args);
      },
    },
    "echo":{
      execute (...args) {
        return this.request("echo",...args);
      },
    },
    "log":{
      execute (...args) {
        return this.send("echo",...args);
      },
    }
  }
});
