import { Operations, type OperationNames } from "../types/math.type";
import { Queue } from "@structures/index";
import { type Batch, type Task } from "../types/processing.type";
import { BatchesManager } from "@managers/index";

export default class HTMLManager {
  private static insance: HTMLManager;

  private batchCount: number = 0;
  private htmlCurrentBatch: HTMLElement | undefined;
  private currentBatchTaskCount: number = 0;
  private currentBatch: Batch | null;
  private taskIds: number[] = [];

  private readonly titleDisplay: HTMLElement | null;

  private readonly displays: { [key: string]: HTMLElement | null };
  private readonly inputs: { [key: string]: HTMLInputElement | null };
  private readonly buttons: { [key: string]: HTMLButtonElement | null };
  private readonly alert: { [key: string]: HTMLElement | null };
  private readonly tables: { [key: string]: HTMLElement | null };
  private readonly workingTask: { [key: string]: HTMLElement | null };

  private readonly noJobsSpan: HTMLElement | null;

  private readonly devNameSpan: HTMLElement | null;

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
      input: document.querySelector("div.panel div.input"),
      process: document.querySelector("div.panel div.process"),
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

    this.tables = {
      preview: document.querySelector("div.preview.container div.table"),
      queue: document.querySelector("div.queue.container div.batch.permanent"),
      done: document.querySelector("div.done.container div.table"),
    };

    this.workingTask = {
      batch: document.querySelector("span#work-batch-num"),
      id: document.querySelector("span#work-process-id"),
      job: document.querySelector("span#work-job-spec"),
      elapsedTime: document.querySelector("span#work-elapsed-time"),
      estimatedTime: document.querySelector("span#work-estimated-time"),
    };

    this.noJobsSpan = document.querySelector("span#no-jobs");
    this.devNameSpan = document.querySelector("span#work-name");

    this.currentBatch = null;

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
      this.showError("Pay attention!", "This ID already exists.");
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

  private sendBatch(): void {
    BatchesManager.Instance.recieveBatch(this.currentBatch!);
  }

  private newBatch(): void {
    this.batchCount++;
    this.htmlCurrentBatch = this.batchLayout();
    this.tables["preview"]!.appendChild(this.htmlCurrentBatch);
    this.currentBatch = new Queue<Task>();
  }

  private addTask(): void {
    this.hideError();
    if (!this.goodData()) return;

    if (this.batchCount === 0) {
      this.noJobsSpan!.style.display = "none";
      this.tables["preview"]!.style.display = "block";
      this.newBatch();
    }

    if (this.currentBatchTaskCount === 5) {
      this.currentBatchTaskCount = 0;
      this.sendBatch();
      this.newBatch();
    }

    this.currentBatchTaskCount++;

    const newTask: Task = {
      id: +this.inputs["processId"]!.value,
      operand1: +this.inputs["operand1"]!.value,
      operation: this.inputs["operation"]!.value as OperationNames,
      operand2: +this.inputs["operand2"]!.value,
      time: +this.inputs["estimatedTime"]!.value,
    };
    const newRecord = this.batchRecord(newTask);

    this.currentBatch?.enqueue(newTask);

    this.taskIds.push(+this.inputs["processId"]!.value);
    this.htmlCurrentBatch!.appendChild(newRecord);
  }

  private startProcessing(): void {
    this.hideError();

    if (this.batchCount == 0) {
      this.showError("What did you do?", "There are no batches to send");
      return;
    }

    this.sendBatch();

    this.displays["input"]!.style.display = "none";
    this.displays["process"]!.style.display = "grid";
    this.titleDisplay!.textContent = "Processing";
    this.devNameSpan!.textContent = this.inputs["username"]!.value;

    BatchesManager.Instance.getControl();
  }

  private addListeners(): void {
    this.buttons["clear"]!.addEventListener("click", () => this.clearForm());
    this.buttons["addJob"]!.addEventListener("click", () => this.addTask());
    document.addEventListener("keydown", (event) => {
      if (event.key == "Enter") this.addTask();
    });
    this.buttons["start"]!.addEventListener("click", () =>
      this.startProcessing(),
    );
  }

  private init(): void {
    this.addListeners();
  }

  private batchRecord(task: Task): HTMLElement {
    const record: HTMLElement = document.createElement("div");
    record.classList.add("record");

    const idSpan: HTMLElement = document.createElement("span");
    const operationSpan: HTMLElement = document.createElement("span");
    const timeSpan: HTMLElement = document.createElement("span");

    idSpan.textContent = `${task.id}`;
    operationSpan.textContent = `${task.operand1} ${Operations[task.operation]} ${task.operand2}`;
    timeSpan.textContent = `${task.time} s`;

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

  public screenDequeue() {
    const queueTable: HTMLElement = this.tables["queue"]!;
    queueTable.removeChild(queueTable.firstElementChild!);
  }

  public screenEnqueue(task: Task) {
    this.tables["queue"]!.appendChild(this.batchRecord(task));
  }

  public screenUpdateCurrent(task: Task, batchNum: number) {
    this.workingTask["batch"]!.textContent = `${batchNum}`;
    this.workingTask["id"]!.textContent = `${task.id}`;
    this.workingTask["job"]!.textContent =
      `${task.operand1} ${Operations[task.operation]} ${task.operand2}`;
    this.workingTask["elapsedTime"]!.textContent = `0`;
    this.workingTask["estimatedTime"]!.textContent = `${task.time}`;
  }
}
