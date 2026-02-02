import envConfig from "@/config/config";
import { PrismaClient } from "@/generated/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import type { ApiKeyDTO } from "@shared/types";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export class KeyService {
  public async getAndLockOptimalKey(): Promise<string | null> {
    const now = BigInt(Date.now());
    const cooldownTime = BigInt(envConfig.KEY_COOLDOWN_TIME);

    return await prisma.$transaction(async (tx) => {
      const candidate = await tx.apiKey.findFirst({
        where: {
          OR: [
            { status: "active" },
            { status: "cooldown", lastUsed: { lt: now - cooldownTime } },
          ],
        },
        orderBy: { lastUsed: "asc" },
      });

      if (!candidate) return null;

      await tx.apiKey.update({
        where: { key: candidate.key },
        data: {
          status: "active",
          lastUsed: now,
          usage: { increment: 1 },
        },
      });

      return candidate.key;
    });
  }

  public async updateKeyStatus(key: string, status: string) {
    await prisma.apiKey.update({
      where: { key },
      data: {
        status,
        lastUsed:
          status === "active" || status === "cooldown"
            ? BigInt(Date.now())
            : undefined,
      },
    });
  }

  // 4. Tăng usage/errors
  public async incrementUsage(key: string, isError: boolean) {
    await prisma.apiKey.update({
      where: { key },
      data: {
        usage: { increment: 1 },
        errors: isError ? { increment: 1 } : undefined,
      },
    });
  }

  // 5. Thêm key mới (API /api/keys)
  public async addKey(key: string): Promise<boolean> {
    try {
      await prisma.apiKey.create({
        data: { key },
      });
      return true;
    } catch (e) {
      console.log(e);
      return false; // Lỗi trùng key
    }
  }

  public async getAllKeys(): Promise<ApiKeyDTO[]> {
    const keys = await prisma.apiKey.findMany();

    // Map dữ liệu (TypeScript tự hiểu 'k' là ApiKey, không cần ép kiểu any)
    return keys.map((k) => ({
      ...k,
      lastUsed: Number(k.lastUsed), // TypeScript cho phép convert BigInt -> Number
    }));
  }
}

export const keyService = new KeyService();
