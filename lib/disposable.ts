export class Disposable {
  disposed: boolean;
  disposalAction?: Function | null;

  constructor(disposalAction?: Function) {
    this.disposed = false;
    if (disposalAction) {
      this.disposalAction = disposalAction;
    }
  }

  static isDisposable(object: any) {
    return typeof (object != null ? object.dispose : undefined) === "function";
  }

  dispose() {
    if (!this.disposed) {
      this.disposed = true;
      if (typeof this.disposalAction === "function") {
        this.disposalAction();
      }
      this.disposalAction = null;
    }
  }
}
