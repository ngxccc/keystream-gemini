import envConfig from "@/config/config";
import type { ApiKey } from "@/generated";
import { PrismaClient } from "@/generated/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

type ApiKeyDTO = Omit<ApiKey, "lastUsed"> & { lastUsed: number };

export class KeyService {
  public async getOptimalKey(): Promise<string | null> {
    const now = BigInt(Date.now());
    const cooldownTime = BigInt(envConfig.KEY_COOLDOWN_TIME);

    // Ưu tiên 1: Key đang active, sắp xếp theo lastUsed (lâu chưa dùng nhất)
    const activeKey = await prisma.apiKey.findFirst({
      where: { status: "active" },
      orderBy: { lastUsed: "asc" },
    });

    if (activeKey) return activeKey.key;

    // Ưu tiên 2: Key đang cooldown nhưng đã hết hạn cooldown
    // Logic: lastUsed + 60s < now
    const recoveredKey = await prisma.apiKey.findFirst({
      where: {
        status: "cooldown",
        lastUsed: { lt: now - cooldownTime },
      },
    });

    if (recoveredKey) {
      // Auto reset trạng thái active cho key này
      await this.updateKeyStatus(recoveredKey.key, "active");
      return recoveredKey.key;
    }

    return null;
  }

  // 3. Update trạng thái (Thay thế updateKeyStatus)
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
      return false; // Lỗi trùng key
    }
  }

  // Lấy list key (cho Dashboard)
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
