import { ValueObject } from "../core/ValueObject";
import { Result } from "../../shared/Result";
import { v4 as uuid } from "uuid";

interface InviteCodeProps {
  value: string;
}

export class InviteCode extends ValueObject<InviteCodeProps> {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 16;

  private constructor(props: InviteCodeProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(code?: string): Result<InviteCode> {
    const codeValue = code ?? InviteCode.generate();

    if (codeValue.length < InviteCode.MIN_LENGTH) {
      return Result.fail(`Invite code must be at least ${InviteCode.MIN_LENGTH} characters`);
    }

    if (codeValue.length > InviteCode.MAX_LENGTH) {
      return Result.fail(`Invite code must be at most ${InviteCode.MAX_LENGTH} characters`);
    }

    return Result.ok(new InviteCode({ value: codeValue }));
  }

  static generate(): string {
    return uuid().replace(/-/g, "").substring(0, 12);
  }

  static reconstitute(code: string): InviteCode {
    return new InviteCode({ value: code });
  }

  toString(): string {
    return this.props.value;
  }
}
