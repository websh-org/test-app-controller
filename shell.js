import { AppController } from "@websh/app-controller";

const iframe = document.getElementById('iframe');
const url = "app.html";

(async function test() {
  const app = window.app = new AppController({iframe,url});
  await app.load();
  console.log('manifest',app.manifest)
})();

