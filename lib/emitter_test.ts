import { Emitter } from "../mod.ts";
import {
  assertThrows,
  assertArrayContains,
  assertEquals,
} from "https://deno.land/std/testing/asserts.ts";

type sampleData = [string, string];

Deno.test("invokes the observer when the named event is emitted until disposed", () => {
  const emitter = new Emitter();

  const fooEvents: sampleData[] = [];
  const barEvents: sampleData[] = [];

  const sub1 = emitter.on(
    "foo",
    (value: string) => fooEvents.push(["a", value]),
  );
  const sub2 = emitter.on(
    "bar",
    (value: string) => barEvents.push(["b", value]),
  );

  const sub3 = emitter.preempt(
    "bar",
    (value: string) => barEvents.push(["c", value]),
  );

  emitter.emit("foo", 1);
  emitter.emit("foo", 2);
  emitter.emit("bar", 3);

  sub1.dispose();

  emitter.emit("foo", 4);
  emitter.emit("bar", 5);

  sub2.dispose();

  emitter.emit("bar", 6);

  sub3.dispose();

  assertArrayContains(fooEvents, [["a", 1], ["a", 2]]);
  assertArrayContains(
    barEvents,
    [["c", 3], ["b", 3], ["c", 5], ["b", 5], ["c", 6]],
  );
});
Deno.test("can register a function more than once, and therefore will call it multiple times", () => {
  const emitter = new Emitter();
  let callCount = 0;
  const fn = () => callCount++;

  emitter.on("foo", fn);
  emitter.on("foo", fn);
  emitter.emit("foo", "bar");

  assertEquals(callCount, 2);
});
Deno.test("allows all subscribers to be cleared out at once", () => {
  const emitter = new Emitter();
  const events: sampleData[] = [];

  emitter.on("foo", (value: string) => events.push(["a", value]));
  emitter.preempt("foo", (value: string) => events.push(["b", value]));
  emitter.clear();
  emitter.emit("foo", 1);
  emitter.emit("foo", 2);
  assertEquals(events.length, 0);
});

Deno.test("allows the listeners to be inspected", () => {
  const emitter = new Emitter();

  const disposable1 = emitter.on("foo", function () {});
  assertArrayContains(emitter.getEventNames(), ["foo"]);
  assertEquals(emitter.listenerCountForEventName("foo"), 1);
  assertEquals(emitter.listenerCountForEventName("bar"), 0);
  assertEquals(emitter.getTotalListenerCount(), 1);

  const disposable2 = emitter.on("bar", function () {});
  assertArrayContains(emitter.getEventNames(), ["foo", "bar"]);
  assertEquals(emitter.listenerCountForEventName("foo"), 1);
  assertEquals(emitter.listenerCountForEventName("bar"), 1);
  assertEquals(emitter.getTotalListenerCount(), 2);

  emitter.preempt("foo", function () {});
  assertArrayContains(emitter.getEventNames(), ["foo", "bar"]);
  assertEquals(emitter.listenerCountForEventName("foo"), 2);
  assertEquals(emitter.listenerCountForEventName("bar"), 1);
  assertEquals(emitter.getTotalListenerCount(), 3);

  disposable1.dispose();
  assertArrayContains(emitter.getEventNames(), ["foo", "bar"]);
  assertEquals(emitter.listenerCountForEventName("foo"), 1);
  assertEquals(emitter.listenerCountForEventName("bar"), 1);
  assertEquals(emitter.getTotalListenerCount(), 2);

  disposable2.dispose();
  assertArrayContains(emitter.getEventNames(), ["foo"]);
  assertEquals(emitter.listenerCountForEventName("foo"), 1);
  assertEquals(emitter.listenerCountForEventName("bar"), 0);
  assertEquals(emitter.getTotalListenerCount(), 1);

  emitter.clear();
  assertEquals(emitter.getTotalListenerCount(), 0);
});

Deno.test("throws exceptions as normal, stopping subsequent handlers from firing", () => {
  const emitter = new Emitter();

  emitter.on("foo", function () {
    throw new Error();
  });

  emitter.on("foo", () => {
    console.log("fired");
  });

  assertThrows(() => emitter.emit("foo", 1));
});
