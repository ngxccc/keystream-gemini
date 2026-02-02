import { existsSync, promises, readFileSync } from "node:fs";
import { join } from "node:path";

const HISTORY_FILE = join(process.cwd(), "history.json");

class StatsService {
  private stats = {
    totalRequests: 0,
    totalSuccess: 0,
    totalErrors: 0,
    dailyStats: {} as Record<string, { requests: number; errors: number }>,
    modelUsage: {} as Record<string, number>,
    keyUsage: {} as Record<string, { requests: number; errors: number }>,
  };

  private saveTimer: NodeJS.Timeout | null = null;

  public initialize() {
    try {
      if (existsSync(HISTORY_FILE)) {
        const raw = readFileSync(HISTORY_FILE, "utf8");
        const parsed = JSON.parse(raw) as typeof this.stats;
        this.stats = { ...this.stats, ...parsed };
        console.log("📊 Stats loaded.");
      } else {
        void this.saveStats();
      }
    } catch (e) {
      console.error("Error loading stats:", e);
    }
  }

  private async saveStats() {
    try {
      await promises.writeFile(
        HISTORY_FILE,
        JSON.stringify(this.stats, null, 2),
      );
    } catch (e) {
      console.error("Error saving stats:", e);
    }
  }

  private scheduleSave() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => void this.saveStats(), 10000);
  }

  public trackRequest(key: string, model: string, isSuccess: boolean) {
    const today = new Date().toLocaleDateString("en-CA");

    this.stats.totalRequests++;
    if (isSuccess) this.stats.totalSuccess++;
    else this.stats.totalErrors++;

    if (!this.stats.dailyStats[today]) {
      this.stats.dailyStats[today] = { requests: 0, errors: 0 };
    }
    this.stats.dailyStats[today].requests++;
    if (!isSuccess) this.stats.dailyStats[today].errors++;

    if (model) {
      const cleanModel = model.replace("models/", "");
      this.stats.modelUsage[cleanModel] =
        (this.stats.modelUsage[cleanModel] || 0) + 1;
    }

    if (key) {
      if (!this.stats.keyUsage[key])
        this.stats.keyUsage[key] = { requests: 0, errors: 0 };
      this.stats.keyUsage[key].requests++;
      if (!isSuccess) this.stats.keyUsage[key].errors++;
    }

    this.scheduleSave();
  }

  public getStats() {
    return { ...this.stats };
  }
}

export const statsService = new StatsService();
