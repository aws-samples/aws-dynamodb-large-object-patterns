const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();
const assert = require("assert");

describe("DynamoDB Item Splitting Read Tests", function () {
  var mockQuery;
  var sut;

  before(function () {
    mockQuery = sinon.stub();

    const AWS = {
      DynamoDB: {
        DocumentClient: sinon.stub().returns({
          query: mockQuery,
        }),
      },
    };

    sut = proxyquire("../read/index", {
      "aws-sdk": AWS,
    });
  });

  it("Should join even number (2) of equal parts", async function () {
    let expected = {
      Items: [{ large_object: "abc123" }, { large_object: "def456" }],
    };
    mockQuery.withArgs(sinon.match.any).returns({
      promise: () => Promise.resolve(expected),
    });

    const actual = await sut.lambda_handler({ id: "abc123" });
    assert.equal(actual, "abc123def456");
  });

  it("Should return single part if collection size is 1", async function () {
    let expected = {
      Items: [{ large_object: "abc123" }],
    };
    mockQuery.withArgs(sinon.match.any).returns({
      promise: () => Promise.resolve(expected),
    });

    const actual = await sut.lambda_handler({ id: "abc123" });
    assert.equal(actual, "abc123");
  });

  it("Should join odd number (3) of equal parts", async function () {
    let expected = {
      Items: [
        { large_object: "abc123" },
        { large_object: "def456" },
        { large_object: "ghi789" },
      ],
    };
    mockQuery.withArgs(sinon.match.any).returns({
      promise: () => Promise.resolve(expected),
    });

    const actual = await sut.lambda_handler({ id: "abc123" });
    assert.equal(actual, "abc123def456ghi789");
  });

  it("Should return empty string if item collection of zero", async function () {
    let expected = {
      Items: [],
    };
    mockQuery.withArgs(sinon.match.any).returns({
      promise: () => Promise.resolve(expected),
    });

    const actual = await sut.lambda_handler({ id: "abc123" });
    assert.equal(actual, "");
  });
});
