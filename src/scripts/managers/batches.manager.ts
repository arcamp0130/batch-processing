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

  private solveTask(task: Task): string {
    let answer: string = "ERROR";

    switch (task.operation) {
      case "add":
        answer = `${task.operand1 + task.operand2}`;
        break;
      case "substract":
        answer = `${task.operand1 - task.operand2}`;
        break;
      case "multiply":
        answer = `${task.operand1 * task.operand2}`;
        break;
      case "divide":
        if (task.operand2 !== 0) answer = `${task.operand1 / task.operand2}`;
        break;
      case "module":
        if (task.operand2 !== 0) answer = `${task.operand1 % task.operand2}`;
        break;
    }

    return answer;
  }

  public recieveBatch(batch: Batch): void {
    this.batches.enqueue(batch);
  }

  public async getControl(): Promise<void> {
    const batchesNum: number = this.batches.size;

    while (!this.batches.isEmpty()) {
      this.batchCount++;

      HTMLManager.Instance.updatePending(batchesNum - this.batchCount);
      HTMLManager.Instance.appendDoneBatch(this.batchCount);

      const auxBatch: Batch = this.batches.dequeue()!;

      while (!auxBatch.isEmpty()) {
        const currentTask: Task = auxBatch.dequeue()!;
        HTMLManager.Instance.screenEnqueue(currentTask);
        this.currentBatch.enqueue(currentTask);
      }

      while (!this.currentBatch.isEmpty()) {
        const currentTask: Task = this.currentBatch.dequeue()!;
        HTMLManager.Instance.screenDequeue();
        HTMLManager.Instance.screenUpdateCurrent(currentTask, this.batchCount);
        await sleep(currentTask.time * 1000);
        HTMLManager.Instance.taskTimerSub$!.unsubscribe();

        currentTask.answer = this.solveTask(currentTask);
        HTMLManager.Instance.updateDoneTask(currentTask);
      }
    }
    HTMLManager.Instance.globalTimerSub$!.unsubscribe();
  }
}
