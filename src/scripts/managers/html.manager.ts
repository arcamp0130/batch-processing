import { Operations, type OperationNames } from "../types/math.type";

export default class HTMLManager {
  private static insance: HTMLManager;

  private batchCount: number = 0;
  private currentBatchTaskCount: number = 0;
  private taskIds: number[] = [];

  private readonly titleDisplay: HTMLElement | null;
  private readonly displayInput: HTMLElement | null;
  private readonly displayProcess: HTMLElement | null;

  private readonly inputUsername: HTMLInputElement | null;
  private readonly inputProcessId: HTMLInputElement | null;
  private readonly inputOperand1: HTMLInputElement | null;
  private readonly inputOperation: HTMLSelectElement | null;
  private readonly inputOperand2: HTMLInputElement | null;
  private readonly inputEstimatedTime: HTMLInputElement | null;

  private readonly buttonClear: HTMLButtonElement | null;
  private readonly buttonAddJob: HTMLButtonElement | null;
  private readonly buttonStart: HTMLButtonElement | null;

  private readonly alertContainer: HTMLElement | null;
  private readonly alertTitle: HTMLElement | null;
  private readonly alertMessage: HTMLElement | null;

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
    this.displayInput = document.querySelector("div.panel div.input");
    this.displayProcess = document.querySelector("div.panel div.process");

    this.inputUsername = document.querySelector("input#username");
    this.inputProcessId = document.querySelector("input#process-ID");
    this.inputOperand1 = document.querySelector("input#operand1");
    this.inputOperation = document.querySelector("select#operation-type");
    this.inputOperand2 = document.querySelector("input#operand2");
    this.inputEstimatedTime = document.querySelector("input#JTL");

    this.buttonClear = document.querySelector("button#clear-form");
    this.buttonAddJob = document.querySelector("button#add-job");
    this.buttonStart = document.querySelector("button#start");

    this.alertContainer = document.querySelector("div.alert.container");
    this.alertTitle = document.querySelector("h4#alert-title");
    this.alertMessage = document.querySelector("p#alert-message");

    this.noJobsSpan = document.querySelector("span#no-jobs");
    this.previewTable = document.querySelector(
      "div.preview.container div.table",
    );
  }

  private batchHeader(batchId: number): HTMLElement {
    const span: HTMLElement = document.createElement("span");
    span.classList.add("header");
    span.textContent = `Batch ${batchId}`;

    return span;
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

  private batchLayout(batchId: number): HTMLElement {
    const batch: HTMLElement = document.createElement("div");
    batch.classList.add("batch");
    batch.id = `#batch-${batchId}`;

    batch.appendChild(this.batchHeader(batchId));

    return batch;
  }
}
