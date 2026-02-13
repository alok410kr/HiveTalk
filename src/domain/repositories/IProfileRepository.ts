import { Profile } from "../entities/Profile";
import { Result } from "../../shared/Result";

export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>;
  findByUserId(userId: string): Promise<Profile | null>;
  findByEmail(email: string): Promise<Profile | null>;
  create(profile: Profile): Promise<Result<Profile>>;
  update(profile: Profile): Promise<Result<Profile>>;
  delete(id: string): Promise<Result<void>>;
}
