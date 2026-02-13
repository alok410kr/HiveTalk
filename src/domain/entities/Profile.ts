import { Entity } from "../core/Entity";
import { Result } from "../../shared/Result";

export interface ProfileProps {
  userId: string;
  name: string;
  imageUrl: string;
  email: string;
}

export class Profile extends Entity<string> {
  private _userId: string;
  private _name: string;
  private _imageUrl: string;
  private _email: string;

  private constructor(
    id: string,
    props: ProfileProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._userId = props.userId;
    this._name = props.name;
    this._imageUrl = props.imageUrl;
    this._email = props.email;
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get name(): string {
    return this._name;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get email(): string {
    return this._email;
  }

  // Factory method for creating new profiles
  static create(props: ProfileProps, id?: string): Result<Profile> {
    if (!props.userId || props.userId.trim() === "") {
      return Result.fail("User ID is required");
    }

    if (!props.name || props.name.trim() === "") {
      return Result.fail("Name is required");
    }

    if (!props.email || props.email.trim() === "") {
      return Result.fail("Email is required");
    }

    const profileId = id ?? crypto.randomUUID();
    return Result.ok(new Profile(profileId, props));
  }

  // Reconstitute from persistence (bypass validation)
  static reconstitute(
    id: string,
    props: ProfileProps,
    createdAt: Date,
    updatedAt: Date
  ): Profile {
    return new Profile(id, props, createdAt, updatedAt);
  }

  // Business methods
  updateName(name: string): Result<void> {
    if (!name || name.trim() === "") {
      return Result.fail("Name cannot be empty");
    }
    this._name = name;
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
}
