import { Disposable } from "./disposable.ts";
import { CompositeDisposable } from "./composite-disposable.ts";

export class Emitter {
  disposed: boolean = false;
  subscriptions: CompositeDisposable = new CompositeDisposable();
  handlersByEventName: Record<string, any> = {};
  constructor() {
    this.clear();
  }

  dispatch(handler: Function, value: any) {
    return handler(value);
  }

  clear() {
    if (this.subscriptions !== null) {
      this.subscriptions.dispose();
    }
    this.subscriptions = new CompositeDisposable();
    this.handlersByEventName = {};
  }

  dispose() {
    if (this.subscriptions) {
      this.subscriptions.dispose();
    }
    this.handlersByEventName = {};
    this.disposed = true;
  }

  on(eventName: string, handler: Function, unshift?: boolean) {
    if (unshift === null) {
      unshift = false;
    }

    if (this.disposed) {
      throw new Error("Emitter has been disposed");
    }

    if (typeof handler !== "function") {
      throw new Error("Handler must be a function");
    }

    const currentHandlers = this.handlersByEventName[eventName];
    if (currentHandlers) {
      if (unshift) {
        this.handlersByEventName[eventName].unshift(handler);
      } else {
        this.handlersByEventName[eventName].push(handler);
      }
    } else {
      this.handlersByEventName[eventName] = [handler];
    }
    const cleanup = new Disposable(() => {
      this.subscriptions.remove(cleanup);
      return this.off(eventName, handler);
    });
    this.subscriptions.add(cleanup);
    return cleanup;
  }

  once(eventName: string, handler: Function, unshift?: boolean) {
    if (unshift == null) {
      unshift = false;
    }

    const wrapped = function (value: any) {
      disposable.dispose();
      return handler(value);
    };

    const disposable = this.on(eventName, wrapped, unshift);
    return disposable;
  }

  preempt(eventName: string, handler: Function) {
    return this.on(eventName, handler, true);
  }

  off(eventName: string, handlerToRemove: Function) {
    if (this.disposed) {
      return;
    }

    const handlers = this.handlersByEventName[eventName];
    if (handlers) {
      const handlerIndex = handlers.indexOf(handlerToRemove);
      if (handlerIndex >= 0) {
        handlers.splice(handlerIndex, 1);
      }
      if (handlers.length === 0) {
        delete this.handlersByEventName[eventName];
      }
    }
  }

  emit(eventName: string, value: any) {
    const handlers = this.handlersByEventName &&
      this.handlersByEventName[eventName];
    if (handlers) {
      // create a copy of `handlers` so that if any handler mutates `handlers`
      // (e.g. by calling `on` on this same emitter), this does not result in
      // changing the handlers being called during this same `emit`.
      const handlersCopy = handlers.slice();
      for (let i = 0; i < handlersCopy.length; i++) {
        this.dispatch(handlersCopy[i], value);
      }
    }
  }

  async emitAsync(eventName: string, value: any) {
    const handlers = this.handlersByEventName &&
      this.handlersByEventName[eventName];
    if (handlers) {
      handlers.map((handler: any) => this.dispatch(handler, value));
    }
  }

  getEventNames() {
    return Object.keys(this.handlersByEventName);
  }

  listenerCountForEventName(eventName: string) {
    const handlers = this.handlersByEventName[eventName];
    return handlers == null ? 0 : handlers.length;
  }

  getTotalListenerCount() {
    let result = 0;
    for (let eventName of Object.keys(this.handlersByEventName)) {
      result += this.handlersByEventName[eventName].length;
    }
    return result;
  }
}
