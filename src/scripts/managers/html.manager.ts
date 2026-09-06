export default class HTMLManager {
    private static insance: HTMLManager;

    // singleton design pattern
    public static get Instance(): HTMLManager {
        if (!HTMLManager.insance) {
            HTMLManager.insance = new HTMLManager();
        }
        return HTMLManager.insance;
    }

    private constructor() {
        console.log("Hello from HTML Manager!")
    }
}