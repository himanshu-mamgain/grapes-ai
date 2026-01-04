export type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

export interface Grape<Input, Output> {
    process(input: Input): Promise<Result<Output, Error>>;
}
