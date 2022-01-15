const cbor = require("cbor");
const assert = require("assert");

let encoded = cbor.encode(true); // Returns <Buffer f5>
cbor.decodeFirst(encoded, (error, obj) => {
  // If there was an error, error != null
  // obj is the unpacked object
  assert.ok(obj === true);
});

// Use integers as keys?
const m = new Map();
m.set(1, 2);
encoded = cbor.encode(m); // <Buffer a1 01 02>
