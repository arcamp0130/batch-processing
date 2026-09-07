import { Queue } from "@structures/index";
import { type Batch, type Task } from "../types/processing.type";
import HTMLManager from "./html.manager";

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

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

  public async getControl(): Promise<void> {
    while (!this.batches.isEmpty()) {
      this.batchCount++;
      const auxBatch: Batch = this.batches.dequeue()!;

      while (!auxBatch.isEmpty()) {
        const currentTask: Task = auxBatch.dequeue()!;
        HTMLManager.Instance.screenEnqueue(currentTask);
        this.currentBatch.enqueue(currentTask);
      }
      // must haven't changed
      console.log(this.currentBatch);

      while (!this.currentBatch.isEmpty()) {
        const currentTask: Task = this.currentBatch.dequeue()!;
        HTMLManager.Instance.screenDequeue();
        HTMLManager.Instance.screenUpdateCurrent(
          currentTask,
          this.batchCount,
        );
        await sleep(currentTask.time * 1000);
        console.log("Task done!");
      }
      console.log("End of tasks")
    
    }
    console.log("End of batches!!")
  }
}
