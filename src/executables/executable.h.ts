/**
 * Main Interface for executable classes, which get invocted at `index.ts`-level. The Interfaces mostly is used as a ref point for array structures and for a unified method `start` to begin the class routine.
 */
export interface Executable {
  /**
   * This function defines the main entrypoint for classses implementing the interface. This function should start the main routine of the class.
   */
  start(): void;
}
