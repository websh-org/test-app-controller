export function copy(oldObj, ctx) {
  if (!oldObj) return oldObj;
  if (typeof oldObj === "object") {
    const newObj = Array.isArray(oldObj) ? [] : {};
    for (var i in oldObj) {
      newObj[i] = copy(oldObj[i], ctx);
    }
    return newObj;
  } else if (typeof oldObj === "function") {
    return ctx ? oldObj.bind(ctx) : oldObj;
  } else {
    return oldObj;
  }
}

export function uuid() {
  return Math.random()
    .toString(36)
    .substr(2);
}

export function assert(condition,message,data) {
  if (!condition) throw new Error(message)
}