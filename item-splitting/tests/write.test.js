const sinon = require("sinon");
const proxyquire = require("proxyquire").noCallThru();
const chai = require("chai");
const sinonChai = require("sinon-chai");
const expect = chai.expect;
chai.use(sinonChai);

describe("DynamoDB Item Splitting Write Tests", function () {
  var mockPut;
  var sut;

  afterEach(async () => {
    sinon.reset();
  });

  beforeEach(function () {
    mockPut = sinon.stub();

    const AWS = {
      DynamoDB: {
        DocumentClient: sinon.stub().returns({
          put: mockPut,
        }),
      },
    };

    sut = proxyquire("../write/index", {
      "aws-sdk": AWS,
    });
  });

  it("Should call put item once for empty large object", async function () {
    mockPut.withArgs(sinon.match.any).returns({
      promise: () => Promise.resolve(),
    });

    await sut.lambda_handler({
      id: "abc123",
      payload: "",
      ddbObjectSize: 6,
    });
    expect(mockPut.calledOnce).to.be.true;
  });

  it("Should call put item once for object less than max size", async function () {
    mockPut.withArgs(sinon.match.any).returns({
      promise: () => Promise.resolve(),
    });

    await sut.lambda_handler({
      id: "abc123",
      payload: "abc",
      ddbObjectSize: 6,
    });
    expect(mockPut.calledOnce).to.be.true;
  });

  it("Should honour constant max size when not overridden", async function () {
    mockPut.withArgs(sinon.match.any).returns({
      promise: () => Promise.resolve(),
    });

    await sut.lambda_handler({
      id: "abc123",
      payload: "abc123abc123",
    });
    expect(mockPut.calledOnce).to.be.true;
  });

  it("Should call put item twice for object above max size", async function () {
    mockPut.withArgs(sinon.match.any).returns({
      promise: () => Promise.resolve(),
    });

    await sut.lambda_handler({
      id: "abc123",
      payload: "abc123abc",
      ddbObjectSize: 6,
    });
    expect(mockPut).callCount(2);
  });

  it("Should call put item thrice for object above max size", async function () {
    mockPut.withArgs(sinon.match.any).returns({
      promise: () => Promise.resolve(),
    });

    await sut.lambda_handler({
      id: "abc123",
      payload: "abc123abc123",
      ddbObjectSize: 6,
    });
    expect(mockPut).callCount(3);
  });
});
