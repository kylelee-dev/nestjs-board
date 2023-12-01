import { DataSource, Repository } from 'typeorm';
import { Board } from './board.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardStatus } from './board-status.enum';
import { User } from 'src/auth/user.entity';

@Injectable()
export class BoardRepository extends Repository<Board> {
  constructor(private dataSource: DataSource) {
    super(Board, dataSource.createEntityManager());
  }

  async getAllBoards(): Promise<Board[]> {
    return await this.find();
  }

  async getBoardById(id: number): Promise<Board> {
    const found = await this.findOneBy({ id: id });

    if (!found) {
      throw new NotFoundException(`Can't find Board with id ${id}`);
    }
    return found;
  }
  async createBoard(
    createBoardDto: CreateBoardDto,
    user: User,
  ): Promise<Board> {
    const { title, description } = createBoardDto;
    const board = this.create({
      title,
      description,
      status: BoardStatus.PUBLIC,
      user,
    });

    await this.save(board);
    return board;
  }

  // async deleteBoard(id: number, user: User): Promise<void> {
  //   const result = await this.delete({ id, user });
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`Can't find Board with id ${id}`);
  //   }
  // }

  async updateBoardStatus(id: number, status: BoardStatus): Promise<Board> {
    const board = await this.getBoardById(id);
    board.status = status;
    await this.save(board);
    return board;
  }
}
