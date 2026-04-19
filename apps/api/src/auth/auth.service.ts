import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import { UsersService } from "../users/users.service";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

function parseDurationToSeconds(value: string, fallbackSeconds: number): number {
  const match = value.trim().match(/^(\d+)([smhd])$/i);

  if (!match) {
    return fallbackSeconds;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "s":
      return amount;
    case "m":
      return amount * 60;
    case "h":
      return amount * 60 * 60;
    case "d":
      return amount * 60 * 60 * 24;
    default:
      return fallbackSeconds;
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordMatches = await compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const roles = user.roles.map((item: { role: { name: string } }) => item.role.name);

    return this.issueTokens({
      sub: user.id,
      email: user.email,
      roles,
    });
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? "change-me-refresh",
      });

      return this.issueTokens(payload);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private async issueTokens(payload: JwtPayload) {
    const accessTtl = parseDurationToSeconds(process.env.JWT_ACCESS_TTL ?? "15m", 900);
    const refreshTtl = parseDurationToSeconds(process.env.JWT_REFRESH_TTL ?? "7d", 604800);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET ?? "change-me-access",
        expiresIn: accessTtl,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET ?? "change-me-refresh",
        expiresIn: refreshTtl,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: payload.sub,
        email: payload.email,
        roles: payload.roles,
      },
    };
  }
}
