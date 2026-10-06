import { prisma } from '../config/prisma';
import { Comment } from '@prisma/client';

export class CommentRepository {
  async create(issueId: string, authorId: string, content: string) {
    return prisma.comment.create({
      data: {
        issueId,
        authorId,
        content,
      },
      include: {
        author: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async findById(id: string) {
    return prisma.comment.findUnique({
      where: { id },
      include: { author: true, issue: true },
    });
  }

  async findByIssue(issueId: string) {
    return prisma.comment.findMany({
      where: { issueId },
      include: {
        author: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, content: string) {
    return prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.comment.delete({
      where: { id },
    });
  }
}

export const commentRepository = new CommentRepository();
