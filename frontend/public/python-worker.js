let runtime;
self.onmessage = async ({data}) => {
 try {
  if(!runtime){importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');runtime=await loadPyodide();}
  let output='';
  runtime.setStdout({batched:s=>{output+=s+'\n';if(output.length>20000)throw Error('Output limit exceeded');}});
  runtime.setStderr({batched:s=>{output+=s+'\n';if(output.length>20000)throw Error('Output limit exceeded');}});
  const globals=runtime.toPy({});
  try {await runtime.runPythonAsync(data.code,{globals});if(data.checks){await runtime.runPythonAsync(data.checks,{globals});}}finally{globals.destroy();}
  self.postMessage({output});
 }catch(e){self.postMessage({error:String(e)});}
};
