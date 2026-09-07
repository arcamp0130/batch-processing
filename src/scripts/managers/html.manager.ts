import { Operations, type OperationNames } from "../types/math.type";

export default class HTMLManager {
  private static insance: HTMLManager;

  private batchCount: number = 0;
  private htmlCurrentBatch: HTMLElement | undefined;
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
      displayProcess: document.querySelector("div.panel div.process"),
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

    this.init();
  }

  private clearForm(): void {
    this.hideError();
    this.inputs["username"]!.value = "";
    this.inputs["processId"]!.value = "";
    this.inputs["operand1"]!.value = "";
    this.inputs["operand2"]!.value = "";
    this.inputs["operation"]!.value = "add";
    this.inputs["estimatedTime"]!.value = "";
  }

  private hideError(): void {
    this.alert["container"]!.style.display = "none";
  }

  private showError(title: string, message: string) {
    this.alert["container"]!.style.display = "block";
    this.alert["title"]!.textContent = title;
    this.alert["message"]!.textContent = message;
  }

  private goodData(): boolean {
    if (this.inputs["username"]!.value === "") {
      this.showError("Who's this?", "Enter your name to continue");
      return false;
    }

    if (
      this.inputs["processId"]!.value == "" || // empty
      isNaN(+this.inputs["processId"]!.value) || // NaN
      +this.inputs["processId"]!.value <= 0 // <= 0
    ) {
      this.showError(
        "Bad Identifier",
        "You forgot or incorrectly wrote the process ID",
      );
      return false;
    }

    if (this.taskIds.includes(+this.inputs["processId"]!.value)) {
      this.showError(
        "Pay attention!",
        "This ID already exists.",
      );
      return false;
    }

    if (
      this.inputs["operand1"]!.value == "" || // empty
      isNaN(+this.inputs["operand1"]!.value) // NaN
    ) {
      this.showError(
        "Where's the first number?",
        "You forgot or incorrectly wrote the firs operand",
      );
      return false;
    }

    if (
      this.inputs["operand2"]!.value == "" || // empty
      isNaN(+this.inputs["operand2"]!.value) // NaN
    ) {
      this.showError(
        "Where's the second number?",
        "You forgot or incorrectly wrote the second operand",
      );
      return false;
    }

    if (
      this.inputs["estimatedTime"]!.value == "" || // empty
      isNaN(+this.inputs["estimatedTime"]!.value) || // NaN
      +this.inputs["estimatedTime"]!.value <= 0 // <= 0
    ) {
      this.showError(
        "Have no time",
        "You forgot or incorrectly wrote the estimated time",
      );
      return false;
    }

    return true;
  }

  private newBatch(): void {
    this.batchCount++;
    this.htmlCurrentBatch = this.batchLayout();
    this.previewTable!.appendChild(this.htmlCurrentBatch);
    console.log(this.batchCount);
  }

  private addTask(): void {
    this.hideError();
    if (!this.goodData()) return;

    if (this.batchCount === 0) {
      this.noJobsSpan!.style.display = "none";
      this.previewTable!.style.display = "block";
      this.newBatch();
    }

    if (this.currentBatchTaskCount === 5) {
      this.currentBatchTaskCount = 0;
      this.newBatch();
    }

    this.currentBatchTaskCount++;
    const newRecord = this.batchRecord(
      +this.inputs["processId"]!.value,
      +this.inputs["operand1"]!.value,
      this.inputs["operation"]!.value as OperationNames,
      +this.inputs["operand2"]!.value,
      +this.inputs["estimatedTime"]!.value,
    );
    this.taskIds.push(+this.inputs["processId"]!.value);
    this.htmlCurrentBatch!.appendChild(newRecord);
  }

  private startProcessing(): void {
    this.hideError();
  }

  private addListeners(): void {
    this.buttons["clear"]!.addEventListener("click", () => this.clearForm());
    this.buttons["addJob"]!.addEventListener("click", () => this.addTask());
    this.buttons["start"]!.addEventListener("click", () =>
      this.startProcessing(),
    );
  }

  private init(): void {
    this.addListeners();
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
    record.id = `b${this.batchCount}-t${this.currentBatchTaskCount}`;

    const idSpan: HTMLElement = document.createElement("span");
    const operationSpan: HTMLElement = document.createElement("span");
    const timeSpan: HTMLElement = document.createElement("span");

    idSpan.textContent = `${taskId}`;
    operationSpan.textContent = `${fisrtOperand} ${Operations[operation]} ${secondOperand}`;
    timeSpan.textContent = `${estimatedTime} s`;

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
