import { Queue } from "@structures/index";
import { type Batch, type Task } from "../types/processing.type";
import HTMLManager from "./html.manager";

export default class BatchesManager {
  private static insance: BatchesManager;
  private batches: Queue<Batch>;
  private currentBatch: Batch = new Queue<Task>();
  private batchCount = 0;

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

  public getControl() {
    while (!this.batches.isEmpty()) {
      this.batchCount++;
      const auxBatch: Batch = this.batches.dequeue()!;
      let currentTask: Task;

      while (!auxBatch.isEmpty()) {
        currentTask = auxBatch.dequeue()!;
        HTMLManager.Instance.screenEnqueue(currentTask);
        this.currentBatch.enqueue(currentTask);
      }
      // must haven't changed
      console.log(this.currentBatch);

      // while (!this.currentBatch.isEmpty()) {

      // }

      HTMLManager.Instance.screenDequeue();
      HTMLManager.Instance.screenUpdateCurrent(
        this.currentBatch!.peek()!,
        this.batchCount,
      );
    }
  }
}
