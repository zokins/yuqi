import type { IRequest } from "itty-router";

export class TsRestRequest extends Request implements IRequest {
  public route: string;
  public params: Record<string, string>;
  public query: Record<string, string | string[] | undefined>;
  public content?: any;

  constructor(urlOrRequest: string | Request, init?: RequestInit) {
    super(urlOrRequest, init);

    this.route = "";
    this.params = {};
    this.query = {};
  }
}
