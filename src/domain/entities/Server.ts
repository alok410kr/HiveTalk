import { AggregateRoot, DomainEvent } from "../core/Entity";
import { Result } from "../../shared/Result";
import { InviteCode } from "../value-objects/InviteCode";

export interface ServerProps {
  name: string;
  imageUrl: string;
  inviteCode: InviteCode;
  profileId: string;
}

// Domain Events
export class ServerCreatedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = "ServerCreated";
  readonly serverId: string;
  readonly serverName: string;

  constructor(serverId: string, serverName: string) {
    this.occurredOn = new Date();
    this.serverId = serverId;
    this.serverName = serverName;
  }
}

export class InviteCodeRegeneratedEvent implements DomainEvent {
  readonly occurredOn: Date;
  readonly eventType = "InviteCodeRegenerated";
  readonly serverId: string;
  readonly newInviteCode: string;

  constructor(serverId: string, newInviteCode: string) {
    this.occurredOn = new Date();
    this.serverId = serverId;
    this.newInviteCode = newInviteCode;
  }
}

export class Server extends AggregateRoot<string> {
  private _name: string;
  private _imageUrl: string;
  private _inviteCode: InviteCode;
  private _profileId: string;

  private constructor(
    id: string,
    props: ServerProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._name = props.name;
    this._imageUrl = props.imageUrl;
    this._inviteCode = props.inviteCode;
    this._profileId = props.profileId;
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get inviteCode(): InviteCode {
    return this._inviteCode;
  }

  get profileId(): string {
    return this._profileId;
  }

  // Factory method for creating new servers
  static create(props: Omit<ServerProps, "inviteCode"> & { inviteCode?: InviteCode }, id?: string): Result<Server> {
    if (!props.name || props.name.trim() === "") {
      return Result.fail("Server name is required");
    }

    if (props.name.length > 100) {
      return Result.fail("Server name must be less than 100 characters");
    }

    if (!props.imageUrl || props.imageUrl.trim() === "") {
      return Result.fail("Server image URL is required");
    }

    if (!props.profileId) {
      return Result.fail("Profile ID is required");
    }

    // Generate invite code if not provided
    const inviteCodeResult = props.inviteCode 
      ? Result.ok(props.inviteCode)
      : InviteCode.create();

    if (!Result.isOk(inviteCodeResult)) {
      return Result.fail(inviteCodeResult.error);
    }

    const serverId = id ?? crypto.randomUUID();
    const server = new Server(serverId, {
      name: props.name.trim(),
      imageUrl: props.imageUrl,
      inviteCode: inviteCodeResult.value,
      profileId: props.profileId,
    });

    server.addDomainEvent(new ServerCreatedEvent(serverId, props.name));

    return Result.ok(server);
  }

  // Reconstitute from persistence (bypass validation)
  static reconstitute(
    id: string,
    props: ServerProps,
    createdAt: Date,
    updatedAt: Date
  ): Server {
    return new Server(id, props, createdAt, updatedAt);
  }

  // Business methods
  updateName(name: string): Result<void> {
    if (!name || name.trim() === "") {
      return Result.fail("Server name cannot be empty");
    }

    if (name.length > 100) {
      return Result.fail("Server name must be less than 100 characters");
    }

    this._name = name.trim();
    this.touch();
    return Result.ok(undefined);
  }

  updateImageUrl(imageUrl: string): Result<void> {
    if (!imageUrl || imageUrl.trim() === "") {
      return Result.fail("Image URL cannot be empty");
    }

    this._imageUrl = imageUrl;
    this.touch();
    return Result.ok(undefined);
  }

  regenerateInviteCode(): Result<InviteCode> {
    const newInviteCodeResult = InviteCode.create();
    
    if (!Result.isOk(newInviteCodeResult)) {
      return newInviteCodeResult;
    }

    this._inviteCode = newInviteCodeResult.value;
    this.touch();
    
    this.addDomainEvent(new InviteCodeRegeneratedEvent(this.id, this._inviteCode.value));

    return Result.ok(this._inviteCode);
  }

  isOwnedBy(profileId: string): boolean {
    return this._profileId === profileId;
  }
}
