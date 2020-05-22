import { CompositeDisposable, Disposable } from "../mod.ts";
import {
  assertEquals,
} from "https://deno.land/std/testing/asserts.ts";

let disposable1: Disposable;
let disposable2: Disposable;
let disposable3: Disposable;

const beforeEach = () => {
  disposable1 = new Disposable();
  disposable2 = new Disposable();
  disposable3 = new Disposable();
};

Deno.test("can be constructed with multiple disposables", () => {
  beforeEach();

  const composite = new CompositeDisposable();
  composite.add(disposable1, disposable2, disposable3);
  composite.dispose();

  assertEquals(composite.disposed, true);
  assertEquals(disposable1.disposed, true);
  assertEquals(disposable2.disposed, true);
});

Deno.test("allows disposables to be added and removed", () => {
  beforeEach();

  const composite = new CompositeDisposable();
  composite.add(disposable1);
  composite.add(disposable2, disposable3);
  composite.delete(disposable1);
  composite.remove(disposable3);

  composite.dispose();

  assertEquals(composite.disposed, true);
  assertEquals(disposable1.disposed, false);
  assertEquals(disposable2.disposed, true);
  assertEquals(disposable3.disposed, false);
});
