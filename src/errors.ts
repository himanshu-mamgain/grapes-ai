export class GrapeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GrapeError';
    }
}

export class ValidationError extends GrapeError {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class ParseError extends GrapeError {
    constructor(message: string) {
        super(message);
        this.name = 'ParseError';
    }
}
