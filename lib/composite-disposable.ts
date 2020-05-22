import { Disposable } from "./disposable.ts";

export class CompositeDisposable {
  disposed: boolean;
  disposables: Set<Disposable>;

  constructor() {
    this.disposed = false;
    this.disposables = new Set();
  }

  dispose() {
    if (!this.disposed) {
      this.disposed = true;
      if (this.disposables) {
        for (const disposable of this.disposables) {
          disposable.dispose();
        }
      }
      delete this.disposables;
    }
  }

  add(...allArgs: Disposable[]) {
    if (!this.disposed) {
      for (const disposable of allArgs) {
        assertDisposable(disposable);
        this.disposables.add(disposable);
      }
    }
  }

  remove(disposable: Disposable) {
    if (!this.disposed) {
      this.disposables.delete(disposable);
    }
  }

  delete(disposable: Disposable) {
    this.remove(disposable);
  }

  clear() {
    if (!this.disposed) {
      this.disposables.clear();
    }
  }
}

function assertDisposable(disposable: Disposable) {
  if (!Disposable.isDisposable(disposable)) {
    throw new TypeError(
      "Arguments to CompositeDisposable.add must have a .dispose() method",
    );
  }
}
