import { assert } from "./utils";
import { register, create } from './bios';

import "./app-controller";
import "./file-manager";

register('single-app-shell', {
  init({ iframe, fm }) {
    this.iframe = iframe;
    this.fm = fm;
  },
  readonly: {
    app: null
  },
  commands: {
    'open-app': {
      async execute({ url, type = "", args = {} }) {
        this.app = create("app-controller-file " + type, { iframe: this.iframe, url, ...args });
        await this.app.call('load');
        return this.app;
      }
    }
  }
})

register('single-app-desktop', {
  extends: 'single-app-shell',
  init() {
    this.fm = create('file-manager-local-only');
  },
  commands: {
    'desktop-open-app': {
      async execute({ url }) {
        const app = await this.call('open-app', { url, type: 'desktop-window', args: { fm: this.fm } });
      }
    }
  }
})

/*
const shell = router();
shell.use('app $app ...$rest', ({$app,$rest})=> {
  return this.apps[app].route($rest);
})

shell.use('app $app file open', ({$app}) => {

})

shell.use('app $app file open $pid',({$app}){
  
})
*/