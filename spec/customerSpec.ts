import { Customer, CustomerStatus } from "customer"

describe("customer", () => {
  it("スポーン時はニュートラル状態", () => {
    const c = new Customer({});
    expect(c.status).toEqual(CustomerStatus.NUTRAL);
  });
  it("囲われると常連になる", () => {
    const c = new Customer({});
    c.attract();
    expect(c.status).toEqual(CustomerStatus.ACTIVE);
  });
  it("初めての放送で初見コメ")
  it("薄口放送でｗコメ")
  it("濃口放送でｗｗｗコメ")
  it("生主の目に止まり、コラボ放送")
  it("広告から閲覧")
})