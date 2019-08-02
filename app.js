import { WebShellApp } from "@websh/web-shell-app";

WebShellApp.manifest({
  name:"Test App",
  api: {
    
  }
})
.command('test-ping', () => 'pong')
.command('test-log', (args) => { console.log(args) })
.command('test-echo', (args) => args)
.command('app-close', () => { throw new Error("app-close-wait") })