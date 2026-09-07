import { Queue } from "@structures/index";
import { type Batch } from "../types/processing.type";

export default class BatchesManager {
  private static insance: BatchesManager;
  private batches: Queue<Batch>;
  private currentBatch: Batch | null = null;

  // singleton design pattern
  public static get Instance(): BatchesManager {
    if (!BatchesManager.insance) {
      BatchesManager.insance = new BatchesManager();
    }
    return BatchesManager.insance;
  }

  constructor() {
    this.batches = new Queue<Batch>();
  }

  public recieveBatch(batch: Batch): void {
    this.batches.enqueue(batch);
  }

  public getControl()
  {

  }
}
