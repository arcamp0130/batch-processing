import type { Queue } from "@structures/index";
import type { OperationNames } from "./math.type";

export type Task = {
  id: number;
  operand1: number;
  operation: OperationNames;
  operand2: number;
  time: number;
  answer?: string;
};

export type Batch = Queue<Task>;
