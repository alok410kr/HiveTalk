import { Channel } from "../entities/Channel";
import { Result } from "../../shared/Result";

export interface IChannelRepository {
  findById(id: string): Promise<Channel | null>;
  findByServerId(serverId: string): Promise<Channel[]>;
  findByServerIdAndType(serverId: string, type: string): Promise<Channel[]>;
  findGeneralByServerId(serverId: string): Promise<Channel | null>;
  create(channel: Channel): Promise<Result<Channel>>;
  update(channel: Channel): Promise<Result<Channel>>;
  delete(id: string): Promise<Result<void>>;
  deleteByServerId(serverId: string): Promise<Result<void>>;
}
