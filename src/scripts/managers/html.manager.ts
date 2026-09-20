import {
  OperationsSymbols,
  type OperationNames,
  operations,
} from "../types/math.type";
import { Queue } from "@structures/index";
import { type Batch, type Task } from "../types/processing.type";
import { BatchesManager } from "@managers/index";

import { interval, Observable, Subscription } from "rxjs";
import { map as rxjsMap, startWith } from "rxjs/operators";

export default class HTMLManager {
  private static insance: HTMLManager;

  private batchCount: number = 0;
  private htmlCurrentBatch: HTMLElement | undefined;
  public htmlCurrentDoneBatch: HTMLElement | undefined;
  private currentBatchTaskCount: number = 0;
  private currentBatch: Batch | null;
  private taskIds: number[] = [];
  private timeSum: number = 0;

  public static msClockSpeed: number = 500;

  private globalTimer$: Observable<number> | undefined = undefined;
  private taskTimer$: Observable<number> | undefined = undefined;

  public globalTimerSub$: Subscription | undefined = undefined;
  public taskTimerSub$: Subscription | undefined = undefined;

  private readonly titleDisplay: HTMLElement | null;

  private readonly displays: { [key: string]: HTMLElement | null };
  private readonly inputs: { [key: string]: HTMLInputElement | null };
  private readonly buttons: { [key: string]: HTMLButtonElement | null };
  private readonly alert: { [key: string]: HTMLElement | null };
  private readonly tables: { [key: string]: HTMLElement | null };
  private readonly workingTask: { [key: string]: HTMLElement | null };
  private readonly workingSpecs: { [key: string]: HTMLElement | null };
  private readonly stateMessage: { [key: string]: HTMLElement | null };
  private readonly forms: { [key: string]: HTMLElement | null };

  private readonly autoGenCheck: HTMLInputElement | null;

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
      autoAmount: document.querySelector("input#auto-amount"),
    };

    this.buttons = {
      clear: document.querySelector("button#clear-form"),
      addJob: document.querySelector("button#add-job"),
      start: document.querySelector("button#start"),
      autoGenTasks: document.querySelector("button#auto-gen-tasks"),
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

    this.workingSpecs = {
      totalTime: document.querySelector("span#work-total-elapsed-time"),
      totalEstimatedTime: document.querySelector("span#work-total-time"),
      remainingTime: document.querySelector("span#work-remaining-time"),
      pendingBatches: document.querySelector("span#work-pending-batches"),
      currentBatch: document.querySelector("span#work-current-batch"),
    };

    this.stateMessage = {
      element: document.querySelector("div.working div.state"),
      text: document.querySelector("div.state span#state-message"),
    };

    this.forms = {
      manual: document.querySelector("div.form div.manual"),
      auto: document.querySelector("div.form div.auto"),
    };

    this.autoGenCheck = document.querySelector("input#auto-gen");

    this.noJobsSpan = document.querySelector("span#no-jobs");
    this.devNameSpan = document.querySelector("span#work-name");

    this.currentBatch = null;

    this.init();
  }

  private clearForm(): void {
    this.hideError();
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

  private appendTask(task: Task): void {
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

    const newRecord = this.batchRecord(task);

    this.timeSum += task.time;

    this.currentBatch?.enqueue(task);

    this.taskIds.push(task.id);
    this.htmlCurrentBatch!.appendChild(newRecord);
  }

  private buildTask(): void {
    this.hideError();
    if (!this.goodData()) return;

    const newTask: Task = {
      id: +this.inputs["processId"]!.value,
      operand1: +this.inputs["operand1"]!.value,
      operation: this.inputs["operation"]!.value as OperationNames,
      operand2: +this.inputs["operand2"]!.value,
      time: +this.inputs["estimatedTime"]!.value,
    };

    this.appendTask(newTask);
    this.clearForm();
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
    this.workingSpecs["totalEstimatedTime"]!.textContent = `${this.timeSum}`;
    this.titleDisplay!.textContent = "Processing";
    this.devNameSpan!.textContent = this.inputs["username"]!.value;

    this.globalTimer$ = interval(HTMLManager.msClockSpeed).pipe(
      startWith(0),
      rxjsMap((val) => val + 1),
    );

    this.globalTimerSub$ = this.globalTimer$.subscribe((count) => {
      this.workingSpecs["totalTime"]!.textContent = `${count}`;
      this.workingSpecs["remainingTime"]!.textContent =
        `${this.timeSum - count}`;
    });

    BatchesManager.Instance.getControl();
  }

  private randIntInRange(min: number, max: number): number {
    const _min = Math.floor(min);
    const _max = Math.floor(max);

    return Math.floor(Math.random() * (_max - _min) + _min);
  }

  private get randomOperation(): OperationNames {
    const index: number = Math.floor(Math.random() * operations.length);
    return operations[index]!;
  }

  private get randomTask(): Task {
    let randId: number;

    do
      randId = this.randIntInRange(1, 9999); // artibrary max value
    while (this.taskIds.includes(randId));

    const task: Task = {
      id: randId,
      operand1: this.randIntInRange(0, 99), // artibrary max value
      operation: this.randomOperation,
      operand2: this.randIntInRange(0, 99), // artibrary max value
      time: this.randIntInRange(5, 20),
    };

    return task;
  }

  private async generateTasks(): Promise<void> {
    this.hideError();

    if (
      this.inputs["autoAmount"]!.value == "" || // empty
      isNaN(+this.inputs["autoAmount"]!.value) || // NaN
      +this.inputs["autoAmount"]!.value <= 0 // <= 0
    ) {
      this.showError(
        "What should I do?",
        "You forgot or incorrectly wrote the tasks amount to generate",
      );
      return;
    }

    let i = 0;
    while (i < +this.inputs["autoAmount"]!.value) {
      this.appendTask(this.randomTask);
      await new Promise((resolve) => setTimeout(resolve, 10))
      i++;
    }
  }

  private addListeners(): void {
    this.buttons["clear"]!.addEventListener("click", () => this.clearForm());
    this.buttons["addJob"]!.addEventListener("click", () => this.buildTask());
    this.buttons["start"]!.addEventListener("click", () =>
      this.startProcessing(),
    );
    this.buttons["autoGenTasks"]!.addEventListener("click", () =>
      this.generateTasks(),
    );

    this.autoGenCheck!.addEventListener("change", () => {
      if (this.autoGenCheck!.checked) {
        this.forms["manual"]!.style.display = "none";
        this.forms["auto"]!.style.display = "block";
      } else {
        this.forms["manual"]!.style.display = "block";
        this.forms["auto"]!.style.display = "none";
      }
    });
  }

  private init(): void {
    this.addListeners();
  }

  private batchRecord(task: Task): HTMLElement {
    const record: HTMLElement = document.createElement("div");
    record.classList.add("record");

    const idSpan: HTMLElement = document.createElement("span");
    const operationSpan: HTMLElement = document.createElement("span");
    const resultSpan: HTMLElement = document.createElement("span");
    const timeSpan: HTMLElement = document.createElement("span");

    idSpan.textContent = `${task.id}`;
    operationSpan.textContent = `${task.operand1} ${OperationsSymbols[task.operation]} ${task.operand2}`;
    timeSpan.textContent = `${task.time}`;
    if (task.answer) {
      if (task.answer == "ERROR") resultSpan.setAttribute("error", "true");
      resultSpan.textContent = task.answer;
    }

    record.appendChild(idSpan);
    record.appendChild(operationSpan);
    if (task.answer) record.appendChild(resultSpan);
    record.appendChild(timeSpan);

    return record;
  }

  private batchLayout(num?: Number): HTMLElement {
    const batch: HTMLElement = document.createElement("div");
    batch.classList.add("batch");
    batch.id = `#batch-${num ? `${num}-done` : this.batchCount}`;

    const header: HTMLElement = document.createElement("span");
    header.classList.add("header");
    header.textContent = `Batch ${num ? num : this.batchCount}`;

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
      `${task.operand1} ${OperationsSymbols[task.operation]} ${task.operand2}`;

    this.taskTimer$ = interval(HTMLManager.msClockSpeed).pipe(
      startWith(0),
      rxjsMap((val) => val + 1),
    );
    this.taskTimerSub$ = this.taskTimer$.subscribe(
      (count) => (this.workingTask["elapsedTime"]!.textContent = `${count}`),
    );

    this.workingTask["estimatedTime"]!.textContent = `${task.time}`;
  }

  public updateDoneTask(task: Task) {
    this.htmlCurrentDoneBatch!.appendChild(this.batchRecord(task));
  }

  public appendDoneBatch(num: Number) {
    this.htmlCurrentDoneBatch = this.batchLayout(num);
    this.tables["done"]!.appendChild(this.htmlCurrentDoneBatch);
  }

  public updatePending(batchNum: Number, currentBatch: Number) {
    this.workingSpecs["currentBatch"]!.textContent = `${currentBatch}`;
    this.workingSpecs["pendingBatches"]!.textContent = `${batchNum}`;
  }

  public setDone() {
    this.stateMessage["element"]!.setAttribute("done", "");
    this.stateMessage["text"]!.textContent = "Finished!";
  }
}
