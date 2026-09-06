import { Operations, type OperationNames } from "../types/math.type";

export default class HTMLManager {
  private static insance: HTMLManager;

  private batchCount: number = 0;
  private taskIds: number[] = [];

  // singleton design pattern
  public static get Instance(): HTMLManager {
    if (!HTMLManager.insance) {
      HTMLManager.insance = new HTMLManager();
    }
    return HTMLManager.insance;
  }

  private static batchHeader(batchId: number): HTMLElement {
    const span: HTMLElement = document.createElement("span.header");
    span.textContent = `Batch ${batchId}`;

    return span;
  }

  private static batchRecord(
    taskId: number,
    fisrtOperand: number,
    operation: OperationNames,
    secondOperand: number,
    estimatedTime: number,
  ): HTMLElement {
    const record: HTMLElement = document.createElement("div");

    const idSpan: HTMLElement = document.createElement("span");
    const operationSpan: HTMLElement = document.createElement("span");
    const timeSpan: HTMLElement = document.createElement("span");

    idSpan.textContent = `${taskId}`;
    operationSpan.textContent = `${fisrtOperand} ${Operations[operation]} ${secondOperand}`;
    timeSpan.textContent = `${estimatedTime}s`;

    record.appendChild(idSpan);
    record.appendChild(operationSpan);
    record.appendChild(timeSpan);

    return record;
  }

  private static batchLayout(batchId: number): HTMLElement {
    const batch: HTMLElement = document.createElement("div");
    batch.classList.add("batch");
    batch.id = `#batch-${batchId}`;

    batch.appendChild(this.batchHeader(batchId));

    return batch;
  }

  private constructor() {
    console.log("Hello from HTML Manager!");
  }
}
