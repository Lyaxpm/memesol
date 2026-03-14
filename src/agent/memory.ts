import type { MemoryRepo } from "../db/repositories/memoryRepo.js";

export class AgentMemory {
  constructor(private repo: MemoryRepo) {}
  recentNotes() {
    return this.repo.recentDecisionNotes(5);
  }
}
