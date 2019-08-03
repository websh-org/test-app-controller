import { create } from "./src/bios";
import "./src/single-app-shell";

const iframe = document.getElementById('iframe');
const output = document.getElementById('log');
const url = "app.html";


const shell = window.shell = create('single-app-desktop', { iframe });

function log(head, ...args) {
  output.innerHTML += `<b>${head}</b> ` + args.map(x=>JSON.stringify(x, null, 2)).join(" ") + "\n";
}
function logError(...args) {
  console.error(...args);
  output.innerHTML += `<i>ERROR</i> ` + args.map(x=>JSON.stringify(x, null, 2)).join(" ") + "\n";
}

async function testRequest(cmd, args) {
  log('requesting:', cmd, args);
  try {
    var res = await shell.app.call(cmd, args);
    log('result:', res);
    return res;
  } catch (error) {
    logError(error.message)
  }
}


const tests = {
  async load() {
    await shell.call('desktop-open-app',{url});
    log('manifest', shell.app.manifest)
  },
  ping() {
    return testRequest('test-ping');
  },
  echo() {
    return testRequest('test-echo', "must be same");
  },
  log() {
    return testRequest('test-log', "must be logged by the app");
  },
  open() {
    return testRequest('file-open', {});
  },
  save() {
    return testRequest('file', 'save', {
      format: "text",
      saveContent({ content, type }) {
        log("save content",type,content);
        return { type, format:"text"}
      }
    });
  },
  async close() {
    await app.call('app','close');
  },
  async unload() {
    await app.call('app','unload');
  },
}
const header = document.getElementById('header');
for (const test in tests) {
  const button = document.createElement('button');
  button.onclick = tests[test];
  button.innerText = test;
  header.appendChild(button);
}


