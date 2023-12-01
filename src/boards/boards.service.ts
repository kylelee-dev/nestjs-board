import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BoardStatus } from './board-status.enum';
import { v1 as uuid } from 'uuid';
import { CreateBoardDto } from './dto/create-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardRepository } from './board.repository';
import { Board } from './board.entity';
import { User } from 'src/auth/user.entity';
@Injectable()
export class BoardsService {
  //Repository Inhjection
  constructor(
    @InjectRepository(BoardRepository)
    private boardRepository: BoardRepository,
  ) {}

  getAllBoards() {
    return this.boardRepository.getAllBoards();
  }

  async getAllBoardsForUser(user: User): Promise<Board[]> {
    const query = this.boardRepository.createQueryBuilder('board');
    query.where('board.userId = :userId', { userId: user.id });

    const boards = await query.getMany();
    return boards;
  }
  getBoardById(id: number): Promise<Board> {
    return this.boardRepository.getBoardById(id);
  }

  createBoard(createBoardDto: CreateBoardDto, user: User): Promise<Board> {
    return this.boardRepository.createBoard(createBoardDto, user);
  }

  async deleteBoard(id: number, user: User): Promise<string> {
    const query = this.boardRepository.createQueryBuilder('board');
    const result = await query
      .delete()
      .where('id = :id AND userId = :userId', { id: id, userId: user.id })
      .execute();
    if (result.affected === 0) {
      throw new UnauthorizedException(
        `You are not authorized to modify Board with id ${id}`,
      );
    }
    return `Board with id ${id} is successfully deleted`;
  }

  updateBoardStatus(id: number, status: BoardStatus) {
    return this.boardRepository.updateBoardStatus(id, status);
  }
}
