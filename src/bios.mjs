import { uuid, copy } from "./utils";

const PUBLIC = Symbol();
const COMMANDS = Symbol();
const PROPS = Symbol();
const EVENTS = Symbol();
const IS = Symbol;

const TYPEDEFS = {};

export function register(type, def) {
  TYPEDEFS[type] = copy(def);
}

function trigger(event, ...args) {
  this[EVENTS][event]
    && this[EVENTS][event].before.every(x => x.call(this, ...args) !== false)
    && this[EVENTS][event].on.forEach(x => x.call(this, ...args))
    && this[EVENTS][event].after.forEach(x => x.call(this, ...args))
}

function addEventHandler(obj, event, when, handler) {
  if (!obj[EVENTS][event]) {
    obj[EVENTS][event] = { before: [], on: [], after: [] };
    obj[event] = trigger.bind(obj, event);
  }
  obj[EVENTS][event][when] = obj[EVENTS][event][when].concat(handler);
}


export function create(typeList, ...initArgs) {
  const obj = {
    [IS]: {},
    id: uuid(),
    call(command, ...args) {
      return call(obj, command, ...args);
    },
    [COMMANDS]: {},
    [EVENTS]: {},
    [PROPS]: {},
    [PUBLIC]: {}
  };
  obj[PUBLIC].call = obj.call;
  extend(obj, typeList, ...initArgs);
  return obj[PUBLIC];
}

function extend(obj, typeList, ...initArgs) {
  const types = typeList.split(" ").filter(Boolean);
  for (const type of types) {
    if (obj[IS][type]) continue;
    obj[IS][type] = true;
    const typedef = TYPEDEFS[type];
    if (typedef.extends) extend(obj, typedef.extends, ...initArgs);

    if (typedef.commands) Object.assign(obj[COMMANDS], copy(typedef.commands, obj));
    if (typedef.before) {
      for (const event in typedef.before) {
        addEventHandler(obj, event, 'before', typedef.before[event]);
      }
    }

    if (typedef.on) {
      for (const event in typedef.on) {
        addEventHandler(obj, event, 'on', typedef.on[event]);
      }
    }

    if (typedef.after) {
      for (const event in typedef.after) {
        addEventHandler(obj, event, 'after', typedef.after[event]);
      }
    }
    if (typedef.self) Object.assign(obj, copy(typedef.self));
    if (typedef.methods) {
      const bound = copy(typedef.methods, obj);
      Object.assign(obj, bound);
      Object.assign(obj[PUBLIC], bound);
    }
    for (const prop in typedef.props) {
      obj[PROPS][prop] = copy(typedef[PROPS][prop]);
      Object.defineProperty(obj, prop, {
        set(value) {
          obj[PROPS][prop] = value;
        },
        get() {
          return obj[PROPS][prop];
        }
      })
      Object.defineProperty(obj, prop, {
        set(value) {
          obj[PROPS][prop] = value;
        },
        get() {
          return obj[PROPS][prop];
        }
      })
    }
    for (const prop in typedef.readonly) {
      obj[PROPS][prop] = copy(typedef.readonly[prop])
      Object.defineProperty(obj[PUBLIC], prop, {
        get() {
          return obj[PROPS][prop];
        }
      })
      Object.defineProperty(obj, prop, {
        set(value) {
          obj[PROPS][prop] = value;
        },
        get() {
          return obj[PROPS][prop];
        }
      })
    }
    for (const prop in typedef.computed) {
      Object.defineProperty(obj[PUBLIC], prop, {
        get() {
          return typedef.computed[prop]
        }
      })
    }
    if (typedef.call) obj[PUBLIC].call = typedef.call.bind(obj);
    if (typedef.init) typedef.init.call(obj, ...initArgs);
  }
}

function call(obj, command, ...args) {
  console.log(obj[PUBLIC], command, Object.keys(obj[COMMANDS]))
  return obj[COMMANDS][command].execute.call(obj, ...args);
}
