import { assert } from "./utils";
import { register, create } from './bios';
register('file-manager-proto',{

})
register('file-manager-local',{
  extends: 'file-manager-proto',
  commands: {
    'file-open-dialog-local': {
      execute({ formats }) {
        return new Promise((resolve, reject) => {
          function readSingleFile(e) {
            console.log('reading file')
            var file = e.target.files[0];
            if (!file) {
              return;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
              var content = e.target.result;
              console.log(file, content);

              resolve({
                content,
                file: {
                  ...file,
                  fid: "/local/" + file.name,
                }
              })
            };
            reader.readAsText(file);
          }
          const input = document.createElement('input');
          input.type = "file";
          input.addEventListener('change', readSingleFile, true);
          input.click();
        })
      }
    }
  }
})

register('file-manager-local-only',{
  extends: 'file-manager-local',
  commands: {
    'file-open-dialog': {
      execute({ formats }) {
        return this.call('file-open-dialog-local',{ formats });
      }
    }
  }
})
