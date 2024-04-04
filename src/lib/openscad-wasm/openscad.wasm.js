var Module = typeof OpenSCAD !== 'undefined' ? OpenSCAD : {}
var objAssign = Object.assign
var moduleOverrides = objAssign({}, Module)
var arguments_ = []
var thisProgram = './this.program'
var quit_ = (status, toThrow) => {
  throw toThrow
}
var ENVIRONMENT_IS_WEB = typeof window === 'object'
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function'
var ENVIRONMENT_IS_NODE =
  typeof process === 'object' &&
  typeof process.versions === 'object' &&
  typeof process.versions.node === 'string'
var scriptDirectory = ''
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory)
  }
  return scriptDirectory + path
}
var read_, readAsync, readBinary, setWindowTitle
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = self.location.href
  } else if (typeof document !== 'undefined' && document.currentScript) {
    scriptDirectory = document.currentScript.src
  }
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(
      0,
      scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/') + 1
    )
  } else {
    scriptDirectory = ''
  }
  {
    read_ = (url) => {
      var xhr = new XMLHttpRequest()
      xhr.open('GET', url, false)
      xhr.send(null)
      return xhr.responseText
    }
    if (ENVIRONMENT_IS_WORKER) {
      readBinary = (url) => {
        var xhr = new XMLHttpRequest()
        xhr.open('GET', url, false)
        xhr.responseType = 'arraybuffer'
        xhr.send(null)
        return new Uint8Array(xhr.response)
      }
    }
    readAsync = (url, onload, onerror) => {
      var xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'arraybuffer'
      xhr.onload = () => {
        if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
          onload(xhr.response)
          return
        }
        onerror()
      }
      xhr.onerror = onerror
      xhr.send(null)
    }
  }
  setWindowTitle = (title) => (document.title = title)
} else {
}
var out = Module['print'] || console.log.bind(console)
var err = Module['printErr'] || console.warn.bind(console)
objAssign(Module, moduleOverrides)
moduleOverrides = null
if (Module['arguments']) arguments_ = Module['arguments']
if (Module['thisProgram']) thisProgram = Module['thisProgram']
if (Module['quit']) quit_ = Module['quit']
var tempRet0 = 0
var setTempRet0 = (value) => {
  tempRet0 = value
}
var getTempRet0 = () => tempRet0
var wasmBinary
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary']
var noExitRuntime = Module['noExitRuntime'] || false
if (typeof WebAssembly !== 'object') {
  abort('no native wasm support detected')
}
var wasmMemory
var ABORT = false
var EXITSTATUS
function assert(condition, text) {
  if (!condition) {
    abort(text)
  }
}
var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined
function UTF8ArrayToString(heap, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead
  var endPtr = idx
  while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr
  if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(heap.subarray(idx, endPtr))
  } else {
    var str = ''
    while (idx < endPtr) {
      var u0 = heap[idx++]
      if (!(u0 & 128)) {
        str += String.fromCharCode(u0)
        continue
      }
      var u1 = heap[idx++] & 63
      if ((u0 & 224) == 192) {
        str += String.fromCharCode(((u0 & 31) << 6) | u1)
        continue
      }
      var u2 = heap[idx++] & 63
      if ((u0 & 240) == 224) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2
      } else {
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63)
      }
      if (u0 < 65536) {
        str += String.fromCharCode(u0)
      } else {
        var ch = u0 - 65536
        str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023))
      }
    }
  }
  return str
}
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ''
}
function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) return 0
  var startIdx = outIdx
  var endIdx = outIdx + maxBytesToWrite - 1
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i)
    if (u >= 55296 && u <= 57343) {
      var u1 = str.charCodeAt(++i)
      u = (65536 + ((u & 1023) << 10)) | (u1 & 1023)
    }
    if (u <= 127) {
      if (outIdx >= endIdx) break
      heap[outIdx++] = u
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx) break
      heap[outIdx++] = 192 | (u >> 6)
      heap[outIdx++] = 128 | (u & 63)
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx) break
      heap[outIdx++] = 224 | (u >> 12)
      heap[outIdx++] = 128 | ((u >> 6) & 63)
      heap[outIdx++] = 128 | (u & 63)
    } else {
      if (outIdx + 3 >= endIdx) break
      heap[outIdx++] = 240 | (u >> 18)
      heap[outIdx++] = 128 | ((u >> 12) & 63)
      heap[outIdx++] = 128 | ((u >> 6) & 63)
      heap[outIdx++] = 128 | (u & 63)
    }
  }
  heap[outIdx] = 0
  return outIdx - startIdx
}
function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
}
function lengthBytesUTF8(str) {
  var len = 0
  for (var i = 0; i < str.length; ++i) {
    var u = str.charCodeAt(i)
    if (u >= 55296 && u <= 57343) u = (65536 + ((u & 1023) << 10)) | (str.charCodeAt(++i) & 1023)
    if (u <= 127) ++len
    else if (u <= 2047) len += 2
    else if (u <= 65535) len += 3
    else len += 4
  }
  return len
}
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1
  var ret = _malloc(size)
  if (ret) stringToUTF8Array(str, HEAP8, ret, size)
  return ret
}
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1
  var ret = stackAlloc(size)
  stringToUTF8Array(str, HEAP8, ret, size)
  return ret
}
function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer)
}
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[buffer++ >> 0] = str.charCodeAt(i)
  }
  if (!dontAddNull) HEAP8[buffer >> 0] = 0
}
function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple)
  }
  return x
}
var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64
function updateGlobalBufferAndViews(buf) {
  buffer = buf
  Module['HEAP8'] = HEAP8 = new Int8Array(buf)
  Module['HEAP16'] = HEAP16 = new Int16Array(buf)
  Module['HEAP32'] = HEAP32 = new Int32Array(buf)
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf)
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf)
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf)
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf)
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf)
}
var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 16777216
var wasmTable
var __ATPRERUN__ = []
var __ATINIT__ = []
var __ATMAIN__ = []
var __ATEXIT__ = []
var __ATPOSTRUN__ = []
var runtimeInitialized = false
var runtimeExited = false
var runtimeKeepaliveCounter = 0
function keepRuntimeAlive() {
  return noExitRuntime || runtimeKeepaliveCounter > 0
}
function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']]
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift())
    }
  }
  callRuntimeCallbacks(__ATPRERUN__)
}
function initRuntime() {
  runtimeInitialized = true
  if (!Module['noFSInit'] && !FS.init.initialized) FS.init()
  FS.ignorePermissions = false
  TTY.init()
  SOCKFS.root = FS.mount(SOCKFS, {}, null)
  callRuntimeCallbacks(__ATINIT__)
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__)
}
function exitRuntime() {
  ___funcs_on_exit()
  callRuntimeCallbacks(__ATEXIT__)
  FS.quit()
  TTY.shutdown()
  runtimeExited = true
}
function postRun() {
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']]
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift())
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__)
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb)
}
function addOnInit(cb) {
  __ATINIT__.unshift(cb)
}
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb)
}
var runDependencies = 0
var runDependencyWatcher = null
var dependenciesFulfilled = null
function getUniqueRunDependency(id) {
  return id
}
function addRunDependency(id) {
  runDependencies++
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies)
  }
}
function removeRunDependency(id) {
  runDependencies--
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies)
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher)
      runDependencyWatcher = null
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled
      dependenciesFulfilled = null
      callback()
    }
  }
}
Module['preloadedImages'] = {}
Module['preloadedAudios'] = {}
function abort(what) {
  {
    if (Module['onAbort']) {
      Module['onAbort'](what)
    }
  }
  what = 'Aborted(' + what + ')'
  err(what)
  ABORT = true
  EXITSTATUS = 1
  what += '. Build with -s ASSERTIONS=1 for more info.'
  var e = new WebAssembly.RuntimeError(what)
  throw e
}
var dataURIPrefix = 'data:application/octet-stream;base64,'
function isDataURI(filename) {
  return filename.startsWith(dataURIPrefix)
}
var wasmBinaryFile
wasmBinaryFile = 'openscad.debug.wasm'
if (!isDataURI(wasmBinaryFile)) {
  wasmBinaryFile = locateFile(wasmBinaryFile)
}
function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary)
    }
    if (readBinary) {
      return readBinary(file)
    } else {
      throw 'both async and sync fetching of the wasm failed'
    }
  } catch (err) {
    abort(err)
  }
}
function getBinaryPromise() {
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch === 'function') {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' })
        .then(function (response) {
          if (!response['ok']) {
            throw "failed to load wasm binary file at '" + wasmBinaryFile + "'"
          }
          return response['arrayBuffer']()
        })
        .catch(function () {
          return getBinary(wasmBinaryFile)
        })
    }
  }
  return Promise.resolve().then(function () {
    return getBinary(wasmBinaryFile)
  })
}
function createWasm() {
  var info = { a: asmLibraryArg }
  function receiveInstance(instance, module) {
    var exports = instance.exports
    Module['asm'] = exports
    wasmMemory = Module['asm']['Ra']
    updateGlobalBufferAndViews(wasmMemory.buffer)
    wasmTable = Module['asm']['Ua']
    addOnInit(Module['asm']['Sa'])
    removeRunDependency('wasm-instantiate')
  }
  addRunDependency('wasm-instantiate')
  function receiveInstantiationResult(result) {
    receiveInstance(result['instance'])
  }
  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise()
      .then(function (binary) {
        return WebAssembly.instantiate(binary, info)
      })
      .then(function (instance) {
        return instance
      })
      .then(receiver, function (reason) {
        err('failed to asynchronously prepare wasm: ' + reason)
        abort(reason)
      })
  }
  function instantiateAsync() {
    if (
      !wasmBinary &&
      typeof WebAssembly.instantiateStreaming === 'function' &&
      !isDataURI(wasmBinaryFile) &&
      typeof fetch === 'function'
    ) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function (response) {
        var result = WebAssembly.instantiateStreaming(response, info)
        return result.then(receiveInstantiationResult, function (reason) {
          err('wasm streaming compile failed: ' + reason)
          err('falling back to ArrayBuffer instantiation')
          return instantiateArrayBuffer(receiveInstantiationResult)
        })
      })
    } else {
      return instantiateArrayBuffer(receiveInstantiationResult)
    }
  }
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance)
      return exports
    } catch (e) {
      err('Module.instantiateWasm callback failed with error: ' + e)
      return false
    }
  }
  instantiateAsync()
  return {}
}
var tempDouble
var tempI64
function callRuntimeCallbacks(callbacks) {
  while (callbacks.length > 0) {
    var callback = callbacks.shift()
    if (typeof callback == 'function') {
      callback(Module)
      continue
    }
    var func = callback.func
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        getWasmTableEntry(func)()
      } else {
        getWasmTableEntry(func)(callback.arg)
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg)
    }
  }
}
var wasmTableMirror = []
function getWasmTableEntry(funcPtr) {
  var func = wasmTableMirror[funcPtr]
  if (!func) {
    if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1
    wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr)
  }
  return func
}
function handleException(e) {
  if (e instanceof ExitStatus || e == 'unwind') {
    return EXITSTATUS
  }
  quit_(1, e)
}
function ___assert_fail(condition, filename, line, func) {
  abort(
    'Assertion failed: ' +
      UTF8ToString(condition) +
      ', at: ' +
      [
        filename ? UTF8ToString(filename) : 'unknown filename',
        line,
        func ? UTF8ToString(func) : 'unknown function'
      ]
  )
}
function ___call_sighandler(fp, sig) {
  getWasmTableEntry(fp)(sig)
}
var _emscripten_get_now
_emscripten_get_now = () => performance.now()
var _emscripten_get_now_is_monotonic = true
function setErrNo(value) {
  HEAP32[___errno_location() >> 2] = value
  return value
}
function _clock_gettime(clk_id, tp) {
  var now
  if (clk_id === 0) {
    now = Date.now()
  } else if ((clk_id === 1 || clk_id === 4) && _emscripten_get_now_is_monotonic) {
    now = _emscripten_get_now()
  } else {
    setErrNo(28)
    return -1
  }
  HEAP32[tp >> 2] = (now / 1e3) | 0
  HEAP32[(tp + 4) >> 2] = ((now % 1e3) * 1e3 * 1e3) | 0
  return 0
}
function ___clock_gettime(a0, a1) {
  return _clock_gettime(a0, a1)
}
function ___cxa_allocate_exception(size) {
  return _malloc(size + 16) + 16
}
function ExceptionInfo(excPtr) {
  this.excPtr = excPtr
  this.ptr = excPtr - 16
  this.set_type = function (type) {
    HEAP32[(this.ptr + 4) >> 2] = type
  }
  this.get_type = function () {
    return HEAP32[(this.ptr + 4) >> 2]
  }
  this.set_destructor = function (destructor) {
    HEAP32[(this.ptr + 8) >> 2] = destructor
  }
  this.get_destructor = function () {
    return HEAP32[(this.ptr + 8) >> 2]
  }
  this.set_refcount = function (refcount) {
    HEAP32[this.ptr >> 2] = refcount
  }
  this.set_caught = function (caught) {
    caught = caught ? 1 : 0
    HEAP8[(this.ptr + 12) >> 0] = caught
  }
  this.get_caught = function () {
    return HEAP8[(this.ptr + 12) >> 0] != 0
  }
  this.set_rethrown = function (rethrown) {
    rethrown = rethrown ? 1 : 0
    HEAP8[(this.ptr + 13) >> 0] = rethrown
  }
  this.get_rethrown = function () {
    return HEAP8[(this.ptr + 13) >> 0] != 0
  }
  this.init = function (type, destructor) {
    this.set_type(type)
    this.set_destructor(destructor)
    this.set_refcount(0)
    this.set_caught(false)
    this.set_rethrown(false)
  }
  this.add_ref = function () {
    var value = HEAP32[this.ptr >> 2]
    HEAP32[this.ptr >> 2] = value + 1
  }
  this.release_ref = function () {
    var prev = HEAP32[this.ptr >> 2]
    HEAP32[this.ptr >> 2] = prev - 1
    return prev === 1
  }
}
function CatchInfo(ptr) {
  this.free = function () {
    _free(this.ptr)
    this.ptr = 0
  }
  this.set_base_ptr = function (basePtr) {
    HEAP32[this.ptr >> 2] = basePtr
  }
  this.get_base_ptr = function () {
    return HEAP32[this.ptr >> 2]
  }
  this.set_adjusted_ptr = function (adjustedPtr) {
    HEAP32[(this.ptr + 4) >> 2] = adjustedPtr
  }
  this.get_adjusted_ptr_addr = function () {
    return this.ptr + 4
  }
  this.get_adjusted_ptr = function () {
    return HEAP32[(this.ptr + 4) >> 2]
  }
  this.get_exception_ptr = function () {
    var isPointer = ___cxa_is_pointer_type(this.get_exception_info().get_type())
    if (isPointer) {
      return HEAP32[this.get_base_ptr() >> 2]
    }
    var adjusted = this.get_adjusted_ptr()
    if (adjusted !== 0) return adjusted
    return this.get_base_ptr()
  }
  this.get_exception_info = function () {
    return new ExceptionInfo(this.get_base_ptr())
  }
  if (ptr === undefined) {
    this.ptr = _malloc(8)
    this.set_adjusted_ptr(0)
  } else {
    this.ptr = ptr
  }
}
var exceptionCaught = []
function exception_addRef(info) {
  info.add_ref()
}
var uncaughtExceptionCount = 0
function ___cxa_begin_catch(ptr) {
  var catchInfo = new CatchInfo(ptr)
  var info = catchInfo.get_exception_info()
  if (!info.get_caught()) {
    info.set_caught(true)
    uncaughtExceptionCount--
  }
  info.set_rethrown(false)
  exceptionCaught.push(catchInfo)
  exception_addRef(info)
  return catchInfo.get_exception_ptr()
}
function ___cxa_call_unexpected(exception) {
  err('Unexpected exception thrown, this is not properly supported - aborting')
  ABORT = true
  throw exception
}
function ___cxa_current_primary_exception() {
  if (!exceptionCaught.length) {
    return 0
  }
  var catchInfo = exceptionCaught[exceptionCaught.length - 1]
  exception_addRef(catchInfo.get_exception_info())
  return catchInfo.get_base_ptr()
}
function ___cxa_free_exception(ptr) {
  return _free(new ExceptionInfo(ptr).ptr)
}
function exception_decRef(info) {
  if (info.release_ref() && !info.get_rethrown()) {
    var destructor = info.get_destructor()
    if (destructor) {
      getWasmTableEntry(destructor)(info.excPtr)
    }
    ___cxa_free_exception(info.excPtr)
  }
}
function ___cxa_decrement_exception_refcount(ptr) {
  if (!ptr) return
  exception_decRef(new ExceptionInfo(ptr))
}
var exceptionLast = 0
function ___cxa_end_catch() {
  _setThrew(0)
  var catchInfo = exceptionCaught.pop()
  exception_decRef(catchInfo.get_exception_info())
  catchInfo.free()
  exceptionLast = 0
}
function ___resumeException(catchInfoPtr) {
  var catchInfo = new CatchInfo(catchInfoPtr)
  var ptr = catchInfo.get_base_ptr()
  if (!exceptionLast) {
    exceptionLast = ptr
  }
  catchInfo.free()
  throw ptr
}
function ___cxa_find_matching_catch_2() {
  var thrown = exceptionLast
  if (!thrown) {
    setTempRet0(0)
    return 0 | 0
  }
  var info = new ExceptionInfo(thrown)
  var thrownType = info.get_type()
  var catchInfo = new CatchInfo()
  catchInfo.set_base_ptr(thrown)
  catchInfo.set_adjusted_ptr(thrown)
  if (!thrownType) {
    setTempRet0(0)
    return catchInfo.ptr | 0
  }
  var typeArray = Array.prototype.slice.call(arguments)
  for (var i = 0; i < typeArray.length; i++) {
    var caughtType = typeArray[i]
    if (caughtType === 0 || caughtType === thrownType) {
      break
    }
    if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
      setTempRet0(caughtType)
      return catchInfo.ptr | 0
    }
  }
  setTempRet0(thrownType)
  return catchInfo.ptr | 0
}
function ___cxa_find_matching_catch_3() {
  var thrown = exceptionLast
  if (!thrown) {
    setTempRet0(0)
    return 0 | 0
  }
  var info = new ExceptionInfo(thrown)
  var thrownType = info.get_type()
  var catchInfo = new CatchInfo()
  catchInfo.set_base_ptr(thrown)
  catchInfo.set_adjusted_ptr(thrown)
  if (!thrownType) {
    setTempRet0(0)
    return catchInfo.ptr | 0
  }
  var typeArray = Array.prototype.slice.call(arguments)
  for (var i = 0; i < typeArray.length; i++) {
    var caughtType = typeArray[i]
    if (caughtType === 0 || caughtType === thrownType) {
      break
    }
    if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
      setTempRet0(caughtType)
      return catchInfo.ptr | 0
    }
  }
  setTempRet0(thrownType)
  return catchInfo.ptr | 0
}
function ___cxa_rethrow() {
  var catchInfo = exceptionCaught.pop()
  if (!catchInfo) {
    abort('no exception to throw')
  }
  var info = catchInfo.get_exception_info()
  var ptr = catchInfo.get_base_ptr()
  if (!info.get_rethrown()) {
    exceptionCaught.push(catchInfo)
    info.set_rethrown(true)
    info.set_caught(false)
    uncaughtExceptionCount++
  } else {
    catchInfo.free()
  }
  exceptionLast = ptr
  throw ptr
}
function ___cxa_throw(ptr, type, destructor) {
  var info = new ExceptionInfo(ptr)
  info.init(type, destructor)
  exceptionLast = ptr
  uncaughtExceptionCount++
  throw ptr
}
function ___cxa_uncaught_exceptions() {
  return uncaughtExceptionCount
}
function ___map_file(pathname, size) {
  setErrNo(63)
  return -1
}
var PATH = {
  splitPath: function (filename) {
    var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
    return splitPathRe.exec(filename).slice(1)
  },
  normalizeArray: function (parts, allowAboveRoot) {
    var up = 0
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i]
      if (last === '.') {
        parts.splice(i, 1)
      } else if (last === '..') {
        parts.splice(i, 1)
        up++
      } else if (up) {
        parts.splice(i, 1)
        up--
      }
    }
    if (allowAboveRoot) {
      for (; up; up--) {
        parts.unshift('..')
      }
    }
    return parts
  },
  normalize: function (path) {
    var isAbsolute = path.charAt(0) === '/',
      trailingSlash = path.substr(-1) === '/'
    path = PATH.normalizeArray(
      path.split('/').filter(function (p) {
        return !!p
      }),
      !isAbsolute
    ).join('/')
    if (!path && !isAbsolute) {
      path = '.'
    }
    if (path && trailingSlash) {
      path += '/'
    }
    return (isAbsolute ? '/' : '') + path
  },
  dirname: function (path) {
    var result = PATH.splitPath(path),
      root = result[0],
      dir = result[1]
    if (!root && !dir) {
      return '.'
    }
    if (dir) {
      dir = dir.substr(0, dir.length - 1)
    }
    return root + dir
  },
  basename: function (path) {
    if (path === '/') return '/'
    path = PATH.normalize(path)
    path = path.replace(/\/$/, '')
    var lastSlash = path.lastIndexOf('/')
    if (lastSlash === -1) return path
    return path.substr(lastSlash + 1)
  },
  extname: function (path) {
    return PATH.splitPath(path)[3]
  },
  join: function () {
    var paths = Array.prototype.slice.call(arguments, 0)
    return PATH.normalize(paths.join('/'))
  },
  join2: function (l, r) {
    return PATH.normalize(l + '/' + r)
  }
}
function getRandomDevice() {
  if (typeof crypto === 'object' && typeof crypto['getRandomValues'] === 'function') {
    var randomBuffer = new Uint8Array(1)
    return function () {
      crypto.getRandomValues(randomBuffer)
      return randomBuffer[0]
    }
  } else
    return function () {
      abort('randomDevice')
    }
}
var PATH_FS = {
  resolve: function () {
    var resolvedPath = '',
      resolvedAbsolute = false
    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = i >= 0 ? arguments[i] : FS.cwd()
      if (typeof path !== 'string') {
        throw new TypeError('Arguments to path.resolve must be strings')
      } else if (!path) {
        return ''
      }
      resolvedPath = path + '/' + resolvedPath
      resolvedAbsolute = path.charAt(0) === '/'
    }
    resolvedPath = PATH.normalizeArray(
      resolvedPath.split('/').filter(function (p) {
        return !!p
      }),
      !resolvedAbsolute
    ).join('/')
    return (resolvedAbsolute ? '/' : '') + resolvedPath || '.'
  },
  relative: function (from, to) {
    from = PATH_FS.resolve(from).substr(1)
    to = PATH_FS.resolve(to).substr(1)
    function trim(arr) {
      var start = 0
      for (; start < arr.length; start++) {
        if (arr[start] !== '') break
      }
      var end = arr.length - 1
      for (; end >= 0; end--) {
        if (arr[end] !== '') break
      }
      if (start > end) return []
      return arr.slice(start, end - start + 1)
    }
    var fromParts = trim(from.split('/'))
    var toParts = trim(to.split('/'))
    var length = Math.min(fromParts.length, toParts.length)
    var samePartsLength = length
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i
        break
      }
    }
    var outputParts = []
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push('..')
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength))
    return outputParts.join('/')
  }
}
var TTY = {
  ttys: [],
  init: function () {},
  shutdown: function () {},
  register: function (dev, ops) {
    TTY.ttys[dev] = { input: [], output: [], ops: ops }
    FS.registerDevice(dev, TTY.stream_ops)
  },
  stream_ops: {
    open: function (stream) {
      var tty = TTY.ttys[stream.node.rdev]
      if (!tty) {
        throw new FS.ErrnoError(43)
      }
      stream.tty = tty
      stream.seekable = false
    },
    close: function (stream) {
      stream.tty.ops.flush(stream.tty)
    },
    flush: function (stream) {
      stream.tty.ops.flush(stream.tty)
    },
    read: function (stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60)
      }
      var bytesRead = 0
      for (var i = 0; i < length; i++) {
        var result
        try {
          result = stream.tty.ops.get_char(stream.tty)
        } catch (e) {
          throw new FS.ErrnoError(29)
        }
        if (result === undefined && bytesRead === 0) {
          throw new FS.ErrnoError(6)
        }
        if (result === null || result === undefined) break
        bytesRead++
        buffer[offset + i] = result
      }
      if (bytesRead) {
        stream.node.timestamp = Date.now()
      }
      return bytesRead
    },
    write: function (stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60)
      }
      try {
        for (var i = 0; i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i])
        }
      } catch (e) {
        throw new FS.ErrnoError(29)
      }
      if (length) {
        stream.node.timestamp = Date.now()
      }
      return i
    }
  },
  default_tty_ops: {
    get_char: function (tty) {
      if (!tty.input.length) {
        var result = null
        if (typeof window != 'undefined' && typeof window.prompt == 'function') {
          result = window.prompt('Input: ')
          if (result !== null) {
            result += '\n'
          }
        } else if (typeof readline == 'function') {
          result = readline()
          if (result !== null) {
            result += '\n'
          }
        }
        if (!result) {
          return null
        }
        tty.input = intArrayFromString(result, true)
      }
      return tty.input.shift()
    },
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output, 0))
        tty.output = []
      } else {
        if (val != 0) tty.output.push(val)
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        out(UTF8ArrayToString(tty.output, 0))
        tty.output = []
      }
    }
  },
  default_tty1_ops: {
    put_char: function (tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output, 0))
        tty.output = []
      } else {
        if (val != 0) tty.output.push(val)
      }
    },
    flush: function (tty) {
      if (tty.output && tty.output.length > 0) {
        err(UTF8ArrayToString(tty.output, 0))
        tty.output = []
      }
    }
  }
}
function zeroMemory(address, size) {
  HEAPU8.fill(0, address, address + size)
}
function alignMemory(size, alignment) {
  return Math.ceil(size / alignment) * alignment
}
function mmapAlloc(size) {
  size = alignMemory(size, 65536)
  var ptr = _memalign(65536, size)
  if (!ptr) return 0
  zeroMemory(ptr, size)
  return ptr
}
var MEMFS = {
  ops_table: null,
  mount: function (mount) {
    return MEMFS.createNode(null, '/', 16384 | 511, 0)
  },
  createNode: function (parent, name, mode, dev) {
    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
      throw new FS.ErrnoError(63)
    }
    if (!MEMFS.ops_table) {
      MEMFS.ops_table = {
        dir: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink
          },
          stream: { llseek: MEMFS.stream_ops.llseek }
        },
        file: {
          node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
          stream: {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap,
            msync: MEMFS.stream_ops.msync
          }
        },
        link: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink
          },
          stream: {}
        },
        chrdev: {
          node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr },
          stream: FS.chrdev_stream_ops
        }
      }
    }
    var node = FS.createNode(parent, name, mode, dev)
    if (FS.isDir(node.mode)) {
      node.node_ops = MEMFS.ops_table.dir.node
      node.stream_ops = MEMFS.ops_table.dir.stream
      node.contents = {}
    } else if (FS.isFile(node.mode)) {
      node.node_ops = MEMFS.ops_table.file.node
      node.stream_ops = MEMFS.ops_table.file.stream
      node.usedBytes = 0
      node.contents = null
    } else if (FS.isLink(node.mode)) {
      node.node_ops = MEMFS.ops_table.link.node
      node.stream_ops = MEMFS.ops_table.link.stream
    } else if (FS.isChrdev(node.mode)) {
      node.node_ops = MEMFS.ops_table.chrdev.node
      node.stream_ops = MEMFS.ops_table.chrdev.stream
    }
    node.timestamp = Date.now()
    if (parent) {
      parent.contents[name] = node
      parent.timestamp = node.timestamp
    }
    return node
  },
  getFileDataAsTypedArray: function (node) {
    if (!node.contents) return new Uint8Array(0)
    if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes)
    return new Uint8Array(node.contents)
  },
  expandFileStorage: function (node, newCapacity) {
    var prevCapacity = node.contents ? node.contents.length : 0
    if (prevCapacity >= newCapacity) return
    var CAPACITY_DOUBLING_MAX = 1024 * 1024
    newCapacity = Math.max(
      newCapacity,
      (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0
    )
    if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256)
    var oldContents = node.contents
    node.contents = new Uint8Array(newCapacity)
    if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0)
  },
  resizeFileStorage: function (node, newSize) {
    if (node.usedBytes == newSize) return
    if (newSize == 0) {
      node.contents = null
      node.usedBytes = 0
    } else {
      var oldContents = node.contents
      node.contents = new Uint8Array(newSize)
      if (oldContents) {
        node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
      }
      node.usedBytes = newSize
    }
  },
  node_ops: {
    getattr: function (node) {
      var attr = {}
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1
      attr.ino = node.id
      attr.mode = node.mode
      attr.nlink = 1
      attr.uid = 0
      attr.gid = 0
      attr.rdev = node.rdev
      if (FS.isDir(node.mode)) {
        attr.size = 4096
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length
      } else {
        attr.size = 0
      }
      attr.atime = new Date(node.timestamp)
      attr.mtime = new Date(node.timestamp)
      attr.ctime = new Date(node.timestamp)
      attr.blksize = 4096
      attr.blocks = Math.ceil(attr.size / attr.blksize)
      return attr
    },
    setattr: function (node, attr) {
      if (attr.mode !== undefined) {
        node.mode = attr.mode
      }
      if (attr.timestamp !== undefined) {
        node.timestamp = attr.timestamp
      }
      if (attr.size !== undefined) {
        MEMFS.resizeFileStorage(node, attr.size)
      }
    },
    lookup: function (parent, name) {
      throw FS.genericErrors[44]
    },
    mknod: function (parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev)
    },
    rename: function (old_node, new_dir, new_name) {
      if (FS.isDir(old_node.mode)) {
        var new_node
        try {
          new_node = FS.lookupNode(new_dir, new_name)
        } catch (e) {}
        if (new_node) {
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(55)
          }
        }
      }
      delete old_node.parent.contents[old_node.name]
      old_node.parent.timestamp = Date.now()
      old_node.name = new_name
      new_dir.contents[new_name] = old_node
      new_dir.timestamp = old_node.parent.timestamp
      old_node.parent = new_dir
    },
    unlink: function (parent, name) {
      delete parent.contents[name]
      parent.timestamp = Date.now()
    },
    rmdir: function (parent, name) {
      var node = FS.lookupNode(parent, name)
      for (var i in node.contents) {
        throw new FS.ErrnoError(55)
      }
      delete parent.contents[name]
      parent.timestamp = Date.now()
    },
    readdir: function (node) {
      var entries = ['.', '..']
      for (var key in node.contents) {
        if (!node.contents.hasOwnProperty(key)) {
          continue
        }
        entries.push(key)
      }
      return entries
    },
    symlink: function (parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0)
      node.link = oldpath
      return node
    },
    readlink: function (node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28)
      }
      return node.link
    }
  },
  stream_ops: {
    read: function (stream, buffer, offset, length, position) {
      var contents = stream.node.contents
      if (position >= stream.node.usedBytes) return 0
      var size = Math.min(stream.node.usedBytes - position, length)
      if (size > 8 && contents.subarray) {
        buffer.set(contents.subarray(position, position + size), offset)
      } else {
        for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i]
      }
      return size
    },
    write: function (stream, buffer, offset, length, position, canOwn) {
      if (buffer.buffer === HEAP8.buffer) {
        canOwn = false
      }
      if (!length) return 0
      var node = stream.node
      node.timestamp = Date.now()
      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
        if (canOwn) {
          node.contents = buffer.subarray(offset, offset + length)
          node.usedBytes = length
          return length
        } else if (node.usedBytes === 0 && position === 0) {
          node.contents = buffer.slice(offset, offset + length)
          node.usedBytes = length
          return length
        } else if (position + length <= node.usedBytes) {
          node.contents.set(buffer.subarray(offset, offset + length), position)
          return length
        }
      }
      MEMFS.expandFileStorage(node, position + length)
      if (node.contents.subarray && buffer.subarray) {
        node.contents.set(buffer.subarray(offset, offset + length), position)
      } else {
        for (var i = 0; i < length; i++) {
          node.contents[position + i] = buffer[offset + i]
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length)
      return length
    },
    llseek: function (stream, offset, whence) {
      var position = offset
      if (whence === 1) {
        position += stream.position
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28)
      }
      return position
    },
    allocate: function (stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length)
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
    },
    mmap: function (stream, address, length, position, prot, flags) {
      if (address !== 0) {
        throw new FS.ErrnoError(28)
      }
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43)
      }
      var ptr
      var allocated
      var contents = stream.node.contents
      if (!(flags & 2) && contents.buffer === buffer) {
        allocated = false
        ptr = contents.byteOffset
      } else {
        if (position > 0 || position + length < contents.length) {
          if (contents.subarray) {
            contents = contents.subarray(position, position + length)
          } else {
            contents = Array.prototype.slice.call(contents, position, position + length)
          }
        }
        allocated = true
        ptr = mmapAlloc(length)
        if (!ptr) {
          throw new FS.ErrnoError(48)
        }
        HEAP8.set(contents, ptr)
      }
      return { ptr: ptr, allocated: allocated }
    },
    msync: function (stream, buffer, offset, length, mmapFlags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43)
      }
      if (mmapFlags & 2) {
        return 0
      }
      var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false)
      return 0
    }
  }
}
function asyncLoad(url, onload, onerror, noRunDep) {
  var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : ''
  readAsync(
    url,
    function (arrayBuffer) {
      assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).')
      onload(new Uint8Array(arrayBuffer))
      if (dep) removeRunDependency(dep)
    },
    function (event) {
      if (onerror) {
        onerror()
      } else {
        throw 'Loading data file "' + url + '" failed.'
      }
    }
  )
  if (dep) addRunDependency(dep)
}
var FS = {
  root: null,
  mounts: [],
  devices: {},
  streams: [],
  nextInode: 1,
  nameTable: null,
  currentPath: '/',
  initialized: false,
  ignorePermissions: true,
  ErrnoError: null,
  genericErrors: {},
  filesystems: null,
  syncFSRequests: 0,
  lookupPath: function (path, opts = {}) {
    path = PATH_FS.resolve(FS.cwd(), path)
    if (!path) return { path: '', node: null }
    var defaults = { follow_mount: true, recurse_count: 0 }
    for (var key in defaults) {
      if (opts[key] === undefined) {
        opts[key] = defaults[key]
      }
    }
    if (opts.recurse_count > 8) {
      throw new FS.ErrnoError(32)
    }
    var parts = PATH.normalizeArray(
      path.split('/').filter(function (p) {
        return !!p
      }),
      false
    )
    var current = FS.root
    var current_path = '/'
    for (var i = 0; i < parts.length; i++) {
      var islast = i === parts.length - 1
      if (islast && opts.parent) {
        break
      }
      current = FS.lookupNode(current, parts[i])
      current_path = PATH.join2(current_path, parts[i])
      if (FS.isMountpoint(current)) {
        if (!islast || (islast && opts.follow_mount)) {
          current = current.mounted.root
        }
      }
      if (!islast || opts.follow) {
        var count = 0
        while (FS.isLink(current.mode)) {
          var link = FS.readlink(current_path)
          current_path = PATH_FS.resolve(PATH.dirname(current_path), link)
          var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count })
          current = lookup.node
          if (count++ > 40) {
            throw new FS.ErrnoError(32)
          }
        }
      }
    }
    return { path: current_path, node: current }
  },
  getPath: function (node) {
    var path
    while (true) {
      if (FS.isRoot(node)) {
        var mount = node.mount.mountpoint
        if (!path) return mount
        return mount[mount.length - 1] !== '/' ? mount + '/' + path : mount + path
      }
      path = path ? node.name + '/' + path : node.name
      node = node.parent
    }
  },
  hashName: function (parentid, name) {
    var hash = 0
    for (var i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0
    }
    return ((parentid + hash) >>> 0) % FS.nameTable.length
  },
  hashAddNode: function (node) {
    var hash = FS.hashName(node.parent.id, node.name)
    node.name_next = FS.nameTable[hash]
    FS.nameTable[hash] = node
  },
  hashRemoveNode: function (node) {
    var hash = FS.hashName(node.parent.id, node.name)
    if (FS.nameTable[hash] === node) {
      FS.nameTable[hash] = node.name_next
    } else {
      var current = FS.nameTable[hash]
      while (current) {
        if (current.name_next === node) {
          current.name_next = node.name_next
          break
        }
        current = current.name_next
      }
    }
  },
  lookupNode: function (parent, name) {
    var errCode = FS.mayLookup(parent)
    if (errCode) {
      throw new FS.ErrnoError(errCode, parent)
    }
    var hash = FS.hashName(parent.id, name)
    for (var node = FS.nameTable[hash]; node; node = node.name_next) {
      var nodeName = node.name
      if (node.parent.id === parent.id && nodeName === name) {
        return node
      }
    }
    return FS.lookup(parent, name)
  },
  createNode: function (parent, name, mode, rdev) {
    var node = new FS.FSNode(parent, name, mode, rdev)
    FS.hashAddNode(node)
    return node
  },
  destroyNode: function (node) {
    FS.hashRemoveNode(node)
  },
  isRoot: function (node) {
    return node === node.parent
  },
  isMountpoint: function (node) {
    return !!node.mounted
  },
  isFile: function (mode) {
    return (mode & 61440) === 32768
  },
  isDir: function (mode) {
    return (mode & 61440) === 16384
  },
  isLink: function (mode) {
    return (mode & 61440) === 40960
  },
  isChrdev: function (mode) {
    return (mode & 61440) === 8192
  },
  isBlkdev: function (mode) {
    return (mode & 61440) === 24576
  },
  isFIFO: function (mode) {
    return (mode & 61440) === 4096
  },
  isSocket: function (mode) {
    return (mode & 49152) === 49152
  },
  flagModes: { r: 0, 'r+': 2, w: 577, 'w+': 578, a: 1089, 'a+': 1090 },
  modeStringToFlags: function (str) {
    var flags = FS.flagModes[str]
    if (typeof flags === 'undefined') {
      throw new Error('Unknown file open mode: ' + str)
    }
    return flags
  },
  flagsToPermissionString: function (flag) {
    var perms = ['r', 'w', 'rw'][flag & 3]
    if (flag & 512) {
      perms += 'w'
    }
    return perms
  },
  nodePermissions: function (node, perms) {
    if (FS.ignorePermissions) {
      return 0
    }
    if (perms.includes('r') && !(node.mode & 292)) {
      return 2
    } else if (perms.includes('w') && !(node.mode & 146)) {
      return 2
    } else if (perms.includes('x') && !(node.mode & 73)) {
      return 2
    }
    return 0
  },
  mayLookup: function (dir) {
    var errCode = FS.nodePermissions(dir, 'x')
    if (errCode) return errCode
    if (!dir.node_ops.lookup) return 2
    return 0
  },
  mayCreate: function (dir, name) {
    try {
      var node = FS.lookupNode(dir, name)
      return 20
    } catch (e) {}
    return FS.nodePermissions(dir, 'wx')
  },
  mayDelete: function (dir, name, isdir) {
    var node
    try {
      node = FS.lookupNode(dir, name)
    } catch (e) {
      return e.errno
    }
    var errCode = FS.nodePermissions(dir, 'wx')
    if (errCode) {
      return errCode
    }
    if (isdir) {
      if (!FS.isDir(node.mode)) {
        return 54
      }
      if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
        return 10
      }
    } else {
      if (FS.isDir(node.mode)) {
        return 31
      }
    }
    return 0
  },
  mayOpen: function (node, flags) {
    if (!node) {
      return 44
    }
    if (FS.isLink(node.mode)) {
      return 32
    } else if (FS.isDir(node.mode)) {
      if (FS.flagsToPermissionString(flags) !== 'r' || flags & 512) {
        return 31
      }
    }
    return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
  },
  MAX_OPEN_FDS: 4096,
  nextfd: function (fd_start = 0, fd_end = FS.MAX_OPEN_FDS) {
    for (var fd = fd_start; fd <= fd_end; fd++) {
      if (!FS.streams[fd]) {
        return fd
      }
    }
    throw new FS.ErrnoError(33)
  },
  getStream: function (fd) {
    return FS.streams[fd]
  },
  createStream: function (stream, fd_start, fd_end) {
    if (!FS.FSStream) {
      FS.FSStream = function () {}
      FS.FSStream.prototype = {
        object: {
          get: function () {
            return this.node
          },
          set: function (val) {
            this.node = val
          }
        },
        isRead: {
          get: function () {
            return (this.flags & 2097155) !== 1
          }
        },
        isWrite: {
          get: function () {
            return (this.flags & 2097155) !== 0
          }
        },
        isAppend: {
          get: function () {
            return this.flags & 1024
          }
        }
      }
    }
    var newStream = new FS.FSStream()
    for (var p in stream) {
      newStream[p] = stream[p]
    }
    stream = newStream
    var fd = FS.nextfd(fd_start, fd_end)
    stream.fd = fd
    FS.streams[fd] = stream
    return stream
  },
  closeStream: function (fd) {
    FS.streams[fd] = null
  },
  chrdev_stream_ops: {
    open: function (stream) {
      var device = FS.getDevice(stream.node.rdev)
      stream.stream_ops = device.stream_ops
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream)
      }
    },
    llseek: function () {
      throw new FS.ErrnoError(70)
    }
  },
  major: function (dev) {
    return dev >> 8
  },
  minor: function (dev) {
    return dev & 255
  },
  makedev: function (ma, mi) {
    return (ma << 8) | mi
  },
  registerDevice: function (dev, ops) {
    FS.devices[dev] = { stream_ops: ops }
  },
  getDevice: function (dev) {
    return FS.devices[dev]
  },
  getMounts: function (mount) {
    var mounts = []
    var check = [mount]
    while (check.length) {
      var m = check.pop()
      mounts.push(m)
      check.push.apply(check, m.mounts)
    }
    return mounts
  },
  syncfs: function (populate, callback) {
    if (typeof populate === 'function') {
      callback = populate
      populate = false
    }
    FS.syncFSRequests++
    if (FS.syncFSRequests > 1) {
      err(
        'warning: ' +
          FS.syncFSRequests +
          ' FS.syncfs operations in flight at once, probably just doing extra work'
      )
    }
    var mounts = FS.getMounts(FS.root.mount)
    var completed = 0
    function doCallback(errCode) {
      FS.syncFSRequests--
      return callback(errCode)
    }
    function done(errCode) {
      if (errCode) {
        if (!done.errored) {
          done.errored = true
          return doCallback(errCode)
        }
        return
      }
      if (++completed >= mounts.length) {
        doCallback(null)
      }
    }
    mounts.forEach(function (mount) {
      if (!mount.type.syncfs) {
        return done(null)
      }
      mount.type.syncfs(mount, populate, done)
    })
  },
  mount: function (type, opts, mountpoint) {
    var root = mountpoint === '/'
    var pseudo = !mountpoint
    var node
    if (root && FS.root) {
      throw new FS.ErrnoError(10)
    } else if (!root && !pseudo) {
      var lookup = FS.lookupPath(mountpoint, { follow_mount: false })
      mountpoint = lookup.path
      node = lookup.node
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10)
      }
      if (!FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54)
      }
    }
    var mount = { type: type, opts: opts, mountpoint: mountpoint, mounts: [] }
    var mountRoot = type.mount(mount)
    mountRoot.mount = mount
    mount.root = mountRoot
    if (root) {
      FS.root = mountRoot
    } else if (node) {
      node.mounted = mount
      if (node.mount) {
        node.mount.mounts.push(mount)
      }
    }
    return mountRoot
  },
  unmount: function (mountpoint) {
    var lookup = FS.lookupPath(mountpoint, { follow_mount: false })
    if (!FS.isMountpoint(lookup.node)) {
      throw new FS.ErrnoError(28)
    }
    var node = lookup.node
    var mount = node.mounted
    var mounts = FS.getMounts(mount)
    Object.keys(FS.nameTable).forEach(function (hash) {
      var current = FS.nameTable[hash]
      while (current) {
        var next = current.name_next
        if (mounts.includes(current.mount)) {
          FS.destroyNode(current)
        }
        current = next
      }
    })
    node.mounted = null
    var idx = node.mount.mounts.indexOf(mount)
    node.mount.mounts.splice(idx, 1)
  },
  lookup: function (parent, name) {
    return parent.node_ops.lookup(parent, name)
  },
  mknod: function (path, mode, dev) {
    var lookup = FS.lookupPath(path, { parent: true })
    var parent = lookup.node
    var name = PATH.basename(path)
    if (!name || name === '.' || name === '..') {
      throw new FS.ErrnoError(28)
    }
    var errCode = FS.mayCreate(parent, name)
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    if (!parent.node_ops.mknod) {
      throw new FS.ErrnoError(63)
    }
    return parent.node_ops.mknod(parent, name, mode, dev)
  },
  create: function (path, mode) {
    mode = mode !== undefined ? mode : 438
    mode &= 4095
    mode |= 32768
    return FS.mknod(path, mode, 0)
  },
  mkdir: function (path, mode) {
    mode = mode !== undefined ? mode : 511
    mode &= 511 | 512
    mode |= 16384
    return FS.mknod(path, mode, 0)
  },
  mkdirTree: function (path, mode) {
    var dirs = path.split('/')
    var d = ''
    for (var i = 0; i < dirs.length; ++i) {
      if (!dirs[i]) continue
      d += '/' + dirs[i]
      try {
        FS.mkdir(d, mode)
      } catch (e) {
        if (e.errno != 20) throw e
      }
    }
  },
  mkdev: function (path, mode, dev) {
    if (typeof dev === 'undefined') {
      dev = mode
      mode = 438
    }
    mode |= 8192
    return FS.mknod(path, mode, dev)
  },
  symlink: function (oldpath, newpath) {
    if (!PATH_FS.resolve(oldpath)) {
      throw new FS.ErrnoError(44)
    }
    var lookup = FS.lookupPath(newpath, { parent: true })
    var parent = lookup.node
    if (!parent) {
      throw new FS.ErrnoError(44)
    }
    var newname = PATH.basename(newpath)
    var errCode = FS.mayCreate(parent, newname)
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    if (!parent.node_ops.symlink) {
      throw new FS.ErrnoError(63)
    }
    return parent.node_ops.symlink(parent, newname, oldpath)
  },
  rename: function (old_path, new_path) {
    var old_dirname = PATH.dirname(old_path)
    var new_dirname = PATH.dirname(new_path)
    var old_name = PATH.basename(old_path)
    var new_name = PATH.basename(new_path)
    var lookup, old_dir, new_dir
    lookup = FS.lookupPath(old_path, { parent: true })
    old_dir = lookup.node
    lookup = FS.lookupPath(new_path, { parent: true })
    new_dir = lookup.node
    if (!old_dir || !new_dir) throw new FS.ErrnoError(44)
    if (old_dir.mount !== new_dir.mount) {
      throw new FS.ErrnoError(75)
    }
    var old_node = FS.lookupNode(old_dir, old_name)
    var relative = PATH_FS.relative(old_path, new_dirname)
    if (relative.charAt(0) !== '.') {
      throw new FS.ErrnoError(28)
    }
    relative = PATH_FS.relative(new_path, old_dirname)
    if (relative.charAt(0) !== '.') {
      throw new FS.ErrnoError(55)
    }
    var new_node
    try {
      new_node = FS.lookupNode(new_dir, new_name)
    } catch (e) {}
    if (old_node === new_node) {
      return
    }
    var isdir = FS.isDir(old_node.mode)
    var errCode = FS.mayDelete(old_dir, old_name, isdir)
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name)
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    if (!old_dir.node_ops.rename) {
      throw new FS.ErrnoError(63)
    }
    if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
      throw new FS.ErrnoError(10)
    }
    if (new_dir !== old_dir) {
      errCode = FS.nodePermissions(old_dir, 'w')
      if (errCode) {
        throw new FS.ErrnoError(errCode)
      }
    }
    FS.hashRemoveNode(old_node)
    try {
      old_dir.node_ops.rename(old_node, new_dir, new_name)
    } catch (e) {
      throw e
    } finally {
      FS.hashAddNode(old_node)
    }
  },
  rmdir: function (path) {
    var lookup = FS.lookupPath(path, { parent: true })
    var parent = lookup.node
    var name = PATH.basename(path)
    var node = FS.lookupNode(parent, name)
    var errCode = FS.mayDelete(parent, name, true)
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    if (!parent.node_ops.rmdir) {
      throw new FS.ErrnoError(63)
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10)
    }
    parent.node_ops.rmdir(parent, name)
    FS.destroyNode(node)
  },
  readdir: function (path) {
    var lookup = FS.lookupPath(path, { follow: true })
    var node = lookup.node
    if (!node.node_ops.readdir) {
      throw new FS.ErrnoError(54)
    }
    return node.node_ops.readdir(node)
  },
  unlink: function (path) {
    var lookup = FS.lookupPath(path, { parent: true })
    var parent = lookup.node
    if (!parent) {
      throw new FS.ErrnoError(44)
    }
    var name = PATH.basename(path)
    var node = FS.lookupNode(parent, name)
    var errCode = FS.mayDelete(parent, name, false)
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    if (!parent.node_ops.unlink) {
      throw new FS.ErrnoError(63)
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10)
    }
    parent.node_ops.unlink(parent, name)
    FS.destroyNode(node)
  },
  readlink: function (path) {
    var lookup = FS.lookupPath(path)
    var link = lookup.node
    if (!link) {
      throw new FS.ErrnoError(44)
    }
    if (!link.node_ops.readlink) {
      throw new FS.ErrnoError(28)
    }
    return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link))
  },
  stat: function (path, dontFollow) {
    var lookup = FS.lookupPath(path, { follow: !dontFollow })
    var node = lookup.node
    if (!node) {
      throw new FS.ErrnoError(44)
    }
    if (!node.node_ops.getattr) {
      throw new FS.ErrnoError(63)
    }
    return node.node_ops.getattr(node)
  },
  lstat: function (path) {
    return FS.stat(path, true)
  },
  chmod: function (path, mode, dontFollow) {
    var node
    if (typeof path === 'string') {
      var lookup = FS.lookupPath(path, { follow: !dontFollow })
      node = lookup.node
    } else {
      node = path
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63)
    }
    node.node_ops.setattr(node, {
      mode: (mode & 4095) | (node.mode & ~4095),
      timestamp: Date.now()
    })
  },
  lchmod: function (path, mode) {
    FS.chmod(path, mode, true)
  },
  fchmod: function (fd, mode) {
    var stream = FS.getStream(fd)
    if (!stream) {
      throw new FS.ErrnoError(8)
    }
    FS.chmod(stream.node, mode)
  },
  chown: function (path, uid, gid, dontFollow) {
    var node
    if (typeof path === 'string') {
      var lookup = FS.lookupPath(path, { follow: !dontFollow })
      node = lookup.node
    } else {
      node = path
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63)
    }
    node.node_ops.setattr(node, { timestamp: Date.now() })
  },
  lchown: function (path, uid, gid) {
    FS.chown(path, uid, gid, true)
  },
  fchown: function (fd, uid, gid) {
    var stream = FS.getStream(fd)
    if (!stream) {
      throw new FS.ErrnoError(8)
    }
    FS.chown(stream.node, uid, gid)
  },
  truncate: function (path, len) {
    if (len < 0) {
      throw new FS.ErrnoError(28)
    }
    var node
    if (typeof path === 'string') {
      var lookup = FS.lookupPath(path, { follow: true })
      node = lookup.node
    } else {
      node = path
    }
    if (!node.node_ops.setattr) {
      throw new FS.ErrnoError(63)
    }
    if (FS.isDir(node.mode)) {
      throw new FS.ErrnoError(31)
    }
    if (!FS.isFile(node.mode)) {
      throw new FS.ErrnoError(28)
    }
    var errCode = FS.nodePermissions(node, 'w')
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    node.node_ops.setattr(node, { size: len, timestamp: Date.now() })
  },
  ftruncate: function (fd, len) {
    var stream = FS.getStream(fd)
    if (!stream) {
      throw new FS.ErrnoError(8)
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(28)
    }
    FS.truncate(stream.node, len)
  },
  utime: function (path, atime, mtime) {
    var lookup = FS.lookupPath(path, { follow: true })
    var node = lookup.node
    node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) })
  },
  open: function (path, flags, mode, fd_start, fd_end) {
    if (path === '') {
      throw new FS.ErrnoError(44)
    }
    flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags
    mode = typeof mode === 'undefined' ? 438 : mode
    if (flags & 64) {
      mode = (mode & 4095) | 32768
    } else {
      mode = 0
    }
    var node
    if (typeof path === 'object') {
      node = path
    } else {
      path = PATH.normalize(path)
      try {
        var lookup = FS.lookupPath(path, { follow: !(flags & 131072) })
        node = lookup.node
      } catch (e) {}
    }
    var created = false
    if (flags & 64) {
      if (node) {
        if (flags & 128) {
          throw new FS.ErrnoError(20)
        }
      } else {
        node = FS.mknod(path, mode, 0)
        created = true
      }
    }
    if (!node) {
      throw new FS.ErrnoError(44)
    }
    if (FS.isChrdev(node.mode)) {
      flags &= ~512
    }
    if (flags & 65536 && !FS.isDir(node.mode)) {
      throw new FS.ErrnoError(54)
    }
    if (!created) {
      var errCode = FS.mayOpen(node, flags)
      if (errCode) {
        throw new FS.ErrnoError(errCode)
      }
    }
    if (flags & 512) {
      FS.truncate(node, 0)
    }
    flags &= ~(128 | 512 | 131072)
    var stream = FS.createStream(
      {
        node: node,
        path: FS.getPath(node),
        id: node.id,
        flags: flags,
        mode: node.mode,
        seekable: true,
        position: 0,
        stream_ops: node.stream_ops,
        node_ops: node.node_ops,
        ungotten: [],
        error: false
      },
      fd_start,
      fd_end
    )
    if (stream.stream_ops.open) {
      stream.stream_ops.open(stream)
    }
    if (Module['logReadFiles'] && !(flags & 1)) {
      if (!FS.readFiles) FS.readFiles = {}
      if (!(path in FS.readFiles)) {
        FS.readFiles[path] = 1
      }
    }
    return stream
  },
  close: function (stream) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8)
    }
    if (stream.getdents) stream.getdents = null
    try {
      if (stream.stream_ops.close) {
        stream.stream_ops.close(stream)
      }
    } catch (e) {
      throw e
    } finally {
      FS.closeStream(stream.fd)
    }
    stream.fd = null
  },
  isClosed: function (stream) {
    return stream.fd === null
  },
  llseek: function (stream, offset, whence) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8)
    }
    if (!stream.seekable || !stream.stream_ops.llseek) {
      throw new FS.ErrnoError(70)
    }
    if (whence != 0 && whence != 1 && whence != 2) {
      throw new FS.ErrnoError(28)
    }
    stream.position = stream.stream_ops.llseek(stream, offset, whence)
    stream.ungotten = []
    return stream.position
  },
  read: function (stream, buffer, offset, length, position) {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28)
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8)
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(8)
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31)
    }
    if (!stream.stream_ops.read) {
      throw new FS.ErrnoError(28)
    }
    var seeking = typeof position !== 'undefined'
    if (!seeking) {
      position = stream.position
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70)
    }
    var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position)
    if (!seeking) stream.position += bytesRead
    return bytesRead
  },
  write: function (stream, buffer, offset, length, position, canOwn) {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28)
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8)
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8)
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31)
    }
    if (!stream.stream_ops.write) {
      throw new FS.ErrnoError(28)
    }
    if (stream.seekable && stream.flags & 1024) {
      FS.llseek(stream, 0, 2)
    }
    var seeking = typeof position !== 'undefined'
    if (!seeking) {
      position = stream.position
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70)
    }
    var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn)
    if (!seeking) stream.position += bytesWritten
    return bytesWritten
  },
  allocate: function (stream, offset, length) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8)
    }
    if (offset < 0 || length <= 0) {
      throw new FS.ErrnoError(28)
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8)
    }
    if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(43)
    }
    if (!stream.stream_ops.allocate) {
      throw new FS.ErrnoError(138)
    }
    stream.stream_ops.allocate(stream, offset, length)
  },
  mmap: function (stream, address, length, position, prot, flags) {
    if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
      throw new FS.ErrnoError(2)
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(2)
    }
    if (!stream.stream_ops.mmap) {
      throw new FS.ErrnoError(43)
    }
    return stream.stream_ops.mmap(stream, address, length, position, prot, flags)
  },
  msync: function (stream, buffer, offset, length, mmapFlags) {
    if (!stream || !stream.stream_ops.msync) {
      return 0
    }
    return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
  },
  munmap: function (stream) {
    return 0
  },
  ioctl: function (stream, cmd, arg) {
    if (!stream.stream_ops.ioctl) {
      throw new FS.ErrnoError(59)
    }
    return stream.stream_ops.ioctl(stream, cmd, arg)
  },
  readFile: function (path, opts = {}) {
    opts.flags = opts.flags || 0
    opts.encoding = opts.encoding || 'binary'
    if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
      throw new Error('Invalid encoding type "' + opts.encoding + '"')
    }
    var ret
    var stream = FS.open(path, opts.flags)
    var stat = FS.stat(path)
    var length = stat.size
    var buf = new Uint8Array(length)
    FS.read(stream, buf, 0, length, 0)
    if (opts.encoding === 'utf8') {
      ret = UTF8ArrayToString(buf, 0)
    } else if (opts.encoding === 'binary') {
      ret = buf
    }
    FS.close(stream)
    return ret
  },
  writeFile: function (path, data, opts = {}) {
    opts.flags = opts.flags || 577
    var stream = FS.open(path, opts.flags, opts.mode)
    if (typeof data === 'string') {
      var buf = new Uint8Array(lengthBytesUTF8(data) + 1)
      var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length)
      FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn)
    } else if (ArrayBuffer.isView(data)) {
      FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
    } else {
      throw new Error('Unsupported data type')
    }
    FS.close(stream)
  },
  cwd: function () {
    return FS.currentPath
  },
  chdir: function (path) {
    var lookup = FS.lookupPath(path, { follow: true })
    if (lookup.node === null) {
      throw new FS.ErrnoError(44)
    }
    if (!FS.isDir(lookup.node.mode)) {
      throw new FS.ErrnoError(54)
    }
    var errCode = FS.nodePermissions(lookup.node, 'x')
    if (errCode) {
      throw new FS.ErrnoError(errCode)
    }
    FS.currentPath = lookup.path
  },
  createDefaultDirectories: function () {
    FS.mkdir('/tmp')
    FS.mkdir('/home')
    FS.mkdir('/home/web_user')
  },
  createDefaultDevices: function () {
    FS.mkdir('/dev')
    FS.registerDevice(FS.makedev(1, 3), {
      read: function () {
        return 0
      },
      write: function (stream, buffer, offset, length, pos) {
        return length
      }
    })
    FS.mkdev('/dev/null', FS.makedev(1, 3))
    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops)
    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops)
    FS.mkdev('/dev/tty', FS.makedev(5, 0))
    FS.mkdev('/dev/tty1', FS.makedev(6, 0))
    var random_device = getRandomDevice()
    FS.createDevice('/dev', 'random', random_device)
    FS.createDevice('/dev', 'urandom', random_device)
    FS.mkdir('/dev/shm')
    FS.mkdir('/dev/shm/tmp')
  },
  createSpecialDirectories: function () {
    FS.mkdir('/proc')
    var proc_self = FS.mkdir('/proc/self')
    FS.mkdir('/proc/self/fd')
    FS.mount(
      {
        mount: function () {
          var node = FS.createNode(proc_self, 'fd', 16384 | 511, 73)
          node.node_ops = {
            lookup: function (parent, name) {
              var fd = +name
              var stream = FS.getStream(fd)
              if (!stream) throw new FS.ErrnoError(8)
              var ret = {
                parent: null,
                mount: { mountpoint: 'fake' },
                node_ops: {
                  readlink: function () {
                    return stream.path
                  }
                }
              }
              ret.parent = ret
              return ret
            }
          }
          return node
        }
      },
      {},
      '/proc/self/fd'
    )
  },
  createStandardStreams: function () {
    if (Module['stdin']) {
      FS.createDevice('/dev', 'stdin', Module['stdin'])
    } else {
      FS.symlink('/dev/tty', '/dev/stdin')
    }
    if (Module['stdout']) {
      FS.createDevice('/dev', 'stdout', null, Module['stdout'])
    } else {
      FS.symlink('/dev/tty', '/dev/stdout')
    }
    if (Module['stderr']) {
      FS.createDevice('/dev', 'stderr', null, Module['stderr'])
    } else {
      FS.symlink('/dev/tty1', '/dev/stderr')
    }
    var stdin = FS.open('/dev/stdin', 0)
    var stdout = FS.open('/dev/stdout', 1)
    var stderr = FS.open('/dev/stderr', 1)
  },
  ensureErrnoError: function () {
    if (FS.ErrnoError) return
    FS.ErrnoError = function ErrnoError(errno, node) {
      this.node = node
      this.setErrno = function (errno) {
        this.errno = errno
      }
      this.setErrno(errno)
      this.message = 'FS error'
    }
    FS.ErrnoError.prototype = new Error()
    FS.ErrnoError.prototype.constructor = FS.ErrnoError
    ;[44].forEach(function (code) {
      FS.genericErrors[code] = new FS.ErrnoError(code)
      FS.genericErrors[code].stack = '<generic error, no stack>'
    })
  },
  staticInit: function () {
    FS.ensureErrnoError()
    FS.nameTable = new Array(4096)
    FS.mount(MEMFS, {}, '/')
    FS.createDefaultDirectories()
    FS.createDefaultDevices()
    FS.createSpecialDirectories()
    FS.filesystems = { MEMFS: MEMFS }
  },
  init: function (input, output, error) {
    FS.init.initialized = true
    FS.ensureErrnoError()
    Module['stdin'] = input || Module['stdin']
    Module['stdout'] = output || Module['stdout']
    Module['stderr'] = error || Module['stderr']
    FS.createStandardStreams()
  },
  quit: function () {
    FS.init.initialized = false
    _fflush(0)
    for (var i = 0; i < FS.streams.length; i++) {
      var stream = FS.streams[i]
      if (!stream) {
        continue
      }
      FS.close(stream)
    }
  },
  getMode: function (canRead, canWrite) {
    var mode = 0
    if (canRead) mode |= 292 | 73
    if (canWrite) mode |= 146
    return mode
  },
  findObject: function (path, dontResolveLastLink) {
    var ret = FS.analyzePath(path, dontResolveLastLink)
    if (ret.exists) {
      return ret.object
    } else {
      return null
    }
  },
  analyzePath: function (path, dontResolveLastLink) {
    try {
      var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink })
      path = lookup.path
    } catch (e) {}
    var ret = {
      isRoot: false,
      exists: false,
      error: 0,
      name: null,
      path: null,
      object: null,
      parentExists: false,
      parentPath: null,
      parentObject: null
    }
    try {
      var lookup = FS.lookupPath(path, { parent: true })
      ret.parentExists = true
      ret.parentPath = lookup.path
      ret.parentObject = lookup.node
      ret.name = PATH.basename(path)
      lookup = FS.lookupPath(path, { follow: !dontResolveLastLink })
      ret.exists = true
      ret.path = lookup.path
      ret.object = lookup.node
      ret.name = lookup.node.name
      ret.isRoot = lookup.path === '/'
    } catch (e) {
      ret.error = e.errno
    }
    return ret
  },
  createPath: function (parent, path, canRead, canWrite) {
    parent = typeof parent === 'string' ? parent : FS.getPath(parent)
    var parts = path.split('/').reverse()
    while (parts.length) {
      var part = parts.pop()
      if (!part) continue
      var current = PATH.join2(parent, part)
      try {
        FS.mkdir(current)
      } catch (e) {}
      parent = current
    }
    return current
  },
  createFile: function (parent, name, properties, canRead, canWrite) {
    var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name)
    var mode = FS.getMode(canRead, canWrite)
    return FS.create(path, mode)
  },
  createDataFile: function (parent, name, data, canRead, canWrite, canOwn) {
    var path = name
      ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name)
      : parent
    var mode = FS.getMode(canRead, canWrite)
    var node = FS.create(path, mode)
    if (data) {
      if (typeof data === 'string') {
        var arr = new Array(data.length)
        for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i)
        data = arr
      }
      FS.chmod(node, mode | 146)
      var stream = FS.open(node, 577)
      FS.write(stream, data, 0, data.length, 0, canOwn)
      FS.close(stream)
      FS.chmod(node, mode)
    }
    return node
  },
  createDevice: function (parent, name, input, output) {
    var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name)
    var mode = FS.getMode(!!input, !!output)
    if (!FS.createDevice.major) FS.createDevice.major = 64
    var dev = FS.makedev(FS.createDevice.major++, 0)
    FS.registerDevice(dev, {
      open: function (stream) {
        stream.seekable = false
      },
      close: function (stream) {
        if (output && output.buffer && output.buffer.length) {
          output(10)
        }
      },
      read: function (stream, buffer, offset, length, pos) {
        var bytesRead = 0
        for (var i = 0; i < length; i++) {
          var result
          try {
            result = input()
          } catch (e) {
            throw new FS.ErrnoError(29)
          }
          if (result === undefined && bytesRead === 0) {
            throw new FS.ErrnoError(6)
          }
          if (result === null || result === undefined) break
          bytesRead++
          buffer[offset + i] = result
        }
        if (bytesRead) {
          stream.node.timestamp = Date.now()
        }
        return bytesRead
      },
      write: function (stream, buffer, offset, length, pos) {
        for (var i = 0; i < length; i++) {
          try {
            output(buffer[offset + i])
          } catch (e) {
            throw new FS.ErrnoError(29)
          }
        }
        if (length) {
          stream.node.timestamp = Date.now()
        }
        return i
      }
    })
    return FS.mkdev(path, mode, dev)
  },
  forceLoadFile: function (obj) {
    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true
    if (typeof XMLHttpRequest !== 'undefined') {
      throw new Error(
        'Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.'
      )
    } else if (read_) {
      try {
        obj.contents = intArrayFromString(read_(obj.url), true)
        obj.usedBytes = obj.contents.length
      } catch (e) {
        throw new FS.ErrnoError(29)
      }
    } else {
      throw new Error('Cannot load without read() or XMLHttpRequest.')
    }
  },
  createLazyFile: function (parent, name, url, canRead, canWrite) {
    function LazyUint8Array() {
      this.lengthKnown = false
      this.chunks = []
    }
    LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
      if (idx > this.length - 1 || idx < 0) {
        return undefined
      }
      var chunkOffset = idx % this.chunkSize
      var chunkNum = (idx / this.chunkSize) | 0
      return this.getter(chunkNum)[chunkOffset]
    }
    LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
      this.getter = getter
    }
    LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
      var xhr = new XMLHttpRequest()
      xhr.open('HEAD', url, false)
      xhr.send(null)
      if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
        throw new Error("Couldn't load " + url + '. Status: ' + xhr.status)
      var datalength = Number(xhr.getResponseHeader('Content-length'))
      var header
      var hasByteServing = (header = xhr.getResponseHeader('Accept-Ranges')) && header === 'bytes'
      var usesGzip = (header = xhr.getResponseHeader('Content-Encoding')) && header === 'gzip'
      var chunkSize = 1024 * 1024
      if (!hasByteServing) chunkSize = datalength
      var doXHR = function (from, to) {
        if (from > to)
          throw new Error('invalid range (' + from + ', ' + to + ') or no bytes requested!')
        if (to > datalength - 1)
          throw new Error('only ' + datalength + ' bytes available! programmer error!')
        var xhr = new XMLHttpRequest()
        xhr.open('GET', url, false)
        if (datalength !== chunkSize) xhr.setRequestHeader('Range', 'bytes=' + from + '-' + to)
        if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer'
        if (xhr.overrideMimeType) {
          xhr.overrideMimeType('text/plain; charset=x-user-defined')
        }
        xhr.send(null)
        if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
          throw new Error("Couldn't load " + url + '. Status: ' + xhr.status)
        if (xhr.response !== undefined) {
          return new Uint8Array(xhr.response || [])
        } else {
          return intArrayFromString(xhr.responseText || '', true)
        }
      }
      var lazyArray = this
      lazyArray.setDataGetter(function (chunkNum) {
        var start = chunkNum * chunkSize
        var end = (chunkNum + 1) * chunkSize - 1
        end = Math.min(end, datalength - 1)
        if (typeof lazyArray.chunks[chunkNum] === 'undefined') {
          lazyArray.chunks[chunkNum] = doXHR(start, end)
        }
        if (typeof lazyArray.chunks[chunkNum] === 'undefined') throw new Error('doXHR failed!')
        return lazyArray.chunks[chunkNum]
      })
      if (usesGzip || !datalength) {
        chunkSize = datalength = 1
        datalength = this.getter(0).length
        chunkSize = datalength
        out('LazyFiles on gzip forces download of the whole file when length is accessed')
      }
      this._length = datalength
      this._chunkSize = chunkSize
      this.lengthKnown = true
    }
    if (typeof XMLHttpRequest !== 'undefined') {
      if (!ENVIRONMENT_IS_WORKER)
        throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc'
      var lazyArray = new LazyUint8Array()
      Object.defineProperties(lazyArray, {
        length: {
          get: function () {
            if (!this.lengthKnown) {
              this.cacheLength()
            }
            return this._length
          }
        },
        chunkSize: {
          get: function () {
            if (!this.lengthKnown) {
              this.cacheLength()
            }
            return this._chunkSize
          }
        }
      })
      var properties = { isDevice: false, contents: lazyArray }
    } else {
      var properties = { isDevice: false, url: url }
    }
    var node = FS.createFile(parent, name, properties, canRead, canWrite)
    if (properties.contents) {
      node.contents = properties.contents
    } else if (properties.url) {
      node.contents = null
      node.url = properties.url
    }
    Object.defineProperties(node, {
      usedBytes: {
        get: function () {
          return this.contents.length
        }
      }
    })
    var stream_ops = {}
    var keys = Object.keys(node.stream_ops)
    keys.forEach(function (key) {
      var fn = node.stream_ops[key]
      stream_ops[key] = function forceLoadLazyFile() {
        FS.forceLoadFile(node)
        return fn.apply(null, arguments)
      }
    })
    stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
      FS.forceLoadFile(node)
      var contents = stream.node.contents
      if (position >= contents.length) return 0
      var size = Math.min(contents.length - position, length)
      if (contents.slice) {
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents[position + i]
        }
      } else {
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents.get(position + i)
        }
      }
      return size
    }
    node.stream_ops = stream_ops
    return node
  },
  createPreloadedFile: function (
    parent,
    name,
    url,
    canRead,
    canWrite,
    onload,
    onerror,
    dontCreateFile,
    canOwn,
    preFinish
  ) {
    Browser.init()
    var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent
    var dep = getUniqueRunDependency('cp ' + fullname)
    function processData(byteArray) {
      function finish(byteArray) {
        if (preFinish) preFinish()
        if (!dontCreateFile) {
          FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
        }
        if (onload) onload()
        removeRunDependency(dep)
      }
      var handled = false
      Module['preloadPlugins'].forEach(function (plugin) {
        if (handled) return
        if (plugin['canHandle'](fullname)) {
          plugin['handle'](byteArray, fullname, finish, function () {
            if (onerror) onerror()
            removeRunDependency(dep)
          })
          handled = true
        }
      })
      if (!handled) finish(byteArray)
    }
    addRunDependency(dep)
    if (typeof url == 'string') {
      asyncLoad(
        url,
        function (byteArray) {
          processData(byteArray)
        },
        onerror
      )
    } else {
      processData(url)
    }
  },
  indexedDB: function () {
    return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
  },
  DB_NAME: function () {
    return 'EM_FS_' + window.location.pathname
  },
  DB_VERSION: 20,
  DB_STORE_NAME: 'FILE_DATA',
  saveFilesToDB: function (paths, onload, onerror) {
    onload = onload || function () {}
    onerror = onerror || function () {}
    var indexedDB = FS.indexedDB()
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
    } catch (e) {
      return onerror(e)
    }
    openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
      out('creating db')
      var db = openRequest.result
      db.createObjectStore(FS.DB_STORE_NAME)
    }
    openRequest.onsuccess = function openRequest_onsuccess() {
      var db = openRequest.result
      var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite')
      var files = transaction.objectStore(FS.DB_STORE_NAME)
      var ok = 0,
        fail = 0,
        total = paths.length
      function finish() {
        if (fail == 0) onload()
        else onerror()
      }
      paths.forEach(function (path) {
        var putRequest = files.put(FS.analyzePath(path).object.contents, path)
        putRequest.onsuccess = function putRequest_onsuccess() {
          ok++
          if (ok + fail == total) finish()
        }
        putRequest.onerror = function putRequest_onerror() {
          fail++
          if (ok + fail == total) finish()
        }
      })
      transaction.onerror = onerror
    }
    openRequest.onerror = onerror
  },
  loadFilesFromDB: function (paths, onload, onerror) {
    onload = onload || function () {}
    onerror = onerror || function () {}
    var indexedDB = FS.indexedDB()
    try {
      var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION)
    } catch (e) {
      return onerror(e)
    }
    openRequest.onupgradeneeded = onerror
    openRequest.onsuccess = function openRequest_onsuccess() {
      var db = openRequest.result
      try {
        var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly')
      } catch (e) {
        onerror(e)
        return
      }
      var files = transaction.objectStore(FS.DB_STORE_NAME)
      var ok = 0,
        fail = 0,
        total = paths.length
      function finish() {
        if (fail == 0) onload()
        else onerror()
      }
      paths.forEach(function (path) {
        var getRequest = files.get(path)
        getRequest.onsuccess = function getRequest_onsuccess() {
          if (FS.analyzePath(path).exists) {
            FS.unlink(path)
          }
          FS.createDataFile(
            PATH.dirname(path),
            PATH.basename(path),
            getRequest.result,
            true,
            true,
            true
          )
          ok++
          if (ok + fail == total) finish()
        }
        getRequest.onerror = function getRequest_onerror() {
          fail++
          if (ok + fail == total) finish()
        }
      })
      transaction.onerror = onerror
    }
    openRequest.onerror = onerror
  }
}
var SYSCALLS = {
  mappings: {},
  DEFAULT_POLLMASK: 5,
  calculateAt: function (dirfd, path, allowEmpty) {
    if (path[0] === '/') {
      return path
    }
    var dir
    if (dirfd === -100) {
      dir = FS.cwd()
    } else {
      var dirstream = FS.getStream(dirfd)
      if (!dirstream) throw new FS.ErrnoError(8)
      dir = dirstream.path
    }
    if (path.length == 0) {
      if (!allowEmpty) {
        throw new FS.ErrnoError(44)
      }
      return dir
    }
    return PATH.join2(dir, path)
  },
  doStat: function (func, path, buf) {
    try {
      var stat = func(path)
    } catch (e) {
      if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
        return -54
      }
      throw e
    }
    HEAP32[buf >> 2] = stat.dev
    HEAP32[(buf + 4) >> 2] = 0
    HEAP32[(buf + 8) >> 2] = stat.ino
    HEAP32[(buf + 12) >> 2] = stat.mode
    HEAP32[(buf + 16) >> 2] = stat.nlink
    HEAP32[(buf + 20) >> 2] = stat.uid
    HEAP32[(buf + 24) >> 2] = stat.gid
    HEAP32[(buf + 28) >> 2] = stat.rdev
    HEAP32[(buf + 32) >> 2] = 0
    ;(tempI64 = [
      stat.size >>> 0,
      ((tempDouble = stat.size),
      +Math.abs(tempDouble) >= 1
        ? tempDouble > 0
          ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
        : 0)
    ]),
      (HEAP32[(buf + 40) >> 2] = tempI64[0]),
      (HEAP32[(buf + 44) >> 2] = tempI64[1])
    HEAP32[(buf + 48) >> 2] = 4096
    HEAP32[(buf + 52) >> 2] = stat.blocks
    HEAP32[(buf + 56) >> 2] = (stat.atime.getTime() / 1e3) | 0
    HEAP32[(buf + 60) >> 2] = 0
    HEAP32[(buf + 64) >> 2] = (stat.mtime.getTime() / 1e3) | 0
    HEAP32[(buf + 68) >> 2] = 0
    HEAP32[(buf + 72) >> 2] = (stat.ctime.getTime() / 1e3) | 0
    HEAP32[(buf + 76) >> 2] = 0
    ;(tempI64 = [
      stat.ino >>> 0,
      ((tempDouble = stat.ino),
      +Math.abs(tempDouble) >= 1
        ? tempDouble > 0
          ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
        : 0)
    ]),
      (HEAP32[(buf + 80) >> 2] = tempI64[0]),
      (HEAP32[(buf + 84) >> 2] = tempI64[1])
    return 0
  },
  doMsync: function (addr, stream, len, flags, offset) {
    var buffer = HEAPU8.slice(addr, addr + len)
    FS.msync(stream, buffer, offset, len, flags)
  },
  doMkdir: function (path, mode) {
    path = PATH.normalize(path)
    if (path[path.length - 1] === '/') path = path.substr(0, path.length - 1)
    FS.mkdir(path, mode, 0)
    return 0
  },
  doMknod: function (path, mode, dev) {
    switch (mode & 61440) {
      case 32768:
      case 8192:
      case 24576:
      case 4096:
      case 49152:
        break
      default:
        return -28
    }
    FS.mknod(path, mode, dev)
    return 0
  },
  doReadlink: function (path, buf, bufsize) {
    if (bufsize <= 0) return -28
    var ret = FS.readlink(path)
    var len = Math.min(bufsize, lengthBytesUTF8(ret))
    var endChar = HEAP8[buf + len]
    stringToUTF8(ret, buf, bufsize + 1)
    HEAP8[buf + len] = endChar
    return len
  },
  doAccess: function (path, amode) {
    if (amode & ~7) {
      return -28
    }
    var lookup = FS.lookupPath(path, { follow: true })
    var node = lookup.node
    if (!node) {
      return -44
    }
    var perms = ''
    if (amode & 4) perms += 'r'
    if (amode & 2) perms += 'w'
    if (amode & 1) perms += 'x'
    if (perms && FS.nodePermissions(node, perms)) {
      return -2
    }
    return 0
  },
  doDup: function (path, flags, suggestFD) {
    var suggest = FS.getStream(suggestFD)
    if (suggest) FS.close(suggest)
    return FS.open(path, flags, 0, suggestFD, suggestFD).fd
  },
  doReadv: function (stream, iov, iovcnt, offset) {
    var ret = 0
    for (var i = 0; i < iovcnt; i++) {
      var ptr = HEAP32[(iov + i * 8) >> 2]
      var len = HEAP32[(iov + (i * 8 + 4)) >> 2]
      var curr = FS.read(stream, HEAP8, ptr, len, offset)
      if (curr < 0) return -1
      ret += curr
      if (curr < len) break
    }
    return ret
  },
  doWritev: function (stream, iov, iovcnt, offset) {
    var ret = 0
    for (var i = 0; i < iovcnt; i++) {
      var ptr = HEAP32[(iov + i * 8) >> 2]
      var len = HEAP32[(iov + (i * 8 + 4)) >> 2]
      var curr = FS.write(stream, HEAP8, ptr, len, offset)
      if (curr < 0) return -1
      ret += curr
    }
    return ret
  },
  varargs: undefined,
  get: function () {
    SYSCALLS.varargs += 4
    var ret = HEAP32[(SYSCALLS.varargs - 4) >> 2]
    return ret
  },
  getStr: function (ptr) {
    var ret = UTF8ToString(ptr)
    return ret
  },
  getStreamFromFD: function (fd) {
    var stream = FS.getStream(fd)
    if (!stream) throw new FS.ErrnoError(8)
    return stream
  },
  get64: function (low, high) {
    return low
  }
}
function ___syscall__newselect(nfds, readfds, writefds, exceptfds, timeout) {
  try {
    var total = 0
    var srcReadLow = readfds ? HEAP32[readfds >> 2] : 0,
      srcReadHigh = readfds ? HEAP32[(readfds + 4) >> 2] : 0
    var srcWriteLow = writefds ? HEAP32[writefds >> 2] : 0,
      srcWriteHigh = writefds ? HEAP32[(writefds + 4) >> 2] : 0
    var srcExceptLow = exceptfds ? HEAP32[exceptfds >> 2] : 0,
      srcExceptHigh = exceptfds ? HEAP32[(exceptfds + 4) >> 2] : 0
    var dstReadLow = 0,
      dstReadHigh = 0
    var dstWriteLow = 0,
      dstWriteHigh = 0
    var dstExceptLow = 0,
      dstExceptHigh = 0
    var allLow =
      (readfds ? HEAP32[readfds >> 2] : 0) |
      (writefds ? HEAP32[writefds >> 2] : 0) |
      (exceptfds ? HEAP32[exceptfds >> 2] : 0)
    var allHigh =
      (readfds ? HEAP32[(readfds + 4) >> 2] : 0) |
      (writefds ? HEAP32[(writefds + 4) >> 2] : 0) |
      (exceptfds ? HEAP32[(exceptfds + 4) >> 2] : 0)
    var check = function (fd, low, high, val) {
      return fd < 32 ? low & val : high & val
    }
    for (var fd = 0; fd < nfds; fd++) {
      var mask = 1 << fd % 32
      if (!check(fd, allLow, allHigh, mask)) {
        continue
      }
      var stream = FS.getStream(fd)
      if (!stream) throw new FS.ErrnoError(8)
      var flags = SYSCALLS.DEFAULT_POLLMASK
      if (stream.stream_ops.poll) {
        flags = stream.stream_ops.poll(stream)
      }
      if (flags & 1 && check(fd, srcReadLow, srcReadHigh, mask)) {
        fd < 32 ? (dstReadLow = dstReadLow | mask) : (dstReadHigh = dstReadHigh | mask)
        total++
      }
      if (flags & 4 && check(fd, srcWriteLow, srcWriteHigh, mask)) {
        fd < 32 ? (dstWriteLow = dstWriteLow | mask) : (dstWriteHigh = dstWriteHigh | mask)
        total++
      }
      if (flags & 2 && check(fd, srcExceptLow, srcExceptHigh, mask)) {
        fd < 32 ? (dstExceptLow = dstExceptLow | mask) : (dstExceptHigh = dstExceptHigh | mask)
        total++
      }
    }
    if (readfds) {
      HEAP32[readfds >> 2] = dstReadLow
      HEAP32[(readfds + 4) >> 2] = dstReadHigh
    }
    if (writefds) {
      HEAP32[writefds >> 2] = dstWriteLow
      HEAP32[(writefds + 4) >> 2] = dstWriteHigh
    }
    if (exceptfds) {
      HEAP32[exceptfds >> 2] = dstExceptLow
      HEAP32[(exceptfds + 4) >> 2] = dstExceptHigh
    }
    return total
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_access(path, amode) {
  try {
    path = SYSCALLS.getStr(path)
    return SYSCALLS.doAccess(path, amode)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
var SOCKFS = {
  mount: function (mount) {
    Module['websocket'] =
      Module['websocket'] && 'object' === typeof Module['websocket'] ? Module['websocket'] : {}
    Module['websocket']._callbacks = {}
    Module['websocket']['on'] = function (event, callback) {
      if ('function' === typeof callback) {
        this._callbacks[event] = callback
      }
      return this
    }
    Module['websocket'].emit = function (event, param) {
      if ('function' === typeof this._callbacks[event]) {
        this._callbacks[event].call(this, param)
      }
    }
    return FS.createNode(null, '/', 16384 | 511, 0)
  },
  createSocket: function (family, type, protocol) {
    type &= ~526336
    var streaming = type == 1
    if (protocol) {
      assert(streaming == (protocol == 6))
    }
    var sock = {
      family: family,
      type: type,
      protocol: protocol,
      server: null,
      error: null,
      peers: {},
      pending: [],
      recv_queue: [],
      sock_ops: SOCKFS.websocket_sock_ops
    }
    var name = SOCKFS.nextname()
    var node = FS.createNode(SOCKFS.root, name, 49152, 0)
    node.sock = sock
    var stream = FS.createStream({
      path: name,
      node: node,
      flags: 2,
      seekable: false,
      stream_ops: SOCKFS.stream_ops
    })
    sock.stream = stream
    return sock
  },
  getSocket: function (fd) {
    var stream = FS.getStream(fd)
    if (!stream || !FS.isSocket(stream.node.mode)) {
      return null
    }
    return stream.node.sock
  },
  stream_ops: {
    poll: function (stream) {
      var sock = stream.node.sock
      return sock.sock_ops.poll(sock)
    },
    ioctl: function (stream, request, varargs) {
      var sock = stream.node.sock
      return sock.sock_ops.ioctl(sock, request, varargs)
    },
    read: function (stream, buffer, offset, length, position) {
      var sock = stream.node.sock
      var msg = sock.sock_ops.recvmsg(sock, length)
      if (!msg) {
        return 0
      }
      buffer.set(msg.buffer, offset)
      return msg.buffer.length
    },
    write: function (stream, buffer, offset, length, position) {
      var sock = stream.node.sock
      return sock.sock_ops.sendmsg(sock, buffer, offset, length)
    },
    close: function (stream) {
      var sock = stream.node.sock
      sock.sock_ops.close(sock)
    }
  },
  nextname: function () {
    if (!SOCKFS.nextname.current) {
      SOCKFS.nextname.current = 0
    }
    return 'socket[' + SOCKFS.nextname.current++ + ']'
  },
  websocket_sock_ops: {
    createPeer: function (sock, addr, port) {
      var ws
      if (typeof addr === 'object') {
        ws = addr
        addr = null
        port = null
      }
      if (ws) {
        if (ws._socket) {
          addr = ws._socket.remoteAddress
          port = ws._socket.remotePort
        } else {
          var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url)
          if (!result) {
            throw new Error('WebSocket URL must be in the format ws(s)://address:port')
          }
          addr = result[1]
          port = parseInt(result[2], 10)
        }
      } else {
        try {
          var runtimeConfig = Module['websocket'] && 'object' === typeof Module['websocket']
          var url = 'ws:#'.replace('#', '//')
          if (runtimeConfig) {
            if ('string' === typeof Module['websocket']['url']) {
              url = Module['websocket']['url']
            }
          }
          if (url === 'ws://' || url === 'wss://') {
            var parts = addr.split('/')
            url = url + parts[0] + ':' + port + '/' + parts.slice(1).join('/')
          }
          var subProtocols = 'binary'
          if (runtimeConfig) {
            if ('string' === typeof Module['websocket']['subprotocol']) {
              subProtocols = Module['websocket']['subprotocol']
            }
          }
          var opts = undefined
          if (subProtocols !== 'null') {
            subProtocols = subProtocols.replace(/^ +| +$/g, '').split(/ *, */)
            opts = ENVIRONMENT_IS_NODE ? { protocol: subProtocols.toString() } : subProtocols
          }
          if (runtimeConfig && null === Module['websocket']['subprotocol']) {
            subProtocols = 'null'
            opts = undefined
          }
          var WebSocketConstructor
          {
            WebSocketConstructor = WebSocket
          }
          ws = new WebSocketConstructor(url, opts)
          ws.binaryType = 'arraybuffer'
        } catch (e) {
          throw new FS.ErrnoError(23)
        }
      }
      var peer = { addr: addr, port: port, socket: ws, dgram_send_queue: [] }
      SOCKFS.websocket_sock_ops.addPeer(sock, peer)
      SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer)
      if (sock.type === 2 && typeof sock.sport !== 'undefined') {
        peer.dgram_send_queue.push(
          new Uint8Array([
            255,
            255,
            255,
            255,
            'p'.charCodeAt(0),
            'o'.charCodeAt(0),
            'r'.charCodeAt(0),
            't'.charCodeAt(0),
            (sock.sport & 65280) >> 8,
            sock.sport & 255
          ])
        )
      }
      return peer
    },
    getPeer: function (sock, addr, port) {
      return sock.peers[addr + ':' + port]
    },
    addPeer: function (sock, peer) {
      sock.peers[peer.addr + ':' + peer.port] = peer
    },
    removePeer: function (sock, peer) {
      delete sock.peers[peer.addr + ':' + peer.port]
    },
    handlePeerEvents: function (sock, peer) {
      var first = true
      var handleOpen = function () {
        Module['websocket'].emit('open', sock.stream.fd)
        try {
          var queued = peer.dgram_send_queue.shift()
          while (queued) {
            peer.socket.send(queued)
            queued = peer.dgram_send_queue.shift()
          }
        } catch (e) {
          peer.socket.close()
        }
      }
      function handleMessage(data) {
        if (typeof data === 'string') {
          var encoder = new TextEncoder()
          data = encoder.encode(data)
        } else {
          assert(data.byteLength !== undefined)
          if (data.byteLength == 0) {
            return
          } else {
            data = new Uint8Array(data)
          }
        }
        var wasfirst = first
        first = false
        if (
          wasfirst &&
          data.length === 10 &&
          data[0] === 255 &&
          data[1] === 255 &&
          data[2] === 255 &&
          data[3] === 255 &&
          data[4] === 'p'.charCodeAt(0) &&
          data[5] === 'o'.charCodeAt(0) &&
          data[6] === 'r'.charCodeAt(0) &&
          data[7] === 't'.charCodeAt(0)
        ) {
          var newport = (data[8] << 8) | data[9]
          SOCKFS.websocket_sock_ops.removePeer(sock, peer)
          peer.port = newport
          SOCKFS.websocket_sock_ops.addPeer(sock, peer)
          return
        }
        sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data })
        Module['websocket'].emit('message', sock.stream.fd)
      }
      if (ENVIRONMENT_IS_NODE) {
        peer.socket.on('open', handleOpen)
        peer.socket.on('message', function (data, flags) {
          if (!flags.binary) {
            return
          }
          handleMessage(new Uint8Array(data).buffer)
        })
        peer.socket.on('close', function () {
          Module['websocket'].emit('close', sock.stream.fd)
        })
        peer.socket.on('error', function (error) {
          sock.error = 14
          Module['websocket'].emit('error', [
            sock.stream.fd,
            sock.error,
            'ECONNREFUSED: Connection refused'
          ])
        })
      } else {
        peer.socket.onopen = handleOpen
        peer.socket.onclose = function () {
          Module['websocket'].emit('close', sock.stream.fd)
        }
        peer.socket.onmessage = function peer_socket_onmessage(event) {
          handleMessage(event.data)
        }
        peer.socket.onerror = function (error) {
          sock.error = 14
          Module['websocket'].emit('error', [
            sock.stream.fd,
            sock.error,
            'ECONNREFUSED: Connection refused'
          ])
        }
      }
    },
    poll: function (sock) {
      if (sock.type === 1 && sock.server) {
        return sock.pending.length ? 64 | 1 : 0
      }
      var mask = 0
      var dest =
        sock.type === 1 ? SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) : null
      if (
        sock.recv_queue.length ||
        !dest ||
        (dest && dest.socket.readyState === dest.socket.CLOSING) ||
        (dest && dest.socket.readyState === dest.socket.CLOSED)
      ) {
        mask |= 64 | 1
      }
      if (!dest || (dest && dest.socket.readyState === dest.socket.OPEN)) {
        mask |= 4
      }
      if (
        (dest && dest.socket.readyState === dest.socket.CLOSING) ||
        (dest && dest.socket.readyState === dest.socket.CLOSED)
      ) {
        mask |= 16
      }
      return mask
    },
    ioctl: function (sock, request, arg) {
      switch (request) {
        case 21531:
          var bytes = 0
          if (sock.recv_queue.length) {
            bytes = sock.recv_queue[0].data.length
          }
          HEAP32[arg >> 2] = bytes
          return 0
        default:
          return 28
      }
    },
    close: function (sock) {
      if (sock.server) {
        try {
          sock.server.close()
        } catch (e) {}
        sock.server = null
      }
      var peers = Object.keys(sock.peers)
      for (var i = 0; i < peers.length; i++) {
        var peer = sock.peers[peers[i]]
        try {
          peer.socket.close()
        } catch (e) {}
        SOCKFS.websocket_sock_ops.removePeer(sock, peer)
      }
      return 0
    },
    bind: function (sock, addr, port) {
      if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
        throw new FS.ErrnoError(28)
      }
      sock.saddr = addr
      sock.sport = port
      if (sock.type === 2) {
        if (sock.server) {
          sock.server.close()
          sock.server = null
        }
        try {
          sock.sock_ops.listen(sock, 0)
        } catch (e) {
          if (!(e instanceof FS.ErrnoError)) throw e
          if (e.errno !== 138) throw e
        }
      }
    },
    connect: function (sock, addr, port) {
      if (sock.server) {
        throw new FS.ErrnoError(138)
      }
      if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
        var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport)
        if (dest) {
          if (dest.socket.readyState === dest.socket.CONNECTING) {
            throw new FS.ErrnoError(7)
          } else {
            throw new FS.ErrnoError(30)
          }
        }
      }
      var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port)
      sock.daddr = peer.addr
      sock.dport = peer.port
      throw new FS.ErrnoError(26)
    },
    listen: function (sock, backlog) {
      if (!ENVIRONMENT_IS_NODE) {
        throw new FS.ErrnoError(138)
      }
    },
    accept: function (listensock) {
      if (!listensock.server) {
        throw new FS.ErrnoError(28)
      }
      var newsock = listensock.pending.shift()
      newsock.stream.flags = listensock.stream.flags
      return newsock
    },
    getname: function (sock, peer) {
      var addr, port
      if (peer) {
        if (sock.daddr === undefined || sock.dport === undefined) {
          throw new FS.ErrnoError(53)
        }
        addr = sock.daddr
        port = sock.dport
      } else {
        addr = sock.saddr || 0
        port = sock.sport || 0
      }
      return { addr: addr, port: port }
    },
    sendmsg: function (sock, buffer, offset, length, addr, port) {
      if (sock.type === 2) {
        if (addr === undefined || port === undefined) {
          addr = sock.daddr
          port = sock.dport
        }
        if (addr === undefined || port === undefined) {
          throw new FS.ErrnoError(17)
        }
      } else {
        addr = sock.daddr
        port = sock.dport
      }
      var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port)
      if (sock.type === 1) {
        if (
          !dest ||
          dest.socket.readyState === dest.socket.CLOSING ||
          dest.socket.readyState === dest.socket.CLOSED
        ) {
          throw new FS.ErrnoError(53)
        } else if (dest.socket.readyState === dest.socket.CONNECTING) {
          throw new FS.ErrnoError(6)
        }
      }
      if (ArrayBuffer.isView(buffer)) {
        offset += buffer.byteOffset
        buffer = buffer.buffer
      }
      var data
      data = buffer.slice(offset, offset + length)
      if (sock.type === 2) {
        if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
          if (
            !dest ||
            dest.socket.readyState === dest.socket.CLOSING ||
            dest.socket.readyState === dest.socket.CLOSED
          ) {
            dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port)
          }
          dest.dgram_send_queue.push(data)
          return length
        }
      }
      try {
        dest.socket.send(data)
        return length
      } catch (e) {
        throw new FS.ErrnoError(28)
      }
    },
    recvmsg: function (sock, length) {
      if (sock.type === 1 && sock.server) {
        throw new FS.ErrnoError(53)
      }
      var queued = sock.recv_queue.shift()
      if (!queued) {
        if (sock.type === 1) {
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport)
          if (!dest) {
            throw new FS.ErrnoError(53)
          } else if (
            dest.socket.readyState === dest.socket.CLOSING ||
            dest.socket.readyState === dest.socket.CLOSED
          ) {
            return null
          } else {
            throw new FS.ErrnoError(6)
          }
        } else {
          throw new FS.ErrnoError(6)
        }
      }
      var queuedLength = queued.data.byteLength || queued.data.length
      var queuedOffset = queued.data.byteOffset || 0
      var queuedBuffer = queued.data.buffer || queued.data
      var bytesRead = Math.min(length, queuedLength)
      var res = {
        buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
        addr: queued.addr,
        port: queued.port
      }
      if (sock.type === 1 && bytesRead < queuedLength) {
        var bytesRemaining = queuedLength - bytesRead
        queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining)
        sock.recv_queue.unshift(queued)
      }
      return res
    }
  }
}
function getSocketFromFD(fd) {
  var socket = SOCKFS.getSocket(fd)
  if (!socket) throw new FS.ErrnoError(8)
  return socket
}
function inetNtop4(addr) {
  return (
    (addr & 255) +
    '.' +
    ((addr >> 8) & 255) +
    '.' +
    ((addr >> 16) & 255) +
    '.' +
    ((addr >> 24) & 255)
  )
}
function inetNtop6(ints) {
  var str = ''
  var word = 0
  var longest = 0
  var lastzero = 0
  var zstart = 0
  var len = 0
  var i = 0
  var parts = [
    ints[0] & 65535,
    ints[0] >> 16,
    ints[1] & 65535,
    ints[1] >> 16,
    ints[2] & 65535,
    ints[2] >> 16,
    ints[3] & 65535,
    ints[3] >> 16
  ]
  var hasipv4 = true
  var v4part = ''
  for (i = 0; i < 5; i++) {
    if (parts[i] !== 0) {
      hasipv4 = false
      break
    }
  }
  if (hasipv4) {
    v4part = inetNtop4(parts[6] | (parts[7] << 16))
    if (parts[5] === -1) {
      str = '::ffff:'
      str += v4part
      return str
    }
    if (parts[5] === 0) {
      str = '::'
      if (v4part === '0.0.0.0') v4part = ''
      if (v4part === '0.0.0.1') v4part = '1'
      str += v4part
      return str
    }
  }
  for (word = 0; word < 8; word++) {
    if (parts[word] === 0) {
      if (word - lastzero > 1) {
        len = 0
      }
      lastzero = word
      len++
    }
    if (len > longest) {
      longest = len
      zstart = word - longest + 1
    }
  }
  for (word = 0; word < 8; word++) {
    if (longest > 1) {
      if (parts[word] === 0 && word >= zstart && word < zstart + longest) {
        if (word === zstart) {
          str += ':'
          if (zstart === 0) str += ':'
        }
        continue
      }
    }
    str += Number(_ntohs(parts[word] & 65535)).toString(16)
    str += word < 7 ? ':' : ''
  }
  return str
}
function readSockaddr(sa, salen) {
  var family = HEAP16[sa >> 1]
  var port = _ntohs(HEAPU16[(sa + 2) >> 1])
  var addr
  switch (family) {
    case 2:
      if (salen !== 16) {
        return { errno: 28 }
      }
      addr = HEAP32[(sa + 4) >> 2]
      addr = inetNtop4(addr)
      break
    case 10:
      if (salen !== 28) {
        return { errno: 28 }
      }
      addr = [
        HEAP32[(sa + 8) >> 2],
        HEAP32[(sa + 12) >> 2],
        HEAP32[(sa + 16) >> 2],
        HEAP32[(sa + 20) >> 2]
      ]
      addr = inetNtop6(addr)
      break
    default:
      return { errno: 5 }
  }
  return { family: family, addr: addr, port: port }
}
function inetPton4(str) {
  var b = str.split('.')
  for (var i = 0; i < 4; i++) {
    var tmp = Number(b[i])
    if (isNaN(tmp)) return null
    b[i] = tmp
  }
  return (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0
}
function jstoi_q(str) {
  return parseInt(str)
}
function inetPton6(str) {
  var words
  var w, offset, z
  var valid6regx =
    /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i
  var parts = []
  if (!valid6regx.test(str)) {
    return null
  }
  if (str === '::') {
    return [0, 0, 0, 0, 0, 0, 0, 0]
  }
  if (str.startsWith('::')) {
    str = str.replace('::', 'Z:')
  } else {
    str = str.replace('::', ':Z:')
  }
  if (str.indexOf('.') > 0) {
    str = str.replace(new RegExp('[.]', 'g'), ':')
    words = str.split(':')
    words[words.length - 4] =
      jstoi_q(words[words.length - 4]) + jstoi_q(words[words.length - 3]) * 256
    words[words.length - 3] =
      jstoi_q(words[words.length - 2]) + jstoi_q(words[words.length - 1]) * 256
    words = words.slice(0, words.length - 2)
  } else {
    words = str.split(':')
  }
  offset = 0
  z = 0
  for (w = 0; w < words.length; w++) {
    if (typeof words[w] === 'string') {
      if (words[w] === 'Z') {
        for (z = 0; z < 8 - words.length + 1; z++) {
          parts[w + z] = 0
        }
        offset = z - 1
      } else {
        parts[w + offset] = _htons(parseInt(words[w], 16))
      }
    } else {
      parts[w + offset] = words[w]
    }
  }
  return [
    (parts[1] << 16) | parts[0],
    (parts[3] << 16) | parts[2],
    (parts[5] << 16) | parts[4],
    (parts[7] << 16) | parts[6]
  ]
}
var DNS = {
  address_map: { id: 1, addrs: {}, names: {} },
  lookup_name: function (name) {
    var res = inetPton4(name)
    if (res !== null) {
      return name
    }
    res = inetPton6(name)
    if (res !== null) {
      return name
    }
    var addr
    if (DNS.address_map.addrs[name]) {
      addr = DNS.address_map.addrs[name]
    } else {
      var id = DNS.address_map.id++
      assert(id < 65535, 'exceeded max address mappings of 65535')
      addr = '172.29.' + (id & 255) + '.' + (id & 65280)
      DNS.address_map.names[addr] = name
      DNS.address_map.addrs[name] = addr
    }
    return addr
  },
  lookup_addr: function (addr) {
    if (DNS.address_map.names[addr]) {
      return DNS.address_map.names[addr]
    }
    return null
  }
}
function getSocketAddress(addrp, addrlen, allowNull) {
  if (allowNull && addrp === 0) return null
  var info = readSockaddr(addrp, addrlen)
  if (info.errno) throw new FS.ErrnoError(info.errno)
  info.addr = DNS.lookup_addr(info.addr) || info.addr
  return info
}
function ___syscall_bind(fd, addr, addrlen) {
  try {
    var sock = getSocketFromFD(fd)
    var info = getSocketAddress(addr, addrlen)
    sock.sock_ops.bind(sock, info.addr, info.port)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_chdir(path) {
  try {
    path = SYSCALLS.getStr(path)
    FS.chdir(path)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_chmod(path, mode) {
  try {
    path = SYSCALLS.getStr(path)
    FS.chmod(path, mode)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_connect(fd, addr, addrlen) {
  try {
    var sock = getSocketFromFD(fd)
    var info = getSocketAddress(addr, addrlen)
    sock.sock_ops.connect(sock, info.addr, info.port)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_fchmod(fd, mode) {
  try {
    FS.fchmod(fd, mode)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_fcntl64(fd, cmd, varargs) {
  SYSCALLS.varargs = varargs
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    switch (cmd) {
      case 0: {
        var arg = SYSCALLS.get()
        if (arg < 0) {
          return -28
        }
        var newStream
        newStream = FS.open(stream.path, stream.flags, 0, arg)
        return newStream.fd
      }
      case 1:
      case 2:
        return 0
      case 3:
        return stream.flags
      case 4: {
        var arg = SYSCALLS.get()
        stream.flags |= arg
        return 0
      }
      case 5: {
        var arg = SYSCALLS.get()
        var offset = 0
        HEAP16[(arg + offset) >> 1] = 2
        return 0
      }
      case 6:
      case 7:
        return 0
      case 16:
      case 8:
        return -28
      case 9:
        setErrNo(28)
        return -1
      default: {
        return -28
      }
    }
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_fstat64(fd, buf) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    return SYSCALLS.doStat(FS.stat, stream.path, buf)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_fstatat64(dirfd, path, buf, flags) {
  try {
    path = SYSCALLS.getStr(path)
    var nofollow = flags & 256
    var allowEmpty = flags & 4096
    flags = flags & ~4352
    path = SYSCALLS.calculateAt(dirfd, path, allowEmpty)
    return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_statfs64(path, size, buf) {
  try {
    path = SYSCALLS.getStr(path)
    HEAP32[(buf + 4) >> 2] = 4096
    HEAP32[(buf + 40) >> 2] = 4096
    HEAP32[(buf + 8) >> 2] = 1e6
    HEAP32[(buf + 12) >> 2] = 5e5
    HEAP32[(buf + 16) >> 2] = 5e5
    HEAP32[(buf + 20) >> 2] = FS.nextInode
    HEAP32[(buf + 24) >> 2] = 1e6
    HEAP32[(buf + 28) >> 2] = 42
    HEAP32[(buf + 44) >> 2] = 2
    HEAP32[(buf + 36) >> 2] = 255
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_fstatfs64(fd, size, buf) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    return ___syscall_statfs64(0, size, buf)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_getcwd(buf, size) {
  try {
    if (size === 0) return -28
    var cwd = FS.cwd()
    var cwdLengthInBytes = lengthBytesUTF8(cwd)
    if (size < cwdLengthInBytes + 1) return -68
    stringToUTF8(cwd, buf, size)
    return buf
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_getdents64(fd, dirp, count) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    if (!stream.getdents) {
      stream.getdents = FS.readdir(stream.path)
    }
    var struct_size = 280
    var pos = 0
    var off = FS.llseek(stream, 0, 1)
    var idx = Math.floor(off / struct_size)
    while (idx < stream.getdents.length && pos + struct_size <= count) {
      var id
      var type
      var name = stream.getdents[idx]
      if (name === '.') {
        id = stream.id
        type = 4
      } else if (name === '..') {
        var lookup = FS.lookupPath(stream.path, { parent: true })
        id = lookup.node.id
        type = 4
      } else {
        var child = FS.lookupNode(stream, name)
        id = child.id
        type = FS.isChrdev(child.mode)
          ? 2
          : FS.isDir(child.mode)
            ? 4
            : FS.isLink(child.mode)
              ? 10
              : 8
      }
      ;(tempI64 = [
        id >>> 0,
        ((tempDouble = id),
        +Math.abs(tempDouble) >= 1
          ? tempDouble > 0
            ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
            : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
          : 0)
      ]),
        (HEAP32[(dirp + pos) >> 2] = tempI64[0]),
        (HEAP32[(dirp + pos + 4) >> 2] = tempI64[1])
      ;(tempI64 = [
        ((idx + 1) * struct_size) >>> 0,
        ((tempDouble = (idx + 1) * struct_size),
        +Math.abs(tempDouble) >= 1
          ? tempDouble > 0
            ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
            : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
          : 0)
      ]),
        (HEAP32[(dirp + pos + 8) >> 2] = tempI64[0]),
        (HEAP32[(dirp + pos + 12) >> 2] = tempI64[1])
      HEAP16[(dirp + pos + 16) >> 1] = 280
      HEAP8[(dirp + pos + 18) >> 0] = type
      stringToUTF8(name, dirp + pos + 19, 256)
      pos += struct_size
      idx += 1
    }
    FS.llseek(stream, idx * struct_size, 0)
    return pos
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function writeSockaddr(sa, family, addr, port, addrlen) {
  switch (family) {
    case 2:
      addr = inetPton4(addr)
      zeroMemory(sa, 16)
      if (addrlen) {
        HEAP32[addrlen >> 2] = 16
      }
      HEAP16[sa >> 1] = family
      HEAP32[(sa + 4) >> 2] = addr
      HEAP16[(sa + 2) >> 1] = _htons(port)
      break
    case 10:
      addr = inetPton6(addr)
      zeroMemory(sa, 28)
      if (addrlen) {
        HEAP32[addrlen >> 2] = 28
      }
      HEAP32[sa >> 2] = family
      HEAP32[(sa + 8) >> 2] = addr[0]
      HEAP32[(sa + 12) >> 2] = addr[1]
      HEAP32[(sa + 16) >> 2] = addr[2]
      HEAP32[(sa + 20) >> 2] = addr[3]
      HEAP16[(sa + 2) >> 1] = _htons(port)
      break
    default:
      return 5
  }
  return 0
}
function ___syscall_getsockname(fd, addr, addrlen) {
  try {
    err('__syscall_getsockname ' + fd)
    var sock = getSocketFromFD(fd)
    var errno = writeSockaddr(
      addr,
      sock.family,
      DNS.lookup_name(sock.saddr || '0.0.0.0'),
      sock.sport,
      addrlen
    )
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_getsockopt(fd, level, optname, optval, optlen) {
  try {
    var sock = getSocketFromFD(fd)
    if (level === 1) {
      if (optname === 4) {
        HEAP32[optval >> 2] = sock.error
        HEAP32[optlen >> 2] = 4
        sock.error = null
        return 0
      }
    }
    return -50
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_ioctl(fd, op, varargs) {
  SYSCALLS.varargs = varargs
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    switch (op) {
      case 21509:
      case 21505: {
        if (!stream.tty) return -59
        return 0
      }
      case 21510:
      case 21511:
      case 21512:
      case 21506:
      case 21507:
      case 21508: {
        if (!stream.tty) return -59
        return 0
      }
      case 21519: {
        if (!stream.tty) return -59
        var argp = SYSCALLS.get()
        HEAP32[argp >> 2] = 0
        return 0
      }
      case 21520: {
        if (!stream.tty) return -59
        return -28
      }
      case 21531: {
        var argp = SYSCALLS.get()
        return FS.ioctl(stream, op, argp)
      }
      case 21523: {
        if (!stream.tty) return -59
        return 0
      }
      case 21524: {
        if (!stream.tty) return -59
        return 0
      }
      default:
        abort('bad ioctl syscall ' + op)
    }
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_listen(fd, backlog) {
  try {
    var sock = getSocketFromFD(fd)
    sock.sock_ops.listen(sock, backlog)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_lstat64(path, buf) {
  try {
    path = SYSCALLS.getStr(path)
    return SYSCALLS.doStat(FS.lstat, path, buf)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_mkdir(path, mode) {
  try {
    path = SYSCALLS.getStr(path)
    return SYSCALLS.doMkdir(path, mode)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function syscallMmap2(addr, len, prot, flags, fd, off) {
  off <<= 12
  var ptr
  var allocated = false
  if ((flags & 16) !== 0 && addr % 65536 !== 0) {
    return -28
  }
  if ((flags & 32) !== 0) {
    ptr = mmapAlloc(len)
    if (!ptr) return -48
    allocated = true
  } else {
    var info = FS.getStream(fd)
    if (!info) return -8
    var res = FS.mmap(info, addr, len, off, prot, flags)
    ptr = res.ptr
    allocated = res.allocated
  }
  SYSCALLS.mappings[ptr] = {
    malloc: ptr,
    len: len,
    allocated: allocated,
    fd: fd,
    prot: prot,
    flags: flags,
    offset: off
  }
  return ptr
}
function ___syscall_mmap2(addr, len, prot, flags, fd, off) {
  try {
    return syscallMmap2(addr, len, prot, flags, fd, off)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function syscallMunmap(addr, len) {
  var info = SYSCALLS.mappings[addr]
  if (len === 0 || !info) {
    return -28
  }
  if (len === info.len) {
    var stream = FS.getStream(info.fd)
    if (stream) {
      if (info.prot & 2) {
        SYSCALLS.doMsync(addr, stream, len, info.flags, info.offset)
      }
      FS.munmap(stream)
    }
    SYSCALLS.mappings[addr] = null
    if (info.allocated) {
      _free(info.malloc)
    }
  }
  return 0
}
function ___syscall_munmap(addr, len) {
  try {
    return syscallMunmap(addr, len)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_open(path, flags, varargs) {
  SYSCALLS.varargs = varargs
  try {
    var pathname = SYSCALLS.getStr(path)
    var mode = varargs ? SYSCALLS.get() : 0
    var stream = FS.open(pathname, flags, mode)
    return stream.fd
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_poll(fds, nfds, timeout) {
  try {
    var nonzero = 0
    for (var i = 0; i < nfds; i++) {
      var pollfd = fds + 8 * i
      var fd = HEAP32[pollfd >> 2]
      var events = HEAP16[(pollfd + 4) >> 1]
      var mask = 32
      var stream = FS.getStream(fd)
      if (stream) {
        mask = SYSCALLS.DEFAULT_POLLMASK
        if (stream.stream_ops.poll) {
          mask = stream.stream_ops.poll(stream)
        }
      }
      mask &= events | 8 | 16
      if (mask) nonzero++
      HEAP16[(pollfd + 6) >> 1] = mask
    }
    return nonzero
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_readlink(path, buf, bufsize) {
  try {
    path = SYSCALLS.getStr(path)
    return SYSCALLS.doReadlink(path, buf, bufsize)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_recvfrom(fd, buf, len, flags, addr, addrlen) {
  try {
    var sock = getSocketFromFD(fd)
    var msg = sock.sock_ops.recvmsg(sock, len)
    if (!msg) return 0
    if (addr) {
      var errno = writeSockaddr(addr, sock.family, DNS.lookup_name(msg.addr), msg.port, addrlen)
    }
    HEAPU8.set(msg.buffer, buf)
    return msg.buffer.byteLength
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_rename(old_path, new_path) {
  try {
    old_path = SYSCALLS.getStr(old_path)
    new_path = SYSCALLS.getStr(new_path)
    FS.rename(old_path, new_path)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_rmdir(path) {
  try {
    path = SYSCALLS.getStr(path)
    FS.rmdir(path)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_sendto(fd, message, length, flags, addr, addr_len) {
  try {
    var sock = getSocketFromFD(fd)
    var dest = getSocketAddress(addr, addr_len, true)
    if (!dest) {
      return FS.write(sock.stream, HEAP8, message, length)
    } else {
      return sock.sock_ops.sendmsg(sock, HEAP8, message, length, dest.addr, dest.port)
    }
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_socket(domain, type, protocol) {
  try {
    var sock = SOCKFS.createSocket(domain, type, protocol)
    return sock.stream.fd
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_stat64(path, buf) {
  try {
    path = SYSCALLS.getStr(path)
    return SYSCALLS.doStat(FS.stat, path, buf)
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_symlink(target, linkpath) {
  try {
    target = SYSCALLS.getStr(target)
    linkpath = SYSCALLS.getStr(linkpath)
    FS.symlink(target, linkpath)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function ___syscall_unlink(path) {
  try {
    path = SYSCALLS.getStr(path)
    FS.unlink(path)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return -e.errno
  }
}
function __emscripten_throw_longjmp() {
  throw 'longjmp'
}
function _abort() {
  abort('')
}
function _emscripten_get_heap_max() {
  return 2147483648
}
function _emscripten_memcpy_big(dest, src, num) {
  HEAPU8.copyWithin(dest, src, src + num)
}
function emscripten_realloc_buffer(size) {
  try {
    wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16)
    updateGlobalBufferAndViews(wasmMemory.buffer)
    return 1
  } catch (e) {}
}
function _emscripten_resize_heap(requestedSize) {
  var oldSize = HEAPU8.length
  requestedSize = requestedSize >>> 0
  var maxHeapSize = 2147483648
  if (requestedSize > maxHeapSize) {
    return false
  }
  for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
    var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown)
    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296)
    var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536))
    var replacement = emscripten_realloc_buffer(newSize)
    if (replacement) {
      return true
    }
  }
  return false
}
var ENV = {}
function getExecutableName() {
  return thisProgram || './this.program'
}
function getEnvStrings() {
  if (!getEnvStrings.strings) {
    var lang =
      (
        (typeof navigator === 'object' && navigator.languages && navigator.languages[0]) ||
        'C'
      ).replace('-', '_') + '.UTF-8'
    var env = {
      USER: 'web_user',
      LOGNAME: 'web_user',
      PATH: '/',
      PWD: '/',
      HOME: '/home/web_user',
      LANG: lang,
      _: getExecutableName()
    }
    for (var x in ENV) {
      if (ENV[x] === undefined) delete env[x]
      else env[x] = ENV[x]
    }
    var strings = []
    for (var x in env) {
      strings.push(x + '=' + env[x])
    }
    getEnvStrings.strings = strings
  }
  return getEnvStrings.strings
}
function _environ_get(__environ, environ_buf) {
  var bufSize = 0
  getEnvStrings().forEach(function (string, i) {
    var ptr = environ_buf + bufSize
    HEAP32[(__environ + i * 4) >> 2] = ptr
    writeAsciiToMemory(string, ptr)
    bufSize += string.length + 1
  })
  return 0
}
function _environ_sizes_get(penviron_count, penviron_buf_size) {
  var strings = getEnvStrings()
  HEAP32[penviron_count >> 2] = strings.length
  var bufSize = 0
  strings.forEach(function (string) {
    bufSize += string.length + 1
  })
  HEAP32[penviron_buf_size >> 2] = bufSize
  return 0
}
function _exit(status) {
  exit(status)
}
function _fd_close(fd) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    FS.close(stream)
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return e.errno
  }
}
function _fd_fdstat_get(fd, pbuf) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4
    HEAP8[pbuf >> 0] = type
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return e.errno
  }
}
function _fd_read(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    var num = SYSCALLS.doReadv(stream, iov, iovcnt)
    HEAP32[pnum >> 2] = num
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return e.errno
  }
}
function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    var HIGH_OFFSET = 4294967296
    var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0)
    var DOUBLE_LIMIT = 9007199254740992
    if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
      return -61
    }
    FS.llseek(stream, offset, whence)
    ;(tempI64 = [
      stream.position >>> 0,
      ((tempDouble = stream.position),
      +Math.abs(tempDouble) >= 1
        ? tempDouble > 0
          ? (Math.min(+Math.floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0
          : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0
        : 0)
    ]),
      (HEAP32[newOffset >> 2] = tempI64[0]),
      (HEAP32[(newOffset + 4) >> 2] = tempI64[1])
    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return e.errno
  }
}
function _fd_write(fd, iov, iovcnt, pnum) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd)
    var num = SYSCALLS.doWritev(stream, iov, iovcnt)
    HEAP32[pnum >> 2] = num
    return 0
  } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) throw e
    return e.errno
  }
}
function _getTempRet0() {
  return getTempRet0()
}
function getHostByName(name) {
  var ret = _malloc(20)
  var nameBuf = _malloc(name.length + 1)
  stringToUTF8(name, nameBuf, name.length + 1)
  HEAP32[ret >> 2] = nameBuf
  var aliasesBuf = _malloc(4)
  HEAP32[aliasesBuf >> 2] = 0
  HEAP32[(ret + 4) >> 2] = aliasesBuf
  var afinet = 2
  HEAP32[(ret + 8) >> 2] = afinet
  HEAP32[(ret + 12) >> 2] = 4
  var addrListBuf = _malloc(12)
  HEAP32[addrListBuf >> 2] = addrListBuf + 8
  HEAP32[(addrListBuf + 4) >> 2] = 0
  HEAP32[(addrListBuf + 8) >> 2] = inetPton4(DNS.lookup_name(name))
  HEAP32[(ret + 16) >> 2] = addrListBuf
  return ret
}
function _gethostbyname(name) {
  return getHostByName(UTF8ToString(name))
}
function _tzset_impl() {
  var currentYear = new Date().getFullYear()
  var winter = new Date(currentYear, 0, 1)
  var summer = new Date(currentYear, 6, 1)
  var winterOffset = winter.getTimezoneOffset()
  var summerOffset = summer.getTimezoneOffset()
  var stdTimezoneOffset = Math.max(winterOffset, summerOffset)
  HEAP32[__get_timezone() >> 2] = stdTimezoneOffset * 60
  HEAP32[__get_daylight() >> 2] = Number(winterOffset != summerOffset)
  function extractZone(date) {
    var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/)
    return match ? match[1] : 'GMT'
  }
  var winterName = extractZone(winter)
  var summerName = extractZone(summer)
  var winterNamePtr = allocateUTF8(winterName)
  var summerNamePtr = allocateUTF8(summerName)
  if (summerOffset < winterOffset) {
    HEAP32[__get_tzname() >> 2] = winterNamePtr
    HEAP32[(__get_tzname() + 4) >> 2] = summerNamePtr
  } else {
    HEAP32[__get_tzname() >> 2] = summerNamePtr
    HEAP32[(__get_tzname() + 4) >> 2] = winterNamePtr
  }
}
function _tzset() {
  if (_tzset.called) return
  _tzset.called = true
  _tzset_impl()
}
function _localtime_r(time, tmPtr) {
  _tzset()
  var date = new Date(HEAP32[time >> 2] * 1e3)
  HEAP32[tmPtr >> 2] = date.getSeconds()
  HEAP32[(tmPtr + 4) >> 2] = date.getMinutes()
  HEAP32[(tmPtr + 8) >> 2] = date.getHours()
  HEAP32[(tmPtr + 12) >> 2] = date.getDate()
  HEAP32[(tmPtr + 16) >> 2] = date.getMonth()
  HEAP32[(tmPtr + 20) >> 2] = date.getFullYear() - 1900
  HEAP32[(tmPtr + 24) >> 2] = date.getDay()
  var start = new Date(date.getFullYear(), 0, 1)
  var yday = ((date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) | 0
  HEAP32[(tmPtr + 28) >> 2] = yday
  HEAP32[(tmPtr + 36) >> 2] = -(date.getTimezoneOffset() * 60)
  var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
  var winterOffset = start.getTimezoneOffset()
  var dst =
    (summerOffset != winterOffset &&
      date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0
  HEAP32[(tmPtr + 32) >> 2] = dst
  var zonePtr = HEAP32[(__get_tzname() + (dst ? 4 : 0)) >> 2]
  HEAP32[(tmPtr + 40) >> 2] = zonePtr
  return tmPtr
}
function _mktime(tmPtr) {
  _tzset()
  var date = new Date(
    HEAP32[(tmPtr + 20) >> 2] + 1900,
    HEAP32[(tmPtr + 16) >> 2],
    HEAP32[(tmPtr + 12) >> 2],
    HEAP32[(tmPtr + 8) >> 2],
    HEAP32[(tmPtr + 4) >> 2],
    HEAP32[tmPtr >> 2],
    0
  )
  var dst = HEAP32[(tmPtr + 32) >> 2]
  var guessedOffset = date.getTimezoneOffset()
  var start = new Date(date.getFullYear(), 0, 1)
  var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
  var winterOffset = start.getTimezoneOffset()
  var dstOffset = Math.min(winterOffset, summerOffset)
  if (dst < 0) {
    HEAP32[(tmPtr + 32) >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset)
  } else if (dst > 0 != (dstOffset == guessedOffset)) {
    var nonDstOffset = Math.max(winterOffset, summerOffset)
    var trueOffset = dst > 0 ? dstOffset : nonDstOffset
    date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4)
  }
  HEAP32[(tmPtr + 24) >> 2] = date.getDay()
  var yday = ((date.getTime() - start.getTime()) / (1e3 * 60 * 60 * 24)) | 0
  HEAP32[(tmPtr + 28) >> 2] = yday
  HEAP32[tmPtr >> 2] = date.getSeconds()
  HEAP32[(tmPtr + 4) >> 2] = date.getMinutes()
  HEAP32[(tmPtr + 8) >> 2] = date.getHours()
  HEAP32[(tmPtr + 12) >> 2] = date.getDate()
  HEAP32[(tmPtr + 16) >> 2] = date.getMonth()
  return (date.getTime() / 1e3) | 0
}
function _setTempRet0(val) {
  setTempRet0(val)
}
function __isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}
function __arraySum(array, index) {
  var sum = 0
  for (var i = 0; i <= index; sum += array[i++]) {}
  return sum
}
var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
function __addDays(date, days) {
  var newDate = new Date(date.getTime())
  while (days > 0) {
    var leap = __isLeapYear(newDate.getFullYear())
    var currentMonth = newDate.getMonth()
    var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth]
    if (days > daysInCurrentMonth - newDate.getDate()) {
      days -= daysInCurrentMonth - newDate.getDate() + 1
      newDate.setDate(1)
      if (currentMonth < 11) {
        newDate.setMonth(currentMonth + 1)
      } else {
        newDate.setMonth(0)
        newDate.setFullYear(newDate.getFullYear() + 1)
      }
    } else {
      newDate.setDate(newDate.getDate() + days)
      return newDate
    }
  }
  return newDate
}
function _strftime(s, maxsize, format, tm) {
  var tm_zone = HEAP32[(tm + 40) >> 2]
  var date = {
    tm_sec: HEAP32[tm >> 2],
    tm_min: HEAP32[(tm + 4) >> 2],
    tm_hour: HEAP32[(tm + 8) >> 2],
    tm_mday: HEAP32[(tm + 12) >> 2],
    tm_mon: HEAP32[(tm + 16) >> 2],
    tm_year: HEAP32[(tm + 20) >> 2],
    tm_wday: HEAP32[(tm + 24) >> 2],
    tm_yday: HEAP32[(tm + 28) >> 2],
    tm_isdst: HEAP32[(tm + 32) >> 2],
    tm_gmtoff: HEAP32[(tm + 36) >> 2],
    tm_zone: tm_zone ? UTF8ToString(tm_zone) : ''
  }
  var pattern = UTF8ToString(format)
  var EXPANSION_RULES_1 = {
    '%c': '%a %b %d %H:%M:%S %Y',
    '%D': '%m/%d/%y',
    '%F': '%Y-%m-%d',
    '%h': '%b',
    '%r': '%I:%M:%S %p',
    '%R': '%H:%M',
    '%T': '%H:%M:%S',
    '%x': '%m/%d/%y',
    '%X': '%H:%M:%S',
    '%Ec': '%c',
    '%EC': '%C',
    '%Ex': '%m/%d/%y',
    '%EX': '%H:%M:%S',
    '%Ey': '%y',
    '%EY': '%Y',
    '%Od': '%d',
    '%Oe': '%e',
    '%OH': '%H',
    '%OI': '%I',
    '%Om': '%m',
    '%OM': '%M',
    '%OS': '%S',
    '%Ou': '%u',
    '%OU': '%U',
    '%OV': '%V',
    '%Ow': '%w',
    '%OW': '%W',
    '%Oy': '%y'
  }
  for (var rule in EXPANSION_RULES_1) {
    pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule])
  }
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  var MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
  function leadingSomething(value, digits, character) {
    var str = typeof value === 'number' ? value.toString() : value || ''
    while (str.length < digits) {
      str = character[0] + str
    }
    return str
  }
  function leadingNulls(value, digits) {
    return leadingSomething(value, digits, '0')
  }
  function compareByDay(date1, date2) {
    function sgn(value) {
      return value < 0 ? -1 : value > 0 ? 1 : 0
    }
    var compare
    if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
      if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
        compare = sgn(date1.getDate() - date2.getDate())
      }
    }
    return compare
  }
  function getFirstWeekStartDate(janFourth) {
    switch (janFourth.getDay()) {
      case 0:
        return new Date(janFourth.getFullYear() - 1, 11, 29)
      case 1:
        return janFourth
      case 2:
        return new Date(janFourth.getFullYear(), 0, 3)
      case 3:
        return new Date(janFourth.getFullYear(), 0, 2)
      case 4:
        return new Date(janFourth.getFullYear(), 0, 1)
      case 5:
        return new Date(janFourth.getFullYear() - 1, 11, 31)
      case 6:
        return new Date(janFourth.getFullYear() - 1, 11, 30)
    }
  }
  function getWeekBasedYear(date) {
    var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday)
    var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4)
    var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4)
    var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear)
    var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear)
    if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
      if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
        return thisDate.getFullYear() + 1
      } else {
        return thisDate.getFullYear()
      }
    } else {
      return thisDate.getFullYear() - 1
    }
  }
  var EXPANSION_RULES_2 = {
    '%a': function (date) {
      return WEEKDAYS[date.tm_wday].substring(0, 3)
    },
    '%A': function (date) {
      return WEEKDAYS[date.tm_wday]
    },
    '%b': function (date) {
      return MONTHS[date.tm_mon].substring(0, 3)
    },
    '%B': function (date) {
      return MONTHS[date.tm_mon]
    },
    '%C': function (date) {
      var year = date.tm_year + 1900
      return leadingNulls((year / 100) | 0, 2)
    },
    '%d': function (date) {
      return leadingNulls(date.tm_mday, 2)
    },
    '%e': function (date) {
      return leadingSomething(date.tm_mday, 2, ' ')
    },
    '%g': function (date) {
      return getWeekBasedYear(date).toString().substring(2)
    },
    '%G': function (date) {
      return getWeekBasedYear(date)
    },
    '%H': function (date) {
      return leadingNulls(date.tm_hour, 2)
    },
    '%I': function (date) {
      var twelveHour = date.tm_hour
      if (twelveHour == 0) twelveHour = 12
      else if (twelveHour > 12) twelveHour -= 12
      return leadingNulls(twelveHour, 2)
    },
    '%j': function (date) {
      return leadingNulls(
        date.tm_mday +
          __arraySum(
            __isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR,
            date.tm_mon - 1
          ),
        3
      )
    },
    '%m': function (date) {
      return leadingNulls(date.tm_mon + 1, 2)
    },
    '%M': function (date) {
      return leadingNulls(date.tm_min, 2)
    },
    '%n': function () {
      return '\n'
    },
    '%p': function (date) {
      if (date.tm_hour >= 0 && date.tm_hour < 12) {
        return 'AM'
      } else {
        return 'PM'
      }
    },
    '%S': function (date) {
      return leadingNulls(date.tm_sec, 2)
    },
    '%t': function () {
      return '\t'
    },
    '%u': function (date) {
      return date.tm_wday || 7
    },
    '%U': function (date) {
      var janFirst = new Date(date.tm_year + 1900, 0, 1)
      var firstSunday =
        janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay())
      var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday)
      if (compareByDay(firstSunday, endDate) < 0) {
        var februaryFirstUntilEndMonth =
          __arraySum(
            __isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR,
            endDate.getMonth() - 1
          ) - 31
        var firstSundayUntilEndJanuary = 31 - firstSunday.getDate()
        var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate()
        return leadingNulls(Math.ceil(days / 7), 2)
      }
      return compareByDay(firstSunday, janFirst) === 0 ? '01' : '00'
    },
    '%V': function (date) {
      var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4)
      var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4)
      var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear)
      var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear)
      var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday)
      if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
        return '53'
      }
      if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
        return '01'
      }
      var daysDifference
      if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
        daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate()
      } else {
        daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate()
      }
      return leadingNulls(Math.ceil(daysDifference / 7), 2)
    },
    '%w': function (date) {
      return date.tm_wday
    },
    '%W': function (date) {
      var janFirst = new Date(date.tm_year, 0, 1)
      var firstMonday =
        janFirst.getDay() === 1
          ? janFirst
          : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1)
      var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday)
      if (compareByDay(firstMonday, endDate) < 0) {
        var februaryFirstUntilEndMonth =
          __arraySum(
            __isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR,
            endDate.getMonth() - 1
          ) - 31
        var firstMondayUntilEndJanuary = 31 - firstMonday.getDate()
        var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate()
        return leadingNulls(Math.ceil(days / 7), 2)
      }
      return compareByDay(firstMonday, janFirst) === 0 ? '01' : '00'
    },
    '%y': function (date) {
      return (date.tm_year + 1900).toString().substring(2)
    },
    '%Y': function (date) {
      return date.tm_year + 1900
    },
    '%z': function (date) {
      var off = date.tm_gmtoff
      var ahead = off >= 0
      off = Math.abs(off) / 60
      off = (off / 60) * 100 + (off % 60)
      return (ahead ? '+' : '-') + String('0000' + off).slice(-4)
    },
    '%Z': function (date) {
      return date.tm_zone
    },
    '%%': function () {
      return '%'
    }
  }
  for (var rule in EXPANSION_RULES_2) {
    if (pattern.includes(rule)) {
      pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date))
    }
  }
  var bytes = intArrayFromString(pattern, false)
  if (bytes.length > maxsize) {
    return 0
  }
  writeArrayToMemory(bytes, s)
  return bytes.length - 1
}
function _strftime_l(s, maxsize, format, tm) {
  return _strftime(s, maxsize, format, tm)
}
function _system(command) {
  if (!command) return 0
  setErrNo(52)
  return -1
}
function _time(ptr) {
  var ret = (Date.now() / 1e3) | 0
  if (ptr) {
    HEAP32[ptr >> 2] = ret
  }
  return ret
}
var FSNode = function (parent, name, mode, rdev) {
  if (!parent) {
    parent = this
  }
  this.parent = parent
  this.mount = parent.mount
  this.mounted = null
  this.id = FS.nextInode++
  this.name = name
  this.mode = mode
  this.node_ops = {}
  this.stream_ops = {}
  this.rdev = rdev
}
var readMode = 292 | 73
var writeMode = 146
Object.defineProperties(FSNode.prototype, {
  read: {
    get: function () {
      return (this.mode & readMode) === readMode
    },
    set: function (val) {
      val ? (this.mode |= readMode) : (this.mode &= ~readMode)
    }
  },
  write: {
    get: function () {
      return (this.mode & writeMode) === writeMode
    },
    set: function (val) {
      val ? (this.mode |= writeMode) : (this.mode &= ~writeMode)
    }
  },
  isFolder: {
    get: function () {
      return FS.isDir(this.mode)
    }
  },
  isDevice: {
    get: function () {
      return FS.isChrdev(this.mode)
    }
  }
})
FS.FSNode = FSNode
FS.staticInit()
Module['FS_createPath'] = FS.createPath
Module['FS_createDataFile'] = FS.createDataFile
Module['FS_createPreloadedFile'] = FS.createPreloadedFile
Module['FS_createLazyFile'] = FS.createLazyFile
Module['FS_createDevice'] = FS.createDevice
Module['FS_unlink'] = FS.unlink
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1
  var u8array = new Array(len)
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length)
  if (dontAddNull) u8array.length = numBytesWritten
  return u8array
}
var asmLibraryArg = {
  y: ___assert_fail,
  xa: ___call_sighandler,
  Ba: ___clock_gettime,
  c: ___cxa_allocate_exception,
  m: ___cxa_begin_catch,
  ha: ___cxa_call_unexpected,
  ka: ___cxa_current_primary_exception,
  la: ___cxa_decrement_exception_refcount,
  n: ___cxa_end_catch,
  b: ___cxa_find_matching_catch_2,
  i: ___cxa_find_matching_catch_3,
  B: ___cxa_free_exception,
  G: ___cxa_rethrow,
  f: ___cxa_throw,
  ma: ___cxa_uncaught_exceptions,
  Q: ___map_file,
  e: ___resumeException,
  sa: ___syscall__newselect,
  La: ___syscall_access,
  ga: ___syscall_bind,
  Ka: ___syscall_chdir,
  R: ___syscall_chmod,
  fa: ___syscall_connect,
  Ia: ___syscall_fchmod,
  x: ___syscall_fcntl64,
  Ha: ___syscall_fstat64,
  Fa: ___syscall_fstatat64,
  ra: ___syscall_fstatfs64,
  Da: ___syscall_getcwd,
  wa: ___syscall_getdents64,
  ea: ___syscall_getsockname,
  da: ___syscall_getsockopt,
  Ma: ___syscall_ioctl,
  ca: ___syscall_listen,
  Ea: ___syscall_lstat64,
  Ca: ___syscall_mkdir,
  Aa: ___syscall_mmap2,
  za: ___syscall_munmap,
  P: ___syscall_open,
  ya: ___syscall_poll,
  ua: ___syscall_readlink,
  ba: ___syscall_recvfrom,
  ta: ___syscall_rename,
  M: ___syscall_rmdir,
  aa: ___syscall_sendto,
  $: ___syscall_socket,
  Ga: ___syscall_stat64,
  qa: ___syscall_symlink,
  N: ___syscall_unlink,
  na: __emscripten_throw_longjmp,
  o: _abort,
  V: _clock_gettime,
  pa: _emscripten_get_heap_max,
  Ja: _emscripten_memcpy_big,
  oa: _emscripten_resize_heap,
  Na: _environ_get,
  Oa: _environ_sizes_get,
  t: _exit,
  C: _fd_close,
  O: _fd_fdstat_get,
  S: _fd_read,
  _: _fd_seek,
  H: _fd_write,
  a: _getTempRet0,
  T: _gethostbyname,
  I: invoke_diii,
  J: invoke_fiii,
  q: invoke_i,
  d: invoke_ii,
  h: invoke_iii,
  s: invoke_iiii,
  l: invoke_iiiii,
  L: invoke_iiiiid,
  z: invoke_iiiiii,
  v: invoke_iiiiiii,
  K: invoke_iiiiiiii,
  F: invoke_iiiiiiiiiiii,
  X: invoke_iiiiij,
  Z: invoke_j,
  W: invoke_jiiii,
  j: invoke_v,
  p: invoke_vi,
  g: invoke_vii,
  ia: invoke_viid,
  u: invoke_viii,
  D: invoke_viiii,
  Qa: invoke_viiiii,
  w: invoke_viiiiiii,
  A: invoke_viiiiiiiiii,
  E: invoke_viiiiiiiiiiiiiii,
  Y: invoke_viijii,
  U: _localtime_r,
  Pa: _mktime,
  r: _setTempRet0,
  ja: _strftime_l,
  va: _system,
  k: _time
}
var asm = createWasm()
var ___wasm_call_ctors = (Module['___wasm_call_ctors'] = function () {
  return (___wasm_call_ctors = Module['___wasm_call_ctors'] = Module['asm']['Sa']).apply(
    null,
    arguments
  )
})
var _main = (Module['_main'] = function () {
  return (_main = Module['_main'] = Module['asm']['Ta']).apply(null, arguments)
})
var ___errno_location = (Module['___errno_location'] = function () {
  return (___errno_location = Module['___errno_location'] = Module['asm']['Va']).apply(
    null,
    arguments
  )
})
var _malloc = (Module['_malloc'] = function () {
  return (_malloc = Module['_malloc'] = Module['asm']['Wa']).apply(null, arguments)
})
var _free = (Module['_free'] = function () {
  return (_free = Module['_free'] = Module['asm']['Xa']).apply(null, arguments)
})
var _fflush = (Module['_fflush'] = function () {
  return (_fflush = Module['_fflush'] = Module['asm']['Ya']).apply(null, arguments)
})
var _htons = (Module['_htons'] = function () {
  return (_htons = Module['_htons'] = Module['asm']['Za']).apply(null, arguments)
})
var ___funcs_on_exit = (Module['___funcs_on_exit'] = function () {
  return (___funcs_on_exit = Module['___funcs_on_exit'] = Module['asm']['_a']).apply(
    null,
    arguments
  )
})
var __get_tzname = (Module['__get_tzname'] = function () {
  return (__get_tzname = Module['__get_tzname'] = Module['asm']['$a']).apply(null, arguments)
})
var __get_daylight = (Module['__get_daylight'] = function () {
  return (__get_daylight = Module['__get_daylight'] = Module['asm']['ab']).apply(null, arguments)
})
var __get_timezone = (Module['__get_timezone'] = function () {
  return (__get_timezone = Module['__get_timezone'] = Module['asm']['bb']).apply(null, arguments)
})
var _ntohs = (Module['_ntohs'] = function () {
  return (_ntohs = Module['_ntohs'] = Module['asm']['cb']).apply(null, arguments)
})
var _memalign = (Module['_memalign'] = function () {
  return (_memalign = Module['_memalign'] = Module['asm']['db']).apply(null, arguments)
})
var _setThrew = (Module['_setThrew'] = function () {
  return (_setThrew = Module['_setThrew'] = Module['asm']['eb']).apply(null, arguments)
})
var stackSave = (Module['stackSave'] = function () {
  return (stackSave = Module['stackSave'] = Module['asm']['fb']).apply(null, arguments)
})
var stackRestore = (Module['stackRestore'] = function () {
  return (stackRestore = Module['stackRestore'] = Module['asm']['gb']).apply(null, arguments)
})
var stackAlloc = (Module['stackAlloc'] = function () {
  return (stackAlloc = Module['stackAlloc'] = Module['asm']['hb']).apply(null, arguments)
})
var ___cxa_can_catch = (Module['___cxa_can_catch'] = function () {
  return (___cxa_can_catch = Module['___cxa_can_catch'] = Module['asm']['ib']).apply(
    null,
    arguments
  )
})
var ___cxa_is_pointer_type = (Module['___cxa_is_pointer_type'] = function () {
  return (___cxa_is_pointer_type = Module['___cxa_is_pointer_type'] = Module['asm']['jb']).apply(
    null,
    arguments
  )
})
var dynCall_viijii = (Module['dynCall_viijii'] = function () {
  return (dynCall_viijii = Module['dynCall_viijii'] = Module['asm']['kb']).apply(null, arguments)
})
var dynCall_j = (Module['dynCall_j'] = function () {
  return (dynCall_j = Module['dynCall_j'] = Module['asm']['lb']).apply(null, arguments)
})
var dynCall_iiiiij = (Module['dynCall_iiiiij'] = function () {
  return (dynCall_iiiiij = Module['dynCall_iiiiij'] = Module['asm']['mb']).apply(null, arguments)
})
var dynCall_jiiii = (Module['dynCall_jiiii'] = function () {
  return (dynCall_jiiii = Module['dynCall_jiiii'] = Module['asm']['nb']).apply(null, arguments)
})
function invoke_vii(index, a1, a2) {
  var sp = stackSave()
  try {
    getWasmTableEntry(index)(a1, a2)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_vi(index, a1) {
  var sp = stackSave()
  try {
    getWasmTableEntry(index)(a1)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_ii(index, a1) {
  var sp = stackSave()
  try {
    return getWasmTableEntry(index)(a1)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_iii(index, a1, a2) {
  var sp = stackSave()
  try {
    return getWasmTableEntry(index)(a1, a2)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_viii(index, a1, a2, a3) {
  var sp = stackSave()
  try {
    getWasmTableEntry(index)(a1, a2, a3)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_viiiii(index, a1, a2, a3, a4, a5) {
  var sp = stackSave()
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_viiii(index, a1, a2, a3, a4) {
  var sp = stackSave()
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_iiiii(index, a1, a2, a3, a4) {
  var sp = stackSave()
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_iiii(index, a1, a2, a3) {
  var sp = stackSave()
  try {
    return getWasmTableEntry(index)(a1, a2, a3)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_v(index) {
  var sp = stackSave()
  try {
    getWasmTableEntry(index)()
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_iiiiiii(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave()
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_iiiiii(index, a1, a2, a3, a4, a5) {
  var sp = stackSave()
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_iiiiid(index, a1, a2, a3, a4, a5) {
  var sp = stackSave()
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_iiiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave()
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_fiii(index, a1, a2, a3) {
  var sp = stackSave()
  try {
    return getWasmTableEntry(index)(a1, a2, a3)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_diii(index, a1, a2, a3) {
  var sp = stackSave()
  try {
    return getWasmTableEntry(index)(a1, a2, a3)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_i(index) {
  var sp = stackSave()
  try {
    return getWasmTableEntry(index)()
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_viiiiiii(index, a1, a2, a3, a4, a5, a6, a7) {
  var sp = stackSave()
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_iiiiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
  var sp = stackSave()
  try {
    return getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_viiiiiiiiii(index, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
  var sp = stackSave()
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_viiiiiiiiiiiiiii(
  index,
  a1,
  a2,
  a3,
  a4,
  a5,
  a6,
  a7,
  a8,
  a9,
  a10,
  a11,
  a12,
  a13,
  a14,
  a15
) {
  var sp = stackSave()
  try {
    getWasmTableEntry(index)(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_viid(index, a1, a2, a3) {
  var sp = stackSave()
  try {
    getWasmTableEntry(index)(a1, a2, a3)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_j(index) {
  var sp = stackSave()
  try {
    return dynCall_j(index)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_viijii(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave()
  try {
    dynCall_viijii(index, a1, a2, a3, a4, a5, a6)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_iiiiij(index, a1, a2, a3, a4, a5, a6) {
  var sp = stackSave()
  try {
    return dynCall_iiiiij(index, a1, a2, a3, a4, a5, a6)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
function invoke_jiiii(index, a1, a2, a3, a4) {
  var sp = stackSave()
  try {
    return dynCall_jiiii(index, a1, a2, a3, a4)
  } catch (e) {
    stackRestore(sp)
    if (e !== e + 0 && e !== 'longjmp') throw e
    _setThrew(1, 0)
  }
}
Module['addRunDependency'] = addRunDependency
Module['removeRunDependency'] = removeRunDependency
Module['FS_createPath'] = FS.createPath
Module['FS_createDataFile'] = FS.createDataFile
Module['FS_createPreloadedFile'] = FS.createPreloadedFile
Module['FS_createLazyFile'] = FS.createLazyFile
Module['FS_createDevice'] = FS.createDevice
Module['FS_unlink'] = FS.unlink
Module['callMain'] = callMain
Module['FS'] = FS
var calledRun
function ExitStatus(status) {
  this.name = 'ExitStatus'
  this.message = 'Program terminated with exit(' + status + ')'
  this.status = status
}
var calledMain = false
dependenciesFulfilled = function runCaller() {
  if (!calledRun) run()
  if (!calledRun) dependenciesFulfilled = runCaller
}
function callMain(args) {
  var entryFunction = Module['_main']
  args = args || []
  var argc = args.length + 1
  var argv = stackAlloc((argc + 1) * 4)
  HEAP32[argv >> 2] = allocateUTF8OnStack(thisProgram)
  for (var i = 1; i < argc; i++) {
    HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1])
  }
  HEAP32[(argv >> 2) + argc] = 0
  try {
    var ret = entryFunction(argc, argv)
    exit(ret, true)
    return ret
  } catch (e) {
    return handleException(e)
  } finally {
    calledMain = true
  }
}
function run(args) {
  args = args || arguments_
  if (runDependencies > 0) {
    return
  }
  preRun()
  if (runDependencies > 0) {
    return
  }
  function doRun() {
    if (calledRun) return
    calledRun = true
    Module['calledRun'] = true
    if (ABORT) return
    initRuntime()
    preMain()
    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']()
    if (shouldRunNow) callMain(args)
    postRun()
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...')
    setTimeout(function () {
      setTimeout(function () {
        Module['setStatus']('')
      }, 1)
      doRun()
    }, 1)
  } else {
    doRun()
  }
}
Module['run'] = run
function exit(status, implicit) {
  EXITSTATUS = status
  if (keepRuntimeAlive()) {
  } else {
    exitRuntime()
  }
  procExit(status)
}
function procExit(code) {
  EXITSTATUS = code
  if (!keepRuntimeAlive()) {
    if (Module['onExit']) Module['onExit'](code)
    ABORT = true
  }
  quit_(code, new ExitStatus(code))
}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']]
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()()
  }
}
var shouldRunNow = true
if (Module['noInitialRun']) shouldRunNow = false
run()
