import { Server } from "../entities/Server";
import { Member } from "../entities/Member";
import { Channel } from "../entities/Channel";
import { Result } from "../../shared/Result";

export interface ServerWithRelations {
  server: Server;
  members?: Member[];
  channels?: Channel[];
}

export interface IServerRepository {
  findById(id: string): Promise<Server | null>;
  findByIdWithRelations(id: string): Promise<ServerWithRelations | null>;
  findByInviteCode(inviteCode: string): Promise<ServerWithRelations | null>;
  findByProfileId(profileId: string): Promise<Server[]>;
  findFirstByProfileId(profileId: string): Promise<Server | null>;
  create(server: Server): Promise<Result<Server>>;
  update(server: Server): Promise<Result<Server>>;
  delete(id: string): Promise<Result<void>>;
}
