let runtime;
self.onmessage = async ({data}) => {
 let output='';
 try {
  if(!runtime){importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');runtime=await loadPyodide();}
  const write=s=>{output+=s+'\n';if(output.length>20000)throw Error('Output limit exceeded');};
  runtime.setStdout({batched:write});runtime.setStderr({batched:write});
  const globals=runtime.toPy({});
  try {
   if(data.gameState){globals.set('_pv_initial_json',JSON.stringify(data.gameState));const response=await fetch('/game-api.py');if(!response.ok)throw Error('Game API unavailable');await runtime.runPythonAsync(await response.text(),{globals});}
   if(data.stdin!==undefined){globals.set('_pv_input',String(data.stdin));await runtime.runPythonAsync('import builtins\ninput = lambda prompt="": _pv_input',{globals});}
   await runtime.runPythonAsync(data.code,{globals});
   if(data.checks)await runtime.runPythonAsync(data.checks,{globals});
   let commands=[],predicted=null;
   if(data.gameState){const result=JSON.parse(runtime.runPython('_pv_json.dumps({"commands":_pv_commands,"state":_pv_state})',{globals}));commands=result.commands;predicted=result.state;}
   self.postMessage({output,commands,predicted});
  }finally{globals.destroy();}
 }catch(e){self.postMessage({output,error:String(e)});}
};
