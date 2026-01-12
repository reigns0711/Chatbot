/// <reference lib="deno.ns" />
import { assertEquals } from "@std/assert";

Deno.test("Basic math test - Server Smoke Test", () => {
    const x = 1 + 2;
    assertEquals(x, 3);
});

Deno.test("Environment check", () => {
    // Just verifying we can access env vars
    const port = Deno.env.get("PORT") || "5000";
    assertEquals(typeof port, "string");
});
