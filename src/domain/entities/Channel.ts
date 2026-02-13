import { Entity } from "../core/Entity";
import { Result } from "../../shared/Result";
import { ChannelType } from "../value-objects/ChannelType";

export interface ChannelProps {
  name: string;
  type: ChannelType;
  profileId: string;
  serverId: string;
}

export class Channel extends Entity<string> {
  private _name: string;
  private _type: ChannelType;
  private _profileId: string;
  private _serverId: string;

  private constructor(
    id: string,
    props: ChannelProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._name = props.name;
    this._type = props.type;
    this._profileId = props.profileId;
    this._serverId = props.serverId;
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get type(): ChannelType {
    return this._type;
  }

  get profileId(): string {
    return this._profileId;
  }

  get serverId(): string {
    return this._serverId;
  }

  // Factory method
  static create(
    props: { name: string; type?: ChannelType; profileId: string; serverId: string },
    id?: string
  ): Result<Channel> {
    if (!props.name || props.name.trim() === "") {
      return Result.fail("Channel name is required");
    }

    const normalizedName = Channel.normalizeName(props.name);

    if (normalizedName.length > 100) {
      return Result.fail("Channel name must be less than 100 characters");
    }

    if (normalizedName.toLowerCase() === "general") {
      return Result.fail("Channel name cannot be 'general'");
    }

    if (!props.profileId) {
      return Result.fail("Profile ID is required");
    }

    if (!props.serverId) {
      return Result.fail("Server ID is required");
    }

    const type = props.type ?? ChannelType.text();
    const channelId = id ?? crypto.randomUUID();

    return Result.ok(new Channel(channelId, {
      name: normalizedName,
      type,
      profileId: props.profileId,
      serverId: props.serverId,
    }));
  }

  // Create default general channel for new servers
  static createGeneral(profileId: string, serverId: string, id?: string): Result<Channel> {
    const channelId = id ?? crypto.randomUUID();
    return Result.ok(new Channel(channelId, {
      name: "general",
      type: ChannelType.text(),
      profileId,
      serverId,
    }));
  }

  // Reconstitute from persistence
  static reconstitute(
    id: string,
    props: ChannelProps,
    createdAt: Date,
    updatedAt: Date
  ): Channel {
    return new Channel(id, props, createdAt, updatedAt);
  }

  // Business methods
  updateName(name: string): Result<void> {
    if (!name || name.trim() === "") {
      return Result.fail("Channel name cannot be empty");
    }

    const normalizedName = Channel.normalizeName(name);

    if (normalizedName.length > 100) {
      return Result.fail("Channel name must be less than 100 characters");
    }

    // Cannot rename to "general"
    if (normalizedName.toLowerCase() === "general" && this._name.toLowerCase() !== "general") {
      return Result.fail("Channel name cannot be 'general'");
    }

    this._name = normalizedName;
    this.touch();
    return Result.ok(undefined);
  }

  changeType(type: ChannelType): Result<void> {
    this._type = type;
    this.touch();
    return Result.ok(undefined);
  }

  isGeneral(): boolean {
    return this._name.toLowerCase() === "general";
  }

  isTextChannel(): boolean {
    return this._type.isText();
  }

  isAudioChannel(): boolean {
    return this._type.isAudio();
  }

  isVideoChannel(): boolean {
    return this._type.isVideo();
  }

  supportsMessages(): boolean {
    return this._type.supportsMessages();
  }

  supportsLivekit(): boolean {
    return this._type.supportsLivekit();
  }

  belongsToServer(serverId: string): boolean {
    return this._serverId === serverId;
  }

  // Helper to normalize channel names (lowercase, replace spaces with dashes)
  private static normalizeName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, "-");
  }
}
