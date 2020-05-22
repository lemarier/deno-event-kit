import { Disposable } from "../mod.ts";
import {
  assertEquals,
} from "https://deno.land/std/testing/asserts.ts";

Deno.test("dereferences the disposalAction once dispose() is invoked", () => {
  const disposalAction = function () {};
  const disposable = new Disposable(disposalAction);
  assertEquals(disposable.disposalAction, disposalAction);

  disposable.dispose();
  assertEquals(disposable.disposalAction, null);
});

Deno.test(".isDisposable(object)", () => {
  assertEquals(Disposable.isDisposable(new Disposable(function () {})), true);
  assertEquals(Disposable.isDisposable({ dispose() {} }), true);

  assertEquals(Disposable.isDisposable(null), false);
  assertEquals(Disposable.isDisposable(undefined), false);
  assertEquals(Disposable.isDisposable({ foo() {} }), false);
  assertEquals(Disposable.isDisposable({ dispose: 1 }), false);
});
