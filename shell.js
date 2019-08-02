import { AppController } from "@websh/app-controller";

const iframe = document.getElementById('iframe');
const output = document.getElementById('log');
const url = "app.html";



(async () => {
  function log(head,...args) {
    output.innerHTML+=`<b>${head}</b> `+args.map(JSON.stringify.bind(JSON),null,2).join(" ")+"\n";
  }
  function logError(...args) {
    output.innerHTML+=`<i>ERROR</i> `+args.map(JSON.stringify.bind(JSON),null,2).join(" ")+"\n";
  }

  async function testRequest(cmd,args) {
    log('requesting:',cmd,args);
    try {
      var res = await app.request(cmd,args);
      log('result:',res);
      return res;
    } catch (error) {
      logError(error.message)
    }
  }
  

  const app = new AppController({iframe,url});
  window.tests = {
    async load() {
      await app.load();
      log('manifest',app.manifest)
    },
    ping() {
      return testRequest('test-ping');
    },
    echo() {
      return testRequest('test-echo',"must be same");
    },
    log() {
      return testRequest('test-log',"must be logged by the app");
    },
    async close() {
      await app.close();
    },
    async unload() {
      await app.unload();
    },
  }
})();

