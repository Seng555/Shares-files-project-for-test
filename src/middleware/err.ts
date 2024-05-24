export class NoContentError extends Error {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = 204; // Set the status code to 204 (No Content)
    }
}