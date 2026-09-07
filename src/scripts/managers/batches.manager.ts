import { Queue } from "@structures/index";
import { type Batch } from "../types/processing.type";

export default class BatchesManager {
  private static insance: BatchesManager;
  public batches: Queue<Batch> = new Queue<Batch>;
  public currentBatch: Batch | null = null;
  
  // singleton design pattern
  public static get Instance(): BatchesManager {
    if (!BatchesManager.insance) {
      BatchesManager.insance = new BatchesManager();
    }
    return BatchesManager.insance;
  }
}
