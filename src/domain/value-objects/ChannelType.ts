import { ValueObject } from "../core/ValueObject";

export enum ChannelTypeEnum {
  TEXT = "TEXT",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
}

interface ChannelTypeProps {
  value: ChannelTypeEnum;
}

export class ChannelType extends ValueObject<ChannelTypeProps> {
  private constructor(props: ChannelTypeProps) {
    super(props);
  }

  get value(): ChannelTypeEnum {
    return this.props.value;
  }

  static text(): ChannelType {
    return new ChannelType({ value: ChannelTypeEnum.TEXT });
  }

  static audio(): ChannelType {
    return new ChannelType({ value: ChannelTypeEnum.AUDIO });
  }

  static video(): ChannelType {
    return new ChannelType({ value: ChannelTypeEnum.VIDEO });
  }

  static fromString(type: string): ChannelType {
    switch (type.toUpperCase()) {
      case "TEXT":
        return ChannelType.text();
      case "AUDIO":
        return ChannelType.audio();
      case "VIDEO":
        return ChannelType.video();
      default:
        return ChannelType.text();
    }
  }

  isText(): boolean {
    return this.props.value === ChannelTypeEnum.TEXT;
  }

  isAudio(): boolean {
    return this.props.value === ChannelTypeEnum.AUDIO;
  }

  isVideo(): boolean {
    return this.props.value === ChannelTypeEnum.VIDEO;
  }

  supportsMessages(): boolean {
    return this.isText();
  }

  supportsLivekit(): boolean {
    return this.isAudio() || this.isVideo();
  }

  toString(): string {
    return this.props.value;
  }
}
