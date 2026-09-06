import { Operations, type OperationNames } from "../types/math.type";

export default class HTMLManager {
  private static insance: HTMLManager;

  private batchCount: number = 0;
  private currentBatchTaskCount: number = 0;
  private taskIds: number[] = [];

  private readonly titleDisplay: HTMLElement | null;

  private readonly displays: { [key: string]: HTMLElement | null };
  private readonly inputs: { [key: string]: HTMLInputElement | null };
  private readonly buttons: { [key: string]: HTMLButtonElement | null };
  private readonly alert: { [key: string]: HTMLElement | null };

  private readonly noJobsSpan: HTMLElement | null;
  private readonly previewTable: HTMLElement | null;

  // singleton design pattern
  public static get Instance(): HTMLManager {
    if (!HTMLManager.insance) {
      HTMLManager.insance = new HTMLManager();
    }
    return HTMLManager.insance;
  }

  private constructor() {
    this.titleDisplay = document.querySelector("span#title-display");

    this.displays = {
      displayInput: document.querySelector("div.panel div.input"),
      displayProcess: document.querySelector("div.panel div.process")
    };
    this.inputs = {
      username: document.querySelector("input#username"),
      processId: document.querySelector("input#process-ID"),
      operand1: document.querySelector("input#operand1"),
      operand2: document.querySelector("input#operand2"),
      operation: document.querySelector("select#operation-type"),
      estimatedTime: document.querySelector("input#JTL"),
    };

    this.buttons = {
      clear: document.querySelector("button#clear-form"),
      addJob: document.querySelector("button#add-job"),
      start: document.querySelector("button#start"),
    };

    this.alert = {
      container: document.querySelector("div.alert.container"),
      title: document.querySelector("h4#alert-title"),
      message: document.querySelector("p#alert-message"),
    };

    this.noJobsSpan = document.querySelector("span#no-jobs");
    this.previewTable = document.querySelector(
      "div.preview.container div.table",
    );
  }

  private batchRecord(
    taskId: number,
    fisrtOperand: number,
    operation: OperationNames,
    secondOperand: number,
    estimatedTime: number,
  ): HTMLElement {
    const record: HTMLElement = document.createElement("div");
    record.classList.add("record");
    record.id = `b${this.batchCount}-e${this.currentBatchTaskCount}`;

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

  private batchLayout(): HTMLElement {
    const batch: HTMLElement = document.createElement("div");
    batch.classList.add("batch");
    batch.id = `#batch-${this.batchCount}`;
    
    const header: HTMLElement = document.createElement("span");
    header.classList.add("header");
    header.textContent = `Batch ${this.batchCount}`;

    batch.appendChild(header);

    return batch;
  }
}
