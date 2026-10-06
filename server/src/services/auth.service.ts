import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { generateAccessToken, generateRefreshToken, hashToken, getRefreshTokenExpiry } from '../utils/jwt';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/app-error';

export class AuthService {
  async register(data: { email: string; password: string; name: string; githubUsername?: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(data.name)}`;

    const user = await userRepository.create({
      email: data.email,
      passwordHash,
      name: data.name,
      avatarUrl,
      githubUsername: data.githubUsername,
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    await userRepository.saveRefreshToken(user.id, tokenHash, getRefreshTokenExpiry());

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  }

  async login(data: { email: string; password: string }, userAgent?: string, ipAddress?: string) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);

    await userRepository.saveRefreshToken(user.id, tokenHash, getRefreshTokenExpiry(), userAgent, ipAddress);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, accessToken, refreshToken };
  }

  async refreshToken(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await userRepository.findRefreshToken(tokenHash);

    if (!storedToken || storedToken.revokedAt || new Date() > storedToken.expiresAt) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Token Rotation
    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashToken(newRefreshToken);

    const newRecord = await userRepository.saveRefreshToken(
      storedToken.userId,
      newTokenHash,
      getRefreshTokenExpiry(),
      storedToken.userAgent || undefined,
      storedToken.ipAddress || undefined
    );

    await userRepository.revokeRefreshToken(storedToken.id, newRecord.id);

    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
    });

    const { passwordHash: _, ...safeUser } = storedToken.user;
    return { user: safeUser, accessToken, refreshToken: newRefreshToken };
  }

  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      const storedToken = await userRepository.findRefreshToken(tokenHash);
      if (storedToken) {
        await userRepository.revokeRefreshToken(storedToken.id);
      }
    }
  }

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();
