import { Entity } from "../core/Entity";
import { Result } from "../../shared/Result";

export interface DirectMessageProps {
  content: string;
  fileUrl: string | null;
  memberId: string;
  conversationId: string;
  deleted: boolean;
}

export class DirectMessage extends Entity<string> {
  private _content: string;
  private _fileUrl: string | null;
  private _memberId: string;
  private _conversationId: string;
  private _deleted: boolean;

  private constructor(
    id: string,
    props: DirectMessageProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._content = props.content;
    this._fileUrl = props.fileUrl;
    this._memberId = props.memberId;
    this._conversationId = props.conversationId;
    this._deleted = props.deleted;
  }

  // Getters
  get content(): string {
    return this._content;
  }

  get fileUrl(): string | null {
    return this._fileUrl;
  }

  get memberId(): string {
    return this._memberId;
  }

  get conversationId(): string {
    return this._conversationId;
  }

  get deleted(): boolean {
    return this._deleted;
  }

  // Factory method
  static create(
    props: { content: string; fileUrl?: string | null; memberId: string; conversationId: string },
    id?: string
  ): Result<DirectMessage> {
    if (!props.content || props.content.trim() === "") {
      if (!props.fileUrl) {
        return Result.fail("Message content is required when no file is attached");
      }
    }

    if (!props.memberId) {
      return Result.fail("Member ID is required");
    }

    if (!props.conversationId) {
      return Result.fail("Conversation ID is required");
    }

    const messageId = id ?? crypto.randomUUID();

    return Result.ok(new DirectMessage(messageId, {
      content: props.content.trim(),
      fileUrl: props.fileUrl ?? null,
      memberId: props.memberId,
      conversationId: props.conversationId,
      deleted: false,
    }));
  }

  // Reconstitute from persistence
  static reconstitute(
    id: string,
    props: DirectMessageProps,
    createdAt: Date,
    updatedAt: Date
  ): DirectMessage {
    return new DirectMessage(id, props, createdAt, updatedAt);
  }

  // Business methods
  editContent(newContent: string, memberId: string): Result<void> {
    if (this._deleted) {
      return Result.fail("Cannot edit a deleted message");
    }

    if (this._memberId !== memberId) {
      return Result.fail("Only the message author can edit this message");
    }

    if (!newContent || newContent.trim() === "") {
      return Result.fail("Message content cannot be empty");
    }

    this._content = newContent.trim();
    this.touch();
    return Result.ok(undefined);
  }

  softDelete(memberId: string): Result<void> {
    if (this._deleted) {
      return Result.fail("Message is already deleted");
    }

    // Only the author can delete direct messages
    if (this._memberId !== memberId) {
      return Result.fail("Only the message author can delete this message");
    }

    this._deleted = true;
    this._content = "This message has been deleted.";
    this._fileUrl = null;
    this.touch();
    return Result.ok(undefined);
  }

  isEdited(): boolean {
    return this._createdAt.getTime() !== this._updatedAt.getTime();
  }

  isOwnedBy(memberId: string): boolean {
    return this._memberId === memberId;
  }

  hasFile(): boolean {
    return this._fileUrl !== null;
  }

  belongsToConversation(conversationId: string): boolean {
    return this._conversationId === conversationId;
  }
}
